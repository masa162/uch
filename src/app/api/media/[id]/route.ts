import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

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

// R2の署名付きURL生成（閲覧用）
async function generateViewUrl(storageKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: storageKey,
  })

  return await getSignedUrl(r2Client, command, {
    expiresIn: 3600, // 1時間
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック（ゲストも含む）
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const mediaId = params.id

    if (!mediaId) {
      return NextResponse.json({ error: 'メディアIDが必要です' }, { status: 400 })
    }

    // メディア情報を取得
    const mediaFile = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        optimizedFiles: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        tags: {
          orderBy: [
            { source: 'asc' }, // AI tags first
            { confidence: 'desc' },
          ],
        },
      },
    })

    if (!mediaFile) {
      return NextResponse.json({ error: 'メディアが見つかりません' }, { status: 404 })
    }

    // 最適化済みファイルのURL生成
    const optimizedFilesWithUrls = await Promise.all(
      mediaFile.optimizedFiles.map(async (file) => ({
        ...file,
        url: await generateViewUrl(file.storageKey),
      }))
    )

    // オリジナルファイルのURL生成（必要な場合）
    let originalUrl: string | null = null
    try {
      originalUrl = await generateViewUrl(mediaFile.storageKey)
    } catch (error) {
      console.warn('オリジナルファイルのURL生成に失敗しました:', error)
    }

    // 表示用URLの決定（優先度: 中品質 > 高品質 > サムネイル > オリジナル）
    let displayUrl: string | null = null
    let thumbnailUrl: string | null = null

    const mediumQuality = optimizedFilesWithUrls.find(f => f.quality === 'medium')
    const highQuality = optimizedFilesWithUrls.find(f => f.quality === 'high')
    const thumbnail = optimizedFilesWithUrls.find(f => f.quality === 'thumbnail')

    displayUrl = mediumQuality?.url || highQuality?.url || thumbnail?.url || originalUrl
    thumbnailUrl = thumbnail?.url || mediumQuality?.url || displayUrl

    const response = {
      ...mediaFile,
      originalUrl,
      displayUrl,
      thumbnailUrl,
      optimizedFiles: optimizedFilesWithUrls,
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('メディア詳細取得エラー:', error)
    return NextResponse.json(
      { error: 'メディア詳細の取得に失敗しました' },
      { status: 500 }
    )
  }
}