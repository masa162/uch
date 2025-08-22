import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 認証チェック（ゲストも含む）
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // クエリパラメータ取得
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') // 'AI', 'MANUAL', or null for all
    const limit = parseInt(searchParams.get('limit') || '50')

    // タグの使用頻度を取得
    const whereCondition: any = {}
    
    if (source) {
      whereCondition.source = source
    }

    const tagStats = await prisma.mediaTag.groupBy({
      by: ['tag'],
      where: {
        ...whereCondition,
        media: {
          status: 'OPTIMIZED', // 最適化済みメディアのタグのみ
        },
      },
      _count: {
        tag: true,
      },
      orderBy: {
        _count: {
          tag: 'desc',
        },
      },
      take: limit,
    })

    // レスポンス構築
    const tags = tagStats.map(stat => ({
      tag: stat.tag,
      count: stat._count.tag,
    }))

    return NextResponse.json({
      tags,
      total: tags.length,
    })

  } catch (error) {
    console.error('タグ取得エラー:', error)
    return NextResponse.json(
      { error: 'タグ取得に失敗しました' },
      { status: 500 }
    )
  }
}