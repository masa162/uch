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