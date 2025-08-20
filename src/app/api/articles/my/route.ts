import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // 自分の記事一覧を取得
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          authorId: session.user.id
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          content: true,
          pubDate: true,
          heroImageUrl: true,
          tags: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.article.count({
        where: {
          authorId: session.user.id
        }
      })
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
    console.error('自分の記事取得エラー:', error)
    return NextResponse.json({ error: '記事の取得に失敗しました' }, { status: 500 })
  }
}