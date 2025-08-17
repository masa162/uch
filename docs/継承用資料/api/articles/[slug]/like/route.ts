import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// いいねの状態とカウントを取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    // 記事を取得
    const article = await prisma.article.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // いいね総数
    const likeCount = await prisma.like.count({
      where: {
        articleId: article.id
      }
    })

    // 現在のユーザーがいいねしているか確認
    let isLiked = false
    if (session.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (user) {
        const existingLike = await prisma.like.findUnique({
          where: {
            articleId_userId: {
              articleId: article.id,
              userId: user.id
            }
          }
        })
        isLiked = !!existingLike
      }
    }

    return NextResponse.json({
      likeCount,
      isLiked
    })

  } catch (error) {
    console.error('Like GET API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// いいねの追加/削除
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    // 記事を取得
    const article = await prisma.article.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 既存のいいねを確認
    const existingLike = await prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: user.id
        }
      }
    })

    let isLiked: boolean
    
    if (existingLike) {
      // いいねを削除
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      })
      isLiked = false
    } else {
      // いいねを追加
      await prisma.like.create({
        data: {
          articleId: article.id,
          userId: user.id
        }
      })
      isLiked = true
    }

    // 新しいいいね数を取得
    const likeCount = await prisma.like.count({
      where: {
        articleId: article.id
      }
    })

    return NextResponse.json({
      likeCount,
      isLiked
    })

  } catch (error) {
    console.error('Like POST API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}