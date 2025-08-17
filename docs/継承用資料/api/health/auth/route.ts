import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // NextAuth設定確認
    const hasAuthConfig = !!(authOptions?.providers?.length)
    
    // 環境変数確認
    const hasSecrets = !!(
      process.env.NEXTAUTH_SECRET &&
      process.env.NEXTAUTH_URL &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    // セッション機能テスト（エラーハンドリング付き）
    let sessionTest = false
    try {
      await getServerSession(authOptions)
      sessionTest = true
    } catch (error) {
      console.error('Session test failed:', error)
      sessionTest = false
    }
    
    const responseTime = Date.now() - startTime

    const authHealth = {
      status: hasAuthConfig && hasSecrets && sessionTest ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        authConfig: hasAuthConfig,
        secrets: hasSecrets,
        sessionHandler: sessionTest,
        providers: authOptions?.providers?.map((p: { id: string }) => p.id) || []
      }
    }

    const statusCode = authHealth.status === 'healthy' ? 200 : 503

    return NextResponse.json(authHealth, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Auth health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Authentication system check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}