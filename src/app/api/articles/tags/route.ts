import type { Session } from 'next-auth'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 過去に使用されたタグを取得（使用頻度順）
    const articles = await prisma.article.findMany({
      select: {
        tags: true,
      },
      where: {
        tags: {
          isEmpty: false
        }
      }
    })

    // タグの使用頻度をカウント
    const tagCount: { [key: string]: number } = {}
    articles.forEach(article => {
      article.tags.forEach(tag => {
        if (typeof tag === 'string') {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        }
      })
    })

    // 頻度順にソートして上位20個を取得
    const sortedTags = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag]) => tag)

    return NextResponse.json({
      tags: sortedTags,
      totalCount: Object.keys(tagCount).length
    })

  } catch (error) {
    console.error('Tags API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}