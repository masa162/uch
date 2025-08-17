# タスク詳細: TSK-024

**ID**: `TSK-024`
**タイトル**: ヘルスチェックAPIの実装
**ステータス**: 未着手
**優先度**: 低

## 1. タスクの目的

アプリケーション、認証、データベースのヘルスチェックAPIを実装し、システムの稼働状況を外部から監視できるようにする。

## 2. 手順

以下のファイルを、`/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/api/health/` ディレクトリに新規作成し、それぞれ指定された内容をコピー＆ペーストしてください。

*注意: `src/app/api/health/` およびそのサブディレクトリが存在しない場合は、作成してください。*

### 2.1. `src/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 基本ヘルスチェック
export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || 'unknown',
      checks: {
        database: false,
        memory: {},
        disk: false
      }
    }

    // データベース接続確認
    try {
      await prisma.$executeRaw`SELECT 1`
      healthCheck.checks.database = true
    } catch (error) {
      console.error('Database health check failed:', error)
      healthCheck.checks.database = false
    }

    // メモリ使用量確認
    const memoryUsage = process.memoryUsage()
    healthCheck.checks.memory = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024) // MB
    }

    // 全体ステータス判定
    const allChecksOk = healthCheck.checks.database
    
    return NextResponse.json(
      healthCheck,
      { 
        status: allChecksOk ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    )

  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error'
      },
      { status: 503 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

### 2.2. `src/app/api/health/auth/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

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
```

### 2.3. `src/app/api/health/db/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const startTime = Date.now()
    
    // データベース接続テスト
    await prisma.$executeRaw`SELECT 1`
    
    // ユーザーテーブル確認（存在確認のみ）
    const userCount = await prisma.user.count()
    
    const responseTime = Date.now() - startTime

    const dbHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        connection: true,
        userTable: true,
        userCount: userCount
      }
    }

    return NextResponse.json(dbHealth, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Database health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

## 3. 完了の定義

*   `src/app/api/health/` ディレクトリ内に上記3つのファイルが作成されていること。

## 4. 検証方法

PMがファイル内容を読み取り、意図通りに作成されていることを確認する。
