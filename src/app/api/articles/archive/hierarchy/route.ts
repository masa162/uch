import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 公開済みの記事を取得
    const articles = await prisma.article.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        pubDate: true,
      },
      orderBy: {
        pubDate: 'desc',
      },
    })

    // 年・月・記事の階層構造を作成
    const hierarchy: { [year: string]: { [month: string]: Array<{ id: string; title: string; slug: string; pubDate: Date }> } } = {}

    articles.forEach(article => {
      const date = new Date(article.pubDate)
      const year = date.getFullYear().toString()
      const month = String(date.getMonth() + 1).padStart(2, '0')

      if (!hierarchy[year]) {
        hierarchy[year] = {}
      }
      if (!hierarchy[year][month]) {
        hierarchy[year][month] = []
      }

      hierarchy[year][month].push({
        id: article.id,
        title: article.title,
        slug: article.slug,
        pubDate: article.pubDate,
      })
    })

    // 年と月を降順でソート
    const sortedHierarchy = Object.keys(hierarchy)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .reduce((acc, year) => {
        acc[year] = Object.keys(hierarchy[year])
          .sort((a, b) => parseInt(b) - parseInt(a))
          .reduce((monthAcc, month) => {
            monthAcc[month] = hierarchy[year][month]
            return monthAcc
          }, {} as { [month: string]: Array<{ id: string; title: string; slug: string; pubDate: Date }> })
        return acc
      }, {} as { [year: string]: { [month: string]: Array<{ id: string; title: string; slug: string; pubDate: Date }> } })

    return NextResponse.json({ hierarchy: sortedHierarchy })
  } catch (error) {
    console.error('Hierarchy archive API error:', error)
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
