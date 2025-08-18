import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

// いいね！API
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // ゲストユーザーの書き込み権限チェック
    if (session.user.role === Role.GUEST) {
      return NextResponse.json(
        { message: '権限がありません' },
        { status: 403 }
      )
    }

    const { slug } = params

    const article = await prisma.article.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    // 既にいいねしているか確認
    const existingLike = await prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: session.user.id,
        }
      }
    })

    if (existingLike) {
      return NextResponse.json(
        { message: '既にいいねしています' },
        { status: 409 } // Conflict
      )
    }

    const like = await prisma.like.create({
      data: {
        articleId: article.id,
        userId: session.user.id,
      }
    })

    return NextResponse.json(like, { status: 201 })
  } catch (error) {
    console.error('Like creation error:', error)
    return NextResponse.json(
      { message: 'いいね！の登録に失敗しました' },
      { status: 500 }
    )
  }
}

// いいね！削除API
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // ゲストユーザーの書き込み権限チェック
    if (session.user.role === Role.GUEST) {
      return NextResponse.json(
        { message: '権限がありません' },
        { status: 403 }
      )
    }

    const { slug } = params

    const article = await prisma.article.findUnique({
      where: { slug }
    })

    if (!article) {
      return NextResponse.json(
        { message: '記事が見つかりません' },
        { status: 404 }
      )
    }

    // いいねしているか確認
    const existingLike = await prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: session.user.id,
        }
      }
    })

    if (!existingLike) {
      return NextResponse.json(
        { message: 'いいねしていません' },
        { status: 404 }
      )
    }

    await prisma.like.delete({
      where: {
        articleId_userId: {
          articleId: article.id,
          userId: session.user.id,
        }
      }
    })

    return NextResponse.json(
      { message: 'いいね！を削除しました' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Like deletion error:', error)
    return NextResponse.json(
      { message: 'いいね！の削除に失敗しました' },
      { status: 500 }
    )
  }
}