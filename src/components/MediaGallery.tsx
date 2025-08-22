'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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
  displayUrl: string | null
  thumbnailUrl: string | null
  optimizedFiles: {
    quality: string
    url: string
    width: number | null
    height: number | null
    fileSize: number | null
    mimeType: string
  }[]
  tags: {
    tag: string
    source: string
    confidence: number | null
  }[]
}

interface MediaGalleryProps {
  className?: string
  limit?: number
  showUploader?: boolean
  userId?: string
}

export default function MediaGallery({ 
  className = '',
  limit = 20,
  showUploader = true,
  userId
}: MediaGalleryProps) {
  const { user } = useAuth()
  const [media, setMedia] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    quality: 'medium',
    tags: [] as string[],
    search: ''
  })
  const [availableTags, setAvailableTags] = useState<{tag: string, count: number}[]>([])
  const [showTagFilter, setShowTagFilter] = useState(false)

  // メディア一覧を取得
  const fetchMedia = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: filters.sortBy,
        quality: filters.quality,
        ...(userId && { userId }),
        ...(filters.tags.length > 0 && { tags: filters.tags.join(',') }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(`/api/media?${params}`)
      
      if (!response.ok) {
        throw new Error('メディアの取得に失敗しました')
      }

      const data = await response.json()
      setMedia(data.media || [])
      setPagination(data.pagination)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // タグ一覧を取得
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/media/tags?limit=100')
      if (response.ok) {
        const data = await response.json()
        setAvailableTags(data.tags || [])
      }
    } catch (error) {
      console.error('タグ取得エラー:', error)
    }
  }

  useEffect(() => {
    fetchMedia(currentPage)
  }, [currentPage, filters, userId])

  useEffect(() => {
    if (user) {
      fetchTags()
    }
  }, [user])

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // フィルター変更時はページをリセット
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    handleFilterChange({ tags: newTags })
  }

  const handleClearTags = () => {
    handleFilterChange({ tags: [] })
  }

  const handleMediaClick = (mediaFile: MediaFile) => {
    setSelectedMedia(mediaFile)
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="text-center p-6 bg-base-200 rounded-lg">
        <p className="text-base-content/70">メディアを表示するにはログインが必要です</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-base-content/70">メディアを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="alert alert-error max-w-md mx-auto">
          <span>⚠️ {error}</span>
        </div>
        <button 
          onClick={() => fetchMedia(currentPage)}
          className="btn btn-primary mt-4"
        >
          再試行
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* フィルター・ソートコントロール */}
      <div className="space-y-4">
        {/* 検索とソート */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center flex-1">
            {/* 検索 */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="ファイル名で検索..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="input input-bordered input-sm w-full"
              />
            </div>

            {/* ソート */}
            <select 
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="select select-bordered select-sm"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
            </select>

            {/* 品質選択 */}
            <select 
              value={filters.quality}
              onChange={(e) => handleFilterChange({ quality: e.target.value })}
              className="select select-bordered select-sm"
            >
              <option value="thumbnail">サムネイル</option>
              <option value="medium">中品質</option>
              <option value="high">高品質</option>
            </select>

            {/* タグフィルタボタン */}
            <button
              onClick={() => setShowTagFilter(!showTagFilter)}
              className={`btn btn-sm ${showTagFilter ? 'btn-primary' : 'btn-outline'}`}
            >
              🏷️ タグ {filters.tags.length > 0 && `(${filters.tags.length})`}
            </button>
          </div>
        </div>

        {/* タグフィルタ */}
        {showTagFilter && (
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">タグで絞り込み</h4>
                {filters.tags.length > 0 && (
                  <button
                    onClick={handleClearTags}
                    className="btn btn-ghost btn-xs"
                  >
                    クリア
                  </button>
                )}
              </div>
              
              {availableTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tagInfo) => (
                    <button
                      key={tagInfo.tag}
                      onClick={() => handleTagToggle(tagInfo.tag)}
                      className={`badge badge-lg ${
                        filters.tags.includes(tagInfo.tag)
                          ? 'badge-primary'
                          : 'badge-outline hover:badge-primary'
                      } cursor-pointer transition-colors`}
                    >
                      {tagInfo.tag} ({tagInfo.count})
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-base-content/70 text-sm">
                  利用可能なタグがありません
                </p>
              )}
            </div>
          </div>
        )}

        {/* 選択中のタグ表示 */}
        {filters.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-base-content/70">選択中のタグ:</span>
            {filters.tags.map((tag) => (
              <div key={tag} className="badge badge-primary gap-2">
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="text-xs hover:bg-primary-focus rounded-full p-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 件数表示 */}
      {pagination && (
        <div className="text-sm text-base-content/70 text-center">
          {pagination.totalCount}件中 {((pagination.currentPage - 1) * pagination.limit) + 1}-
          {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}件を表示
        </div>
      )}

      {/* メディアグリッド */}
      {media.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-2xl font-bold mb-2">メディアがありません</h2>
          <p className="text-base-content/70">最初のファイルをアップロードしてください</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map((mediaFile) => (
            <Link
              key={mediaFile.id}
              href={`/media/${mediaFile.id}`}
              className="group cursor-pointer bg-base-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 block"
            >
              {/* 画像 */}
              <div className="aspect-square relative bg-base-300">
                {mediaFile.thumbnailUrl || mediaFile.displayUrl ? (
                  <Image
                    src={mediaFile.thumbnailUrl || mediaFile.displayUrl || ''}
                    alt={mediaFile.originalFilename}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-4xl">📄</div>
                  </div>
                )}
                
                {/* オーバーレイ情報 */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end">
                  <div className="p-3 text-white text-xs">
                    <p className="font-medium truncate">{mediaFile.originalFilename}</p>
                    <p>{formatFileSize(mediaFile.fileSize)}</p>
                  </div>
                </div>
              </div>

              {/* メタ情報 */}
              <div className="p-3">
                <p className="text-sm font-medium truncate mb-1">
                  {mediaFile.originalFilename}
                </p>
                <div className="flex justify-between items-center text-xs text-base-content/70">
                  <span>{formatDate(mediaFile.createdAt)}</span>
                  {showUploader && (
                    <span>{mediaFile.uploader.name || 'Unknown'}</span>
                  )}
                </div>
                
                {/* タグ */}
                {mediaFile.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mediaFile.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className={`badge badge-xs ${
                          tag.source === 'AI' ? 'badge-primary' : 'badge-outline'
                        }`}
                        title={tag.source === 'AI' ? `AI分析 (信頼度: ${Math.round((tag.confidence || 0) * 100)}%)` : 'ユーザータグ'}
                      >
                        {tag.tag}
                      </span>
                    ))}
                    {mediaFile.tags.length > 2 && (
                      <span className="badge badge-xs badge-ghost">
                        +{mediaFile.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ページネーション */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={!pagination.hasPreviousPage}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              «
            </button>
            
            {/* ページ番号 */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, pagination.currentPage - 2) + i
              if (pageNum > pagination.totalPages) return null
              
              return (
                <button
                  key={pageNum}
                  className={`join-item btn btn-sm ${
                    pageNum === pagination.currentPage ? 'btn-active' : ''
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              )
            })}
            
            <button
              className="join-item btn btn-sm"
              disabled={!pagination.hasNextPage}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedMedia && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-screen">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{selectedMedia.originalFilename}</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setSelectedMedia(null)}
              >
                ✕
              </button>
            </div>

            {/* 画像表示 */}
            <div className="mb-4">
              {selectedMedia.displayUrl && (
                <div className="relative bg-base-300 rounded-lg overflow-hidden">
                  <Image
                    src={selectedMedia.displayUrl}
                    alt={selectedMedia.originalFilename}
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              )}
            </div>

            {/* 品質選択 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {selectedMedia.optimizedFiles.map((file) => (
                <button
                  key={file.quality}
                  className="btn btn-sm btn-outline"
                  onClick={() => window.open(file.url, '_blank')}
                >
                  {file.quality} ({formatFileSize(file.fileSize || 0)})
                </button>
              ))}
            </div>

            {/* メタデータ */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>アップロード日:</strong> {formatDate(selectedMedia.createdAt)}</p>
                <p><strong>ファイルサイズ:</strong> {formatFileSize(selectedMedia.fileSize)}</p>
                <p><strong>MIME Type:</strong> {selectedMedia.mimeType}</p>
              </div>
              <div>
                <p><strong>アップロード者:</strong> {selectedMedia.uploader.name || selectedMedia.uploader.email}</p>
                <p><strong>ステータス:</strong> <span className="badge badge-success">{selectedMedia.status}</span></p>
                <p><strong>品質数:</strong> {selectedMedia.optimizedFiles.length}種類</p>
              </div>
            </div>

            {/* タグ一覧 */}
            {selectedMedia.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">タグ</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMedia.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`badge ${
                        tag.source === 'AI' ? 'badge-primary' : 'badge-outline'
                      }`}
                      title={tag.source === 'AI' ? `AI分析 (信頼度: ${Math.round((tag.confidence || 0) * 100)}%)` : 'ユーザータグ'}
                    >
                      {tag.tag}
                      {tag.source === 'AI' && (
                        <span className="ml-1 text-xs">
                          ({Math.round((tag.confidence || 0) * 100)}%)
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="modal-backdrop" onClick={() => setSelectedMedia(null)}>
            <button>close</button>
          </div>
        </div>
      )}
    </div>
  )
}