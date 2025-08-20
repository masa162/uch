import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import type { Session } from 'next-auth'
import { Role } from '@prisma/client'
import { uploadToR2, generateFileKey } from '@/lib/cloudflare-r2'

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

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ message: 'ファイルがありません' }, { status: 400 })
    }

    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: '対応していないファイル形式です' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ファイルキーを生成
    const fileKey = generateFileKey(file.name, session.user.id)

    // Cloudflare R2にアップロード
    const result = await uploadToR2(
      fileKey,
      buffer,
      file.type,
      {
        originalName: file.name,
        userId: session.user.id,
        uploadedAt: new Date().toISOString(),
      }
    )

    if (!result.success) {
      console.error('R2 upload failed:', result.error)
      return NextResponse.json(
        { message: 'ファイルのアップロードに失敗しました' },
        { status: 500 }
      )
    }

    // マークダウン形式の画像リンクを返す
    const markdownLink = `![${file.name}](${result.url})`

    return NextResponse.json({ 
      url: result.url,
      markdown: markdownLink,
      key: result.key
    }, { status: 201 })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { message: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    )
  }
}