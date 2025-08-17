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

    // 年月別に記事数をカウント
    const articles = await prisma.article.findMany({
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 年月ごとにグループ化
    const archiveData: { [key: string]: number } = {}
    
    articles.forEach(article => {
      const date = new Date(article.createdAt)
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      archiveData[yearMonth] = (archiveData[yearMonth] || 0) + 1
    })

    // ソート済みの配列に変換
    const sortedArchive = Object.entries(archiveData)
      .map(([yearMonth, count]) => ({
        yearMonth,
        count,
        year: parseInt(yearMonth.split('-')[0]),
        month: parseInt(yearMonth.split('-')[1])
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })

    return NextResponse.json({
      archive: sortedArchive,
      totalMonths: sortedArchive.length
    })

  } catch (error) {
    console.error('Archive API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}