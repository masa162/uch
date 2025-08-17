import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.trim() === '') {
      return NextResponse.json({ articles: [] })
    }

    // タイトルと内容から検索
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          {
            title: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            content: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            tags: {
              hasSome: [q]
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        tags: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // 内容を要約（最初の100文字）
    const searchResults = articles.map(article => ({
      ...article,
      content: article.content.slice(0, 100) + (article.content.length > 100 ? '...' : '')
    }))

    return NextResponse.json({
      articles: searchResults,
      query: q,
      count: searchResults.length
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}