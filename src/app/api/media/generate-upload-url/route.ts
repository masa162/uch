import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

// Cloudflare R2 クライアント設定
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME!
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { fileName, fileType, fileSize } = await request.json()

    // バリデーション
    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'ファイル名とファイルタイプが必要です' }, { status: 400 })
    }

    // ファイルサイズチェック
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'ファイルサイズが大きすぎます（最大100MB）' }, { status: 400 })
    }

    // 対応ファイルタイプチェック
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/mov',
      'video/avi'
    ]
    
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ error: 'サポートされていないファイル形式です' }, { status: 400 })
    }

    // ストレージキー生成（originals/ プレフィックス付き）
    const fileExtension = fileName.split('.').pop()
    const storageKey = `originals/${uuidv4()}.${fileExtension}`

    // 署名付きURL生成
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: storageKey,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        'original-filename': fileName,
        'uploader-id': session.user.id,
        'upload-timestamp': new Date().toISOString(),
      },
    })

    const uploadUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600, // 1時間
    })

    return NextResponse.json({
      uploadUrl,
      storageKey,
      expiresIn: 3600,
    })

  } catch (error) {
    console.error('Generate upload URL error:', error)
    return NextResponse.json(
      { error: 'アップロードURL生成に失敗しました' },
      { status: 500 }
    )
  }
}