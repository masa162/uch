import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const { category } = params

    if (!category) {
      return NextResponse.json({ message: 'カテゴリ名が必要です' }, { status: 400 })
    }

    // カテゴリ名で記事を検索
    // Note: 旧プロジェクトではカテゴリとタグが統合されたため、このAPIはタグAPIとほぼ同じロジックになる
    // tagsフィールドにカテゴリ名が含まれる記事を検索
    const articles = await prisma.article.findMany({
      where: {
        tags: {
          has: category,
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
      category,
      articles,
      count: articles.length,
    })
  } catch (error) {
    console.error('Category API error:', error)
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}