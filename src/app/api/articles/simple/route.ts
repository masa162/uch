import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * 簡易POST機能 API
 * 最小限の入力で記事投稿を可能にする
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { content } = await request.json()

    // バリデーション
    if (!content?.trim()) {
      return NextResponse.json(
        { message: '内容を入力してください' },
        { status: 400 }
      )
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { message: '内容は1000文字以内で入力してください' },
        { status: 400 }
      )
    }

    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // タイトル自動生成
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const autoTitle = `${year}年${month}月${day}日の記録`

    // 説明文自動生成（本文の先頭100文字）
    const autoDescription = content.trim().length > 100 
      ? content.trim().substring(0, 97) + '...'
      : content.trim()

    // スラッグ生成（既存システムと同じロジック）
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    
    // その日の記事数を取得して連番を決定
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    const todayArticlesCount = await prisma.article.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    })
    
    const sequenceNumber = String(todayArticlesCount + 1).padStart(3, '0')
    const baseSlug = `${dateStr}${sequenceNumber}`
    
    // 重複チェック
    let slug = baseSlug
    let counter = 1
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // 記事作成（簡易POST仕様）
    const article = await prisma.article.create({
      data: {
        title: autoTitle,
        slug,
        content: content.trim(),
        description: autoDescription,
        tags: [], // 簡易POSTではタグなし
        heroImageUrl: null, // 簡易POSTでは画像なし
        pubDate: new Date(),
        authorId: user.id,
        isPublished: true,
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

    return NextResponse.json({
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      description: article.description,
      createdAt: article.createdAt,
      message: '投稿が完了しました！'
    }, { status: 201 })

  } catch (error) {
    console.error('Simple post creation error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}