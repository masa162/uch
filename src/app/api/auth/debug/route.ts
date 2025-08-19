import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 環境変数の確認（機密情報は隠す）
    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '設定済み' : '未設定',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '設定済み' : '未設定',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '設定済み' : '未設定',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '設定済み' : '未設定',
      NODE_ENV: process.env.NODE_ENV || '未設定',
    }

    // Google OAuth設定の詳細確認
    const googleConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '未設定',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '設定済み（長さ: ' + process.env.GOOGLE_CLIENT_SECRET.length + '文字）' : '未設定',
      redirectUri: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : 'NEXTAUTH_URLが未設定',
    }

    // 現在のリクエスト情報
    const requestInfo = {
      timestamp: new Date().toISOString(),
      userAgent: 'API Request',
    }

    const debugInfo = {
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      googleOAuth: googleConfig,
      request: requestInfo,
      recommendations: [
        'NEXTAUTH_URLが正しく設定されているか確認してください',
        'Google Cloud ConsoleでリダイレクトURIが正しく設定されているか確認してください',
        '環境変数が本番環境で正しく読み込まれているか確認してください',
        'ブラウザのキャッシュとクッキーをクリアしてみてください',
      ]
    }

    return NextResponse.json(debugInfo, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Auth debug API error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Debug information could not be retrieved',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
