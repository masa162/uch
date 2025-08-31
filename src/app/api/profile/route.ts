import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        image: true,
        username: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('プロフィール取得エラー:', error)
    return NextResponse.json({ error: 'プロフィールの取得に失敗しました' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // ゲストユーザーの書き込み権限チェック
    if (session.user.role === Role.GUEST) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { displayName, username } = body

    // ユーザー名の重複チェック
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: session.user.id }
        }
      })

      if (existingUser) {
        return NextResponse.json({ error: 'このユーザー名は既に使用されています' }, { status: 400 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: displayName || null,
        username: username || null,
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        image: true,
        username: true,
        createdAt: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('プロフィール更新エラー:', error)
    return NextResponse.json({ error: 'プロフィールの更新に失敗しました' }, { status: 500 })
  }
}