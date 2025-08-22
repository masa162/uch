import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // クエリパラメータ取得
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    // 権限チェック（自分のファイルまたは管理者のみ）
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    // 処理状況を取得
    const statusSummary = await prisma.media.groupBy({
      by: ['status'],
      where: {
        uploaderId: userId,
      },
      _count: {
        status: true,
      },
    })

    // 最近のファイル（最新10件）の詳細状況
    const recentFiles = await prisma.media.findMany({
      where: {
        uploaderId: userId,
      },
      select: {
        id: true,
        originalFilename: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        mimeType: true,
        fileSize: true,
        optimizedFiles: {
          select: {
            quality: true,
            fileSize: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    // 処理中のファイル（PENDING, PROCESSING）
    const processingFiles = await prisma.media.findMany({
      where: {
        uploaderId: userId,
        status: {
          in: ['PENDING', 'PROCESSING'],
        },
      },
      select: {
        id: true,
        originalFilename: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        mimeType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 統計情報の整理
    const stats = {
      total: 0,
      pending: 0,
      processing: 0,
      optimized: 0,
      error: 0,
    }

    statusSummary.forEach((item) => {
      const count = item._count.status
      stats.total += count
      
      switch (item.status) {
        case 'PENDING':
          stats.pending = count
          break
        case 'PROCESSING':
          stats.processing = count
          break
        case 'OPTIMIZED':
          stats.optimized = count
          break
        case 'ERROR':
          stats.error = count
          break
      }
    })

    // 処理状況の詳細メッセージ
    const getStatusMessage = () => {
      if (stats.processing > 0) {
        return `${stats.processing}件のファイルをAI執事が処理中です...`
      }
      if (stats.pending > 0) {
        return `${stats.pending}件のファイルが処理待ちです`
      }
      if (stats.error > 0) {
        return `${stats.error}件のファイルでエラーが発生しています`
      }
      if (stats.optimized > 0) {
        return `${stats.optimized}件のファイルが処理完了しています`
      }
      return 'ファイルをアップロードしてAI執事による最適化をお試しください'
    }

    // 推定残り時間（簡易計算）
    const estimatedTimeRemaining = () => {
      const pendingAndProcessing = stats.pending + stats.processing
      if (pendingAndProcessing === 0) return null
      
      // 1ファイルあたり平均2分として計算
      const averageTimePerFile = 2 // 分
      const totalMinutes = pendingAndProcessing * averageTimePerFile
      
      if (totalMinutes < 60) {
        return `約${totalMinutes}分`
      } else {
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        return `約${hours}時間${minutes > 0 ? minutes + '分' : ''}`
      }
    }

    return NextResponse.json({
      stats,
      message: getStatusMessage(),
      estimatedTimeRemaining: estimatedTimeRemaining(),
      isProcessing: stats.pending > 0 || stats.processing > 0,
      recentFiles: recentFiles.map(file => ({
        id: file.id,
        originalFilename: file.originalFilename,
        status: file.status,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        optimizedCount: file.optimizedFiles.length,
        totalOptimizedSize: file.optimizedFiles.reduce((sum, opt) => sum + (opt.fileSize || 0), 0),
      })),
      processingFiles: processingFiles.map(file => ({
        id: file.id,
        originalFilename: file.originalFilename,
        status: file.status,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        mimeType: file.mimeType,
        processingDuration: Math.floor((new Date().getTime() - new Date(file.status === 'PROCESSING' ? file.updatedAt : file.createdAt).getTime()) / 1000 / 60), // 分
      })),
    })

  } catch (error) {
    console.error('Media status API error:', error)
    return NextResponse.json(
      { error: '処理状況の取得に失敗しました' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}