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