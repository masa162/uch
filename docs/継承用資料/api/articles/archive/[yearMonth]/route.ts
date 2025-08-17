import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ yearMonth: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { yearMonth } = await params
    
    // YYYY-MM形式の検証
    const yearMonthRegex = /^\d{4}-\d{2}$/
    if (!yearMonthRegex.test(yearMonth)) {
      return NextResponse.json({ error: 'Invalid year-month format' }, { status: 400 })
    }

    const [year, month] = yearMonth.split('-').map(Number)
    
    // 指定された年月の開始日と終了日を計算
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const articles = await prisma.article.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 内容を要約（最初の150文字）
    const articlesWithSummary = articles.map(article => ({
      ...article,
      content: article.content.slice(0, 150) + (article.content.length > 150 ? '...' : '')
    }))

    return NextResponse.json({
      articles: articlesWithSummary,
      yearMonth,
      year,
      month,
      count: articlesWithSummary.length
    })

  } catch (error) {
    console.error('Archive detail API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}