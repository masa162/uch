'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import AIAnalysisDisplay from '@/components/AIAnalysisDisplay'
import Image from 'next/image'
import Link from 'next/link'

interface MediaFile {
  id: string
  originalFilename: string
  mimeType: string
  fileSize: number
  status: string
  createdAt: string
  updatedAt: string
  uploader: {
    id: string
    name: string | null
    email: string | null
  }
  originalUrl: string | null
  displayUrl: string | null
  thumbnailUrl: string | null
  optimizedFiles: {
    id: string
    quality: string
    url: string
    width: number | null
    height: number | null
    fileSize: number | null
    mimeType: string
  }[]
  tags: {
    tag: string
    confidence: number | null
    source: string
    createdAt: string
  }[]
}

export default function MediaDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuality, setSelectedQuality] = useState('medium')

  useEffect(() => {
    if (user && params.id) {
      fetchMediaDetail()
    }
  }, [user, params.id])

  const fetchMediaDetail = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/media/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('メディアが見つかりません')
        }
        throw new Error('メディア詳細の取得に失敗しました')
      }

      const data = await response.json()
      setMediaFile(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSelectedFileUrl = (): string | null => {
    if (!mediaFile) return null
    
    const selectedFile = mediaFile.optimizedFiles.find(f => f.quality === selectedQuality)
    return selectedFile?.url || mediaFile.displayUrl
  }

  const getSelectedFileInfo = () => {
    if (!mediaFile) return null
    
    const selectedFile = mediaFile.optimizedFiles.find(f => f.quality === selectedQuality)
    if (selectedFile) {
      return {
        size: selectedFile.fileSize || 0,
        dimensions: selectedFile.width && selectedFile.height 
          ? `${selectedFile.width} × ${selectedFile.height}` 
          : null,
        quality: selectedFile.quality
      }
    }
    
    return {
      size: mediaFile.fileSize,
      dimensions: null,
      quality: 'original'
    }
  }

  if (!user) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-8">
          <div className="alert alert-error max-w-md mx-auto">
            <span>⚠️ ログインが必要です</span>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-base-content/70">メディアを読み込み中...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-8">
          <div className="alert alert-error max-w-md mx-auto mb-4">
            <span>⚠️ {error}</span>
          </div>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={fetchMediaDetail}
              className="btn btn-primary"
            >
              再試行
            </button>
            <Link href="/gallery" className="btn btn-outline">
              ギャラリーに戻る
            </Link>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (!mediaFile) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-8">
          <div className="alert alert-warning max-w-md mx-auto">
            <span>メディアが見つかりません</span>
          </div>
          <Link href="/gallery" className="btn btn-outline mt-4">
            ギャラリーに戻る
          </Link>
        </div>
      </AuthenticatedLayout>
    )
  }

  const selectedUrl = getSelectedFileUrl()
  const fileInfo = getSelectedFileInfo()

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* ナビゲーション */}
        <div className="breadcrumbs text-sm">
          <ul>
            <li><Link href="/gallery">📷 ギャラリー</Link></li>
            <li className="text-base-content/60">メディア詳細</li>
          </ul>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* メイン画像エリア */}
          <div className="lg:col-span-2 space-y-4">
            {/* 品質選択 */}
            {mediaFile.optimizedFiles.length > 0 && (
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">📸 {mediaFile.originalFilename}</h2>
                <select 
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                  className="select select-bordered select-sm"
                >
                  {mediaFile.optimizedFiles.map((file) => (
                    <option key={file.quality} value={file.quality}>
                      {file.quality === 'thumbnail' ? 'サムネイル' : 
                       file.quality === 'medium' ? '中品質' : '高品質'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* メディア表示 */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-4">
                {selectedUrl && (
                  <div className="relative bg-base-200 rounded-lg overflow-hidden">
                    {mediaFile.mimeType.startsWith('image/') ? (
                      <Image
                        src={selectedUrl}
                        alt={mediaFile.originalFilename}
                        width={800}
                        height={600}
                        className="w-full h-auto max-h-96 object-contain"
                        priority
                      />
                    ) : mediaFile.mimeType.startsWith('video/') ? (
                      <video
                        src={selectedUrl}
                        controls
                        className="w-full h-auto max-h-96"
                        preload="metadata"
                      >
                        お使いのブラウザは動画をサポートしていません。
                      </video>
                    ) : (
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <div className="text-6xl mb-4">📄</div>
                          <p className="text-base-content/70">プレビューできません</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* サイドバー情報 */}
          <div className="space-y-6">
            {/* メディア情報 */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <h3 className="card-title text-lg mb-4">📋 ファイル情報</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-base-content/80">ファイル名:</span>
                    <p className="break-all">{mediaFile.originalFilename}</p>
                  </div>
                  <div>
                    <span className="font-medium text-base-content/80">サイズ:</span>
                    <p>{formatFileSize(fileInfo?.size || 0)}</p>
                  </div>
                  {fileInfo?.dimensions && (
                    <div>
                      <span className="font-medium text-base-content/80">解像度:</span>
                      <p>{fileInfo.dimensions}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-base-content/80">形式:</span>
                    <p>{mediaFile.mimeType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-base-content/80">アップロード日時:</span>
                    <p>{formatDate(mediaFile.createdAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-base-content/80">アップロード者:</span>
                    <p>{mediaFile.uploader.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-base-content/80">状態:</span>
                    <div className={`badge ${mediaFile.status === 'OPTIMIZED' ? 'badge-success' : 'badge-warning'} badge-sm`}>
                      {mediaFile.status === 'OPTIMIZED' ? '最適化済み' : mediaFile.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 利用可能な品質 */}
            {mediaFile.optimizedFiles.length > 0 && (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body p-4">
                  <h3 className="card-title text-lg mb-4">🔧 利用可能な品質</h3>
                  <div className="space-y-2">
                    {mediaFile.optimizedFiles.map((file) => (
                      <div key={file.id} className="flex justify-between items-center text-sm">
                        <span className="capitalize">
                          {file.quality === 'thumbnail' ? 'サムネイル' : 
                           file.quality === 'medium' ? '中品質' : '高品質'}
                        </span>
                        <div className="text-xs text-base-content/70">
                          {file.fileSize && formatFileSize(file.fileSize)}
                          {file.width && file.height && (
                            <span className="ml-1">({file.width}×{file.height})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI分析結果表示 */}
        <AIAnalysisDisplay tags={mediaFile.tags} />

        {/* アクションボタン */}
        <div className="flex justify-center gap-4">
          <Link href="/gallery" className="btn btn-outline">
            ← ギャラリーに戻る
          </Link>
          {selectedUrl && (
            <a 
              href={selectedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              📥 ダウンロード
            </a>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}