import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import type { Session } from 'next-auth'
import { Role } from '@prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

// S3クライアントをR2設定で初期化
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // ゲストユーザーの書き込み権限チェック
    if (session.user.role === Role.GUEST) {
      return NextResponse.json(
        { message: '権限がありません' },
        { status: 403 }
      )
    }

    const { fileName, fileType } = await request.json()

    if (!fileName || !fileType) {
      return NextResponse.json(
        { message: 'fileNameとfileTypeが必要です' },
        { status: 400 }
      )
    }

    // ファイルサイズ制限チェック（5MB）
    if (request.headers.get('content-length') && 
        parseInt(request.headers.get('content-length')!) > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイル形式チェック
    const allowedTypes = [
      // 画像
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      // 動画
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
    ]
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { message: '対応していないファイル形式です' },
        { status: 400 }
      )
    }
    
    // ファイル名が重複しないようにユニークなIDを付与
    const uniqueFileName = `${randomUUID()}-${fileName}`

    // 署名付きURLを生成するためのコマンドを作成
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: uniqueFileName,
      ContentType: fileType,
      Metadata: {
        originalName: fileName,
        userId: session.user.id,
        uploadedAt: new Date().toISOString(),
      }
    })

    // 署名付きURLを生成（有効期限は3600秒 = 1時間）
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // 生成したURLとファイル名をクライアントに返す
    return NextResponse.json({
      url: signedUrl,
      fileName: uniqueFileName,
      publicUrl: `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${uniqueFileName}`,
    })

  } catch (error) {
    console.error('Error creating signed URL:', error)
    return NextResponse.json(
      { message: '署名付きURLの生成に失敗しました' },
      { status: 500 }
    )
  }
}
