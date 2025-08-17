import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag: tagParam } = await params
    const tag = decodeURIComponent(tagParam)
    const articles = await prisma.article.findMany({
      where: {
        tags: {
          has: tag,
        },
        isPublished: true,
      },
      orderBy: {
        pubDate: 'desc',
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    })

    if (!articles) {
      return new NextResponse('No articles found', { status: 404 })
    }

    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching articles by tag:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
