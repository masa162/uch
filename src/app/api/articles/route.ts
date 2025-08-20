import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

// 記事投稿API
export async function POST(request: NextRequest) {
  try {
    console.log('Article creation request started')
    
    const session = await getServerSession(authOptions) as Session | null
    console.log('Session:', session ? { id: session.user?.id, email: session.user?.email, role: session.user?.role } : 'No session')
    
    // 開発環境で認証をスキップする場合のダミーユーザー
    const isDevelopmentSkipAuth = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_AUTH === 'true'
    console.log('Development skip auth:', isDevelopmentSkipAuth)
    
    const currentUser = session?.user || (isDevelopmentSkipAuth ? {
      id: 'dev-user',
      email: 'dev@example.com',
      name: '開発ユーザー',
      image: null
    } : null)
    
    console.log('Current user:', currentUser)
    
    if (!currentUser?.email) {
      console.log('No current user email found')
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // ゲストユーザーの書き込み権限チェック
    if (session?.user?.role === Role.GUEST) {
      console.log('Guest user attempted to create article')
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const requestBody = await request.json()
    console.log('Request body:', requestBody)
    
    const { title, content, tags, heroImage, isPublished, description } = requestBody

    // バリデーション
    if (!title?.trim() || !content?.trim()) {
      console.log('Validation failed:', { title: !!title?.trim(), content: !!content?.trim() })
      return NextResponse.json(
        { error: 'タイトルと本文は必須です' },
        { status: 400 }
      )
    }

    console.log('Attempting to find or create user')
    
    // ユーザー取得または作成（開発環境用）
    let user = await prisma.user.findUnique({
      where: { id: currentUser.id }
    })

    if (!user) {
      if (isDevelopmentSkipAuth) {
        console.log('Creating dummy user for development')
        // 開発環境でダミーユーザーを作成
        user = await prisma.user.create({
          data: {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            image: currentUser.image
          }
        })
        console.log('Dummy user created:', user.id)
      } else {
        console.log('User not found and not in development mode')
        return NextResponse.json(
          { error: 'ユーザーが見つかりません' },
          { status: 404 }
        )
      }
    } else {
      console.log('User found:', user.id)
    }

    console.log('Generating slug')
    
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

    console.log('Creating article with slug:', slug)
    
    // 記事作成
    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        heroImageUrl: heroImage?.trim() || null,
        pubDate: new Date(),
        authorId: user.id,
        isPublished: isPublished ?? true,
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

    console.log('Article created successfully:', article.id)
    return NextResponse.json({ article }, { status: 201 })
  } catch (error) {
    console.error('Article creation error:', error)
    
    // より詳細なエラー情報を返す
    let errorMessage = 'サーバーエラーが発生しました'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Prismaエラーの場合
      if (error.message.includes('P2002')) {
        errorMessage = '記事のスラッグが重複しています'
        statusCode = 400
      } else if (error.message.includes('P2003')) {
        errorMessage = 'ユーザーが見つかりません'
        statusCode = 400
      } else if (error.message.includes('P1010')) {
        errorMessage = 'データベース接続エラーが発生しました'
        statusCode = 503
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
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