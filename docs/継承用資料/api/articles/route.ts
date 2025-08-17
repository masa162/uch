import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 記事投稿API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { title, content, description, tags, heroImageUrl } = await request.json()

    // バリデーション
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { message: 'タイトルと本文は必須です' },
        { status: 400 }
      )
    }

    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // スラッグ生成（日付ベース、分かりやすい形式）
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    
    // その日の記事数を取得して連番を決定
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    const todayArticlesCount = await prisma.article.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    })
    
    const sequenceNumber = String(todayArticlesCount + 1).padStart(3, '0')
    const baseSlug = `${dateStr}${sequenceNumber}`
    
    // 重複チェック
    let slug = baseSlug
    let counter = 1
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // 記事作成
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        heroImageUrl: heroImageUrl?.trim() || null,
        pubDate: new Date(),
        authorId: user.id,
        isPublished: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Article creation error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 記事一覧取得API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tag = searchParams.get('tag')
    
    const skip = (page - 1) * limit

    const where = {
      isPublished: true,
      ...(tag && { tags: { has: tag } })
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          }
        },
        orderBy: {
          pubDate: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.article.count({ where })
    ])

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Articles fetch error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}