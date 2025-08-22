import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import type { Session } from 'next-auth'
import { Role } from '@prisma/client'
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

// メディアファイルの情報を保存
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

    const { fileName, originalName, fileType, fileSize, publicUrl, r2Key, metadata } = await request.json()

    if (!fileName || !originalName || !fileType || !fileSize || !publicUrl || !r2Key) {
      return NextResponse.json(
        { message: '必要な情報が不足しています' },
        { status: 400 }
      )
    }

    // メディアファイルの情報をデータベースに保存
    const mediaFile = await prisma.mediaFile.create({
      data: {
        fileName,
        originalName,
        fileType,
        fileSize,
        publicUrl,
        r2Key,
        userId: session.user.id,
        metadata: metadata || {},
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({ mediaFile }, { status: 201 })

  } catch (error) {
    console.error('Media file save error:', error)
    return NextResponse.json(
      { message: 'メディアファイルの保存に失敗しました' },
      { status: 500 }
    )
  }
}

// 最適化済みメディアファイルの一覧を取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック（ゲストも含む）
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // クエリパラメータ取得
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'newest' // newest, oldest
    const quality = searchParams.get('quality') || 'medium' // thumbnail, medium, high
    const userId = searchParams.get('userId') // 特定ユーザーのファイルのみ表示
    const type = searchParams.get('type') // 'legacy' for old MediaFile, 'optimized' for new Media
    const tags = searchParams.get('tags') // タグフィルタ（カンマ区切り）
    const search = searchParams.get('search') // 検索キーワード
    
    const skip = (page - 1) * limit

    // 古いMediaFileテーブルを使用する場合（後方互換性）
    if (type === 'legacy') {
      const where = {
        ...(userId && { userId }),
      }

      const [mediaFiles, total] = await Promise.all([
        prisma.mediaFile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit,
        }),
        prisma.mediaFile.count({ where })
      ])

      return NextResponse.json({
        mediaFiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    }

    // 新しいMediaテーブルを使用（最適化済みファイル）
    const orderBy = sortBy === 'oldest' 
      ? { createdAt: 'asc' as const }
      : { createdAt: 'desc' as const }

    const whereCondition: any = {
      status: 'OPTIMIZED', // 最適化済みファイルのみ
    }

    if (userId) {
      whereCondition.uploaderId = userId
    }

    // 検索キーワードフィルタ
    if (search) {
      whereCondition.originalFilename = {
        contains: search,
        mode: 'insensitive',
      }
    }

    // タグフィルタ
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean)
      if (tagList.length > 0) {
        whereCondition.tags = {
          some: {
            tag: {
              in: tagList,
            },
          },
        }
      }
    }

    // メディア一覧を取得
    const [mediaFiles, totalCount] = await Promise.all([
      prisma.media.findMany({
        where: whereCondition,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          optimizedFiles: {
            where: {
              quality: quality, // 指定された品質のファイルのみ
            },
            take: 1,
          },
          tags: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.media.count({
        where: whereCondition,
      }),
    ])

    // URL生成とレスポンス構築
    const mediaWithUrls = await Promise.all(
      mediaFiles.map(async (media) => {
        let thumbnailUrl = null
        let displayUrl = null

        // 指定品質のファイルURL生成
        if (media.optimizedFiles.length > 0) {
          displayUrl = await generateViewUrl(media.optimizedFiles[0].storageKey)
        }

        // サムネイル用URL（常にthumbnail品質）
        const thumbnailFile = await prisma.mediaOptimized.findFirst({
          where: {
            mediaId: media.id,
            quality: 'thumbnail',
          },
        })

        if (thumbnailFile) {
          thumbnailUrl = await generateViewUrl(thumbnailFile.storageKey)
        }

        // 全品質のファイル情報を取得
        const allOptimizedFiles = await prisma.mediaOptimized.findMany({
          where: { mediaId: media.id },
          orderBy: { quality: 'asc' },
        })

        const optimizedUrls = await Promise.all(
          allOptimizedFiles.map(async (file) => ({
            quality: file.quality,
            url: await generateViewUrl(file.storageKey),
            width: file.width,
            height: file.height,
            fileSize: file.fileSize,
            mimeType: file.mimeType,
          }))
        )

        return {
          id: media.id,
          originalFilename: media.originalFilename,
          mimeType: media.mimeType,
          fileSize: media.fileSize,
          status: media.status,
          createdAt: media.createdAt,
          updatedAt: media.updatedAt,
          uploader: media.uploader,
          displayUrl, // 現在の品質での表示URL
          thumbnailUrl, // サムネイル用URL
          optimizedFiles: optimizedUrls, // 全品質のURL
          tags: media.tags.map(tag => ({
            tag: tag.tag,
            source: tag.source,
            confidence: tag.confidence,
          })),
        }
      })
    )

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      media: mediaWithUrls,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        limit,
      },
      filters: {
        sortBy,
        quality,
        userId,
      },
    })

  } catch (error) {
    console.error('Media API error:', error)
    return NextResponse.json(
      { error: 'メディア一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}
