'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'

interface MediaFile {
  id: string
  fileName: string
  originalName: string
  fileType: string
  fileSize: number
  publicUrl: string
  createdAt: string
  user: {
    id: string
    name: string
    displayName: string | null
    email: string
  }
}

interface MediaGalleryResponse {
  mediaFiles: MediaFile[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function MediaGalleryPage() {
  const { user } = useAuth()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchMediaFiles()
  }, [pagination.page])

  const fetchMediaFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/media?page=${pagination.page}&limit=${pagination.limit}`)
      
      if (!response.ok) {
        throw new Error('メディアファイルの取得に失敗しました')
      }

      const data: MediaGalleryResponse = await response.json()
      setMediaFiles(data.mediaFiles)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isImage = (fileType: string) => fileType.startsWith('image/')
  const isVideo = (fileType: string) => fileType.startsWith('video/')

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

  return (
    <AuthenticatedLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">📁 メディアギャラリー</h1>
            <p className="text-gray-600">アップロードされた画像・動画ファイルの一覧</p>
          </div>
          <Link 
            href="/articles/new"
            className="btn btn-primary"
          >
            ✍️ 記事を書く
          </Link>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* メディアファイル一覧 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-gray-600">まだメディアファイルがアップロードされていません</p>
            <Link href="/articles/new" className="btn btn-primary mt-4">
              記事を書いて画像をアップロード
            </Link>
          </div>
        ) : (
          <>
            {/* ファイル一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mediaFiles.map((file) => (
                <div key={file.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="card-body p-4">
                    {/* ファイルプレビュー */}
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {isImage(file.fileType) ? (
                        <img
                          src={file.publicUrl}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : isVideo(file.fileType) ? (
                        <video
                          src={file.publicUrl}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        <div className="text-4xl text-gray-400">
                          📄
                        </div>
                      )}
                    </div>

                    {/* ファイル情報 */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm truncate" title={file.originalName}>
                        {file.originalName}
                      </h3>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p><strong>サイズ:</strong> {formatFileSize(file.fileSize)}</p>
                        <p><strong>形式:</strong> {file.fileType}</p>
                        <p><strong>アップロード:</strong> {formatDate(file.createdAt)}</p>
                        <p><strong>ユーザー:</strong> {file.user.displayName || file.user.name || file.user.email}</p>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex space-x-2 pt-2">
                        <a
                          href={file.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline flex-1"
                        >
                          👁️ 表示
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(file.publicUrl)}
                          className="btn btn-sm btn-outline"
                          title="URLをコピー"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ページネーション */}
            {pagination.pages > 1 && (
              <div className="flex justify-center">
                <div className="join">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="join-item btn btn-outline"
                  >
                    «
                  </button>
                  
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                      className={`join-item btn ${page === pagination.page ? 'btn-active' : 'btn-outline'}`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                    className="join-item btn btn-outline"
                  >
                    »
                  </button>
                </div>
              </div>
            )}

            {/* 統計情報 */}
            <div className="text-center text-sm text-gray-500">
              全 {pagination.total} ファイル中 {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} を表示
            </div>
          </>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
