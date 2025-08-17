import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 月別アーカイブの集計
    const archives = await prisma.article.groupBy({
      by: ['pubDate'], // pubDateを基準にグループ化
      _count: {
        id: true,
      },
      orderBy: {
        pubDate: 'desc',
      },
    })

    // 年月ごとの集計に変換
    const monthlyArchives: { [key: string]: { year: number; month: number; count: number } } = {}

    archives.forEach(item => {
      const date = new Date(item.pubDate)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // 月は0から始まるため+1

      const key = `${year}-${String(month).padStart(2, '0')}`

      if (!monthlyArchives[key]) {
        monthlyArchives[key] = { year, month, count: 0 }
      }
      monthlyArchives[key].count += item._count.id
    })

    // 配列に変換してソート
    const sortedMonthlyArchives = Object.values(monthlyArchives).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return b.month - a.month
    })

    return NextResponse.json({ archives: sortedMonthlyArchives })
  } catch (error) {
    console.error('Monthly archive API error:', error)
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}