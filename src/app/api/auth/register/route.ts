import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // バリデーション
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'すべての項目を入力してください' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'パスワードは6文字以上で入力してください' },
        { status: 400 }
      )
    }

    // 既存ユーザーチェック
    const existingUser = await prisma.user.findFirst({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      )
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        name,
        // NextAuth.jsでは実際のパスワードはAccountテーブルで管理
        // ここでは一時的に保存（実際の実装ではCredentialsProviderで使用）
      }
    })

    // ユーザー用のアカウントレコードを作成（credentials provider用）
    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.id,
        // ハッシュ化されたパスワードをaccess_tokenに保存（workaround）
        access_token: hashedPassword,
      }
    })

    return NextResponse.json(
      { message: 'アカウントが作成されました' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}