import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { tag: string } }) {
  try {
    const { tag } = params

    if (!tag) {
      return NextResponse.json({ message: 'タグ名が必要です' }, { status: 400 })
    }

    // タグ名で記事を検索
    const articles = await prisma.article.findMany({
      where: {
        tags: {
          has: tag,
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
      tag,
      articles,
      count: articles.length,
    })
  } catch (error) {
    console.error('Tag API error:', error)
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}