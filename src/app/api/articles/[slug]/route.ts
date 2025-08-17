import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 記事詳細取得API
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Article detail fetch error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 記事更新API
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { slug } = params
    const { title, content, description, tags, heroImageUrl, isPublished } = await request.json()

    // 記事の存在確認と所有者チェック
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    if (existingArticle.authorId !== session.user.id) {
      return NextResponse.json(
        { message: '権限がありません' },
        { status: 403 }
      )
    }

    // バリデーション
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { message: 'タイトルと本文は必須です' },
        { status: 400 }
      )
    }

    const updatedArticle = await prisma.article.update({
      where: { slug },
      data: {
        title: title.trim(),
        content: content.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        heroImageUrl: heroImageUrl?.trim() || null,
        isPublished: typeof isPublished === 'boolean' ? isPublished : existingArticle.isPublished,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(updatedArticle)
  } catch (error) {
    console.error('Article update error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// 記事削除API
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { slug } = params

    // 記事の存在確認と所有者チェック
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    if (existingArticle.authorId !== session.user.id) {
      return NextResponse.json(
        { message: '権限がありません' },
        { status: 403 }
      )
    }

    await prisma.article.delete({
      where: { slug }
    })

    return NextResponse.json(
      { message: '記事を削除しました' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Article deletion error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}