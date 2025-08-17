import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // 環境変数からパスワードを取得
    const sitePassword = process.env.NEXT_PUBLIC_SITE_PASSWORD

    if (!sitePassword) {
      console.warn('NEXT_PUBLIC_SITE_PASSWORDが設定されていません。')
      return NextResponse.json({ success: false, message: 'サイトパスワードが設定されていません。' }, { status: 500 })
    }

    if (password === sitePassword) {
      return NextResponse.json({ success: true, message: '認証成功' })
    } else {
      return NextResponse.json({ success: false, message: 'あいことばが違います。' }, { status: 401 })
    }
  } catch (error) {
    console.error('Password check API error:', error)
    return NextResponse.json({ success: false, message: 'サーバーエラーが発生しました。' }, { status: 500 })
  }
}