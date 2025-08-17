import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// コメント投稿API
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { slug } = params
    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { message: 'コメント内容は必須です' },
        { status: 400 }
      )
    }

    const article = await prisma.article.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        articleId: article.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json(
      { message: 'コメントの投稿に失敗しました' },
      { status: 500 }
    )
  }
}

// コメント取得API
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const skip = (page - 1) * limit

    const article = await prisma.article.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { articleId: article.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { articleId: article.id } })
    ])

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json(
      { message: 'コメントの取得に失敗しました' },
      { status: 500 }
    )
  }
}