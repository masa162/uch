import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { storageKey, originalFilename, mimeType, fileSize } = await request.json()

    // バリデーション
    if (!storageKey || !originalFilename || !mimeType) {
      return NextResponse.json({ 
        error: 'storageKey, originalFilename, mimeTypeが必要です' 
      }, { status: 400 })
    }

    // ストレージキーがoriginals/で始まることを確認
    if (!storageKey.startsWith('originals/')) {
      return NextResponse.json({ 
        error: '無効なストレージキーです' 
      }, { status: 400 })
    }

    // DBにメディア情報を記録
    const media = await prisma.media.create({
      data: {
        uploaderId: session.user.id,
        originalFilename,
        storageKey,
        mimeType,
        fileSize: fileSize || null,
        status: 'PENDING', // AI執事による処理待ち
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: media.id,
      originalFilename: media.originalFilename,
      storageKey: media.storageKey,
      status: media.status,
      createdAt: media.createdAt,
      uploader: media.uploader,
      message: 'アップロードが完了しました。最適化処理を開始します。',
    })

  } catch (error) {
    console.error('Upload complete error:', error)
    
    // Prisma エラーの詳細ハンドリング
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: '同じファイルが既にアップロードされています' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'アップロード記録に失敗しました' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}