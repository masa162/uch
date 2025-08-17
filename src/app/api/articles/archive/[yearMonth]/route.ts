import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { yearMonth: string } }) {
  try {
    const { yearMonth } = params // 例: "202308"

    if (!/^\d{6}$/.test(yearMonth)) {
      return NextResponse.json({ message: '無効な年月フォーマットです' }, { status: 400 })
    }

    const year = parseInt(yearMonth.substring(0, 4))
    const month = parseInt(yearMonth.substring(4, 6))

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ message: '無効な年月です' }, { status: 400 })
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // その月の最終日

    const articles = await prisma.article.findMany({
      where: {
        pubDate: {
          gte: startDate,
          lte: endDate,
        },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        pubDate: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        pubDate: 'desc',
      },
    })

    return NextResponse.json({
      year,
      month,
      articles,
      count: articles.length,
    })
  } catch (error) {
    console.error('Archive API error:', error)
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}