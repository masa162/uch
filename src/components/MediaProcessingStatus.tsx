'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface ProcessingFile {
  id: string
  originalFilename: string
  status: string
  createdAt: string
  updatedAt: string
  mimeType: string
  processingDuration: number
}

interface RecentFile {
  id: string
  originalFilename: string
  status: string
  createdAt: string
  updatedAt: string
  mimeType: string
  fileSize: number
  optimizedCount: number
  totalOptimizedSize: number
}

interface StatusData {
  stats: {
    total: number
    pending: number
    processing: number
    optimized: number
    error: number
  }
  message: string
  estimatedTimeRemaining: string | null
  isProcessing: boolean
  recentFiles: RecentFile[]
  processingFiles: ProcessingFile[]
}

interface MediaProcessingStatusProps {
  className?: string
  onProcessingComplete?: () => void
  refreshTrigger?: number
}

export default function MediaProcessingStatus({ 
  className = '',
  onProcessingComplete,
  refreshTrigger
}: MediaProcessingStatusProps) {
  const { user } = useAuth()
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastProcessingCount, setLastProcessingCount] = useState(0)

  const fetchStatus = async () => {
    try {
      setError(null)
      const response = await fetch('/api/media/status')
      
      if (!response.ok) {
        throw new Error('処理状況の取得に失敗しました')
      }

      const data = await response.json()
      setStatusData(data)

      // 処理完了の検知
      if (lastProcessingCount > 0 && (data.stats.pending + data.stats.processing) === 0) {
        onProcessingComplete?.()
      }
      setLastProcessingCount(data.stats.pending + data.stats.processing)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    
    fetchStatus()
    
    // 処理中のファイルがある場合は10秒間隔で更新
    const interval = setInterval(() => {
      if (statusData?.isProcessing) {
        fetchStatus()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [user, refreshTrigger])

  // 外部からのリフレッシュトリガー
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchStatus()
    }
  }, [refreshTrigger])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳'
      case 'PROCESSING':
        return '🔄'
      case 'OPTIMIZED':
        return '✅'
      case 'ERROR':
        return '❌'
      default:
        return '📄'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-warning'
      case 'PROCESSING':
        return 'text-info'
      case 'OPTIMIZED':
        return 'text-success'
      case 'ERROR':
        return 'text-error'
      default:
        return 'text-base-content'
    }
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (minutes: number): string => {
    if (minutes < 1) return '数秒前'
    if (minutes < 60) return `${minutes}分経過`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}時間${remainingMinutes > 0 ? remainingMinutes + '分' : ''}経過`
  }

  if (!user) return null

  if (loading) {
    return (
      <div className={`card bg-base-100 shadow-md ${className}`}>
        <div className="card-body">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>処理状況を確認中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`card bg-base-100 shadow-md ${className}`}>
        <div className="card-body">
          <div className="alert alert-error">
            <span>⚠️ {error}</span>
          </div>
          <button 
            onClick={fetchStatus}
            className="btn btn-sm btn-primary mt-2"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  if (!statusData) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* メイン状況カード */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                🤖 AI執事処理状況
                {statusData.isProcessing && (
                  <div className="animate-pulse">
                    <div className="badge badge-info">処理中</div>
                  </div>
                )}
              </h3>
              <p className="text-base-content/70">{statusData.message}</p>
            </div>
            <button
              onClick={fetchStatus}
              className="btn btn-sm btn-ghost"
              title="状況を更新"
            >
              🔄
            </button>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-title text-xs">合計</div>
              <div className="stat-value text-lg">{statusData.stats.total}</div>
            </div>
            <div className="stat bg-warning/10 rounded-lg p-3">
              <div className="stat-title text-xs">待機中</div>
              <div className="stat-value text-lg text-warning">{statusData.stats.pending}</div>
            </div>
            <div className="stat bg-info/10 rounded-lg p-3">
              <div className="stat-title text-xs">処理中</div>
              <div className="stat-value text-lg text-info">{statusData.stats.processing}</div>
            </div>
            <div className="stat bg-success/10 rounded-lg p-3">
              <div className="stat-title text-xs">完了</div>
              <div className="stat-value text-lg text-success">{statusData.stats.optimized}</div>
            </div>
          </div>

          {/* 推定残り時間 */}
          {statusData.estimatedTimeRemaining && (
            <div className="alert alert-info mt-4">
              <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="font-medium">推定残り時間: {statusData.estimatedTimeRemaining}</div>
                <div className="text-xs mt-1 opacity-80">
                  💡 処理中は他のページに移動しても大丈夫です。AI執事がバックグラウンドで作業を続けます。
                </div>
              </div>
            </div>
          )}

          {/* 処理中でない場合の案内 */}
          {statusData.isProcessing && !statusData.estimatedTimeRemaining && (
            <div className="alert alert-info mt-4">
              <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="font-medium">AI執事が処理中です</div>
                <div className="text-xs mt-1 opacity-80">
                  💡 処理中は他のページに移動しても大丈夫です。完了後にこのページで確認できます。
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 処理中ファイル詳細 */}
      {statusData.processingFiles.length > 0 && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h4 className="font-semibold flex items-center gap-2">
              🔄 現在処理中のファイル
              <div className="badge badge-info">{statusData.processingFiles.length}件</div>
            </h4>
            <div className="space-y-2">
              {statusData.processingFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${getStatusColor(file.status)}`}>
                      {getStatusIcon(file.status)}
                    </span>
                    <div>
                      <p className="font-medium">{file.originalFilename}</p>
                      <p className="text-xs text-base-content/70">
                        {file.mimeType} • {formatDuration(file.processingDuration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${file.status === 'PROCESSING' ? 'badge-info' : 'badge-warning'}`}>
                      {file.status === 'PROCESSING' ? '処理中' : '待機中'}
                    </span>
                    {file.status === 'PROCESSING' && (
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 最近のファイル */}
      {statusData.recentFiles.length > 0 && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h4 className="font-semibold">📋 最近のファイル</h4>
            <div className="space-y-2">
              {statusData.recentFiles.slice(0, 5).map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 hover:bg-base-200 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${getStatusColor(file.status)}`}>
                      {getStatusIcon(file.status)}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{file.originalFilename}</p>
                      <p className="text-xs text-base-content/70">
                        {formatFileSize(file.fileSize)}
                        {file.status === 'OPTIMIZED' && file.optimizedCount > 0 && (
                          <> → {file.optimizedCount}品質 ({formatFileSize(file.totalOptimizedSize)})</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-base-content/70">
                    {new Date(file.updatedAt).toLocaleString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* エラーファイルがある場合 */}
      {statusData.stats.error > 0 && (
        <div className="card bg-error/10 border border-error/20 shadow-md">
          <div className="card-body">
            <h4 className="font-semibold text-error flex items-center gap-2">
              ❌ エラーが発生したファイル
              <div className="badge badge-error">{statusData.stats.error}件</div>
            </h4>
            <p className="text-sm text-base-content/70">
              一部のファイルで処理エラーが発生しています。詳細は管理者にお問い合わせください。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}