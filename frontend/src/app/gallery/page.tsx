'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import UploadWidget from '@/components/UploadWidget'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import ImageViewer from '@/components/ImageViewer'

type MediaItem = {
  id: number
  filename: string
  original_filename: string
  mime_type: string
  file_size: number
  file_url: string
  thumbnail_url: string | null
  width: number | null
  height: number | null
  duration: number | null
  created_at: string
}

// UTF-8 文字列を base64 に安全に変換
function base64EncodeUtf8(input: string): string {
  try {
    return btoa(unescape(encodeURIComponent(input)))
  } catch {
    // それでも失敗する場合は簡易フォールバック
    return btoa(input.replace(/[^\x00-\x7F]/g, '?'))
  }
}

function isVideo(item: MediaItem) {
  return item.mime_type?.startsWith('video/')
}

type ViewMode = 'grid' | 'list'

export default function GalleryPage() {
  console.log('GalleryPage component rendering')
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
  console.log('API Base URL:', apiBase)
  const PAGE_SIZE = 24

  const resolveMediaUrl = (rawUrl: string | null) => {
    if (!rawUrl) return ''
    const trimmed = rawUrl.trim()
    const absolutePattern = /^https?:\/\//i

    if (absolutePattern.test(trimmed)) {
      try {
        const url = new URL(trimmed)
        url.pathname = encodeURI(decodeURIComponent(url.pathname))
        return url.toString()
      } catch {
        return trimmed
      }
    }

    let path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    try {
      path = encodeURI(decodeURIComponent(path))
    } catch {
      path = encodeURI(path)
    }

    return `${apiBase}${path}`
  }

  const getThumbUrl = (item: MediaItem) => {
    if (isVideo(item)) {
      if (item.thumbnail_url) return resolveMediaUrl(item.thumbnail_url)
      return ''
    }
    if (item.thumbnail_url) {
      return resolveMediaUrl(item.thumbnail_url)
    }
    return `${apiBase}/api/media/${item.id}/image`
  }
  const [items, setItems] = useState<MediaItem[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true) // Start with loading true for initial fetch
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [editMode, setEditMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewerImage, setViewerImage] = useState<MediaItem | null>(null)
  const [viewerIndex, setViewerIndex] = useState(0)
  const isFetching = useRef(false) // Ref to prevent concurrent fetches

  // フィルター状態
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    mimeType: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  })

  console.log('GalleryPage initial state - items:', items.length, 'loading:', loading, 'hasMore:', hasMore, 'offset:', offset)

  const fetchMore = useCallback(async (overrideOffset?: number) => {
    console.log('🚀 fetchMore called', {
      overrideOffset,
      currentOffset: offset,
      hasMore,
      isFetching: isFetching.current,
      itemsLength: items.length
    })

    if (isFetching.current) {
      console.log('❌ fetchMore early return - already fetching')
      return
    }

    const isRefresh = typeof overrideOffset === 'number'
    const targetOffset = isRefresh ? overrideOffset : offset

    console.log('🎯 fetchMore parameters', {
      isRefresh,
      targetOffset,
      hasMore,
      PAGE_SIZE
    })

    if (!hasMore && !isRefresh) {
      console.log('❌ fetchMore early return - no more items', { hasMore, isRefresh })
      return
    }

    console.log('✅ fetchMore proceeding with request')
    isFetching.current = true
    setLoading(true)

    try {
      // フィルター条件をクエリパラメータに追加
      const params = new URLSearchParams({
        offset: targetOffset.toString(),
        limit: PAGE_SIZE.toString()
      })

      if (filters.mimeType) params.append('mimeType', filters.mimeType)
      if (filters.search) params.append('search', filters.search)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const apiUrl = `${apiBase}/api/media?${params.toString()}`
      console.log('🌐 Making API request to:', apiUrl, 'with filters:', filters)

      const res = await fetch(apiUrl, { credentials: 'include' })
      console.log('📡 API response status:', res.status)

      if (!res.ok) {
        const errorText = await res.text()
        console.error('❌ Media API error response:', {
          status: res.status,
          statusText: res.statusText,
          errorText
        })
        throw new Error(`HTTP ${res.status}: ${errorText}`)
      }

      const data = (await res.json()) as MediaItem[]
      console.log('✅ Fetched media data:', {
        itemsReceived: data.length,
        targetOffset,
        PAGE_SIZE,
        hasMoreWillBe: data.length === PAGE_SIZE
      })
      console.log('📊 Raw data sample:', data.slice(0, 2))

      if (isRefresh) {
        setItems(data)
        setOffset(data.length)
        setHasMore(data.length === PAGE_SIZE)
        setSelectedItems(new Set())
        console.log('🔄 Refresh complete:', {
          newItemsCount: data.length,
          newOffset: data.length,
          newHasMore: data.length === PAGE_SIZE
        })
      } else {
        setItems(prev => {
          const newItems = [...prev, ...data]
          console.log('📈 Append operation:', {
            previousCount: prev.length,
            appendedCount: data.length,
            totalCount: newItems.length,
            newOffset: prev.length + data.length,
            newHasMore: data.length === PAGE_SIZE
          })
          return newItems
        })
        setOffset(prev => {
          const newOffset = prev + data.length
          console.log('📍 Offset updated:', { from: prev, to: newOffset })
          return newOffset
        })
        setHasMore(data.length === PAGE_SIZE)
        console.log('🔄 HasMore updated to:', data.length === PAGE_SIZE)
      }
    } catch (e) {
      console.error('❌ Error fetching media:', e)
      setHasMore(false) // Stop fetching on error
      console.log('🛑 HasMore set to false due to error')
    } finally {
      setLoading(false)
      isFetching.current = false
      console.log('🏁 fetchMore completed - loading=false, isFetching=false')
    }
  }, [apiBase, offset, hasMore, PAGE_SIZE, filters])

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const refreshGallery = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = null
    }

    void fetchMore(0)

    refreshTimeoutRef.current = setTimeout(() => {
      void fetchMore(0)
      refreshTimeoutRef.current = null
    }, 1500)
  }, [fetchMore])

  const handleImageClick = (item: MediaItem, index: number) => {
    if (editMode) {
      toggleSelection(item.id.toString())
    } else {
      setViewerImage(item)
      setViewerIndex(index)
    }
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const selectAll = () => {
    setSelectedItems(new Set(items.map(item => item.id.toString())))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const handleBulkDownload = async () => {
    if (selectedItems.size === 0) return

    for (const id of Array.from(selectedItems)) {
      const item = items.find(i => i.id.toString() === id)
      if (item) {
        const link = document.createElement('a')
        link.href = resolveMediaUrl(item.file_url)
        link.download = item.original_filename
        link.click()
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return

    if (!confirm(`選択した${selectedItems.size}件のメディアを削除しますか？`)) return

    try {
      for (const id of Array.from(selectedItems)) {
        await fetch(`${apiBase}/api/media/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      }

      // 削除されたアイテムをリストから除外
      setItems(prev => prev.filter(item => !selectedItems.has(item.id.toString())))
      setSelectedItems(new Set())
      setEditMode(false)
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
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
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // フィルター適用
  const applyFilters = () => {
    setOffset(0)
    setItems([])
    setHasMore(true)
    void fetchMore(0)
  }

  // フィルターリセット
  const resetFilters = () => {
    setFilters({
      mimeType: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    })
    setOffset(0)
    setItems([])
    setHasMore(true)
    void fetchMore(0)
  }

  // Intersection Observerを使った無限スクロール
  const observerRef = useRef<IntersectionObserver>()
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isFetching.current) {
        console.log('🔄 Intersection detected - triggering fetchMore')
        void fetchMore()
      }
    })
    if (node) observerRef.current.observe(node)
  }, [loading, hasMore, fetchMore])

  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current) {
      console.log('Gallery page initial load - refreshing gallery')
      hasInitialized.current = true
      refreshGallery()
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
        refreshTimeoutRef.current = null
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📷 メディアギャラリー</h1>
        <div className="flex items-center gap-2">
          <UploadWidget onUploaded={() => {
            console.log('onUploaded callback triggered, refreshing gallery...')
            refreshGallery()
          }} />
        </div>
      </div>

      {/* コントロールバー */}
      <div className="flex items-center justify-between mb-4 p-3 bg-base-200 rounded-lg">
        <div className="flex items-center gap-2">
          {/* 表示方法切り替え */}
          <div className="flex items-center gap-1 bg-base-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* 編集モード切り替え */}
          <button
            onClick={() => {
              setEditMode(!editMode)
              if (editMode) {
                setSelectedItems(new Set())
              }
            }}
            className={`btn btn-sm ${editMode ? 'btn-primary' : 'btn-outline'}`}
          >
            {editMode ? '編集終了' : '編集'}
          </button>

          {/* フィルター切り替え */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`}
          >
            🔍 フィルター
          </button>
        </div>

        {/* 編集モード時の操作ボタン */}
        {editMode && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/60">
              {selectedItems.size}件選択中
            </span>
            <button
              onClick={selectedItems.size === items.length ? clearSelection : selectAll}
              className="btn btn-sm btn-outline"
            >
              {selectedItems.size === items.length ? '全解除' : '全選択'}
            </button>
            {selectedItems.size > 0 && (
              <>
                <button
                  onClick={handleBulkDownload}
                  className="btn btn-sm btn-outline"
                >
                  ダウンロード
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="btn btn-sm btn-error"
                >
                  削除
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="mb-4 p-4 bg-base-100 border border-base-300 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* キーワード検索 */}
            <div>
              <label className="label">
                <span className="label-text">キーワード</span>
              </label>
              <input
                type="text"
                placeholder="ファイル名で検索..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="input input-bordered input-sm w-full"
              />
            </div>

            {/* ファイルタイプ */}
            <div>
              <label className="label">
                <span className="label-text">ファイルタイプ</span>
              </label>
              <select
                value={filters.mimeType}
                onChange={(e) => setFilters(prev => ({ ...prev, mimeType: e.target.value }))}
                className="select select-bordered select-sm w-full"
              >
                <option value="">すべて</option>
                <option value="image/">画像</option>
                <option value="video/">動画</option>
                <option value="audio/">音声</option>
                <option value="application/">文書</option>
              </select>
            </div>

            {/* 開始日 */}
            <div>
              <label className="label">
                <span className="label-text">開始日</span>
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="input input-bordered input-sm w-full"
              />
            </div>

            {/* 終了日 */}
            <div>
              <label className="label">
                <span className="label-text">終了日</span>
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="input input-bordered input-sm w-full"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={applyFilters} className="btn btn-primary btn-sm">
              適用
            </button>
            <button onClick={resetFilters} className="btn btn-outline btn-sm">
              リセット
            </button>
          </div>

          {/* 現在のフィルター状態表示 */}
          {(filters.search || filters.mimeType || filters.dateFrom || filters.dateTo) && (
            <div className="mt-3 p-2 bg-base-200 rounded text-sm">
              <strong>適用中のフィルター:</strong>
              {filters.search && <span className="ml-2 badge badge-outline">検索: {filters.search}</span>}
              {filters.mimeType && <span className="ml-2 badge badge-outline">タイプ: {filters.mimeType}</span>}
              {filters.dateFrom && <span className="ml-2 badge badge-outline">開始: {filters.dateFrom}</span>}
              {filters.dateTo && <span className="ml-2 badge badge-outline">終了: {filters.dateTo}</span>}
            </div>
          )}
        </div>
      )}

      {items.length === 0 && !loading ? (
        <div className="text-center text-base-content/60 py-20">まだメディアがありません。右上から追加してください。</div>
      ) : (
        <>
          {/* グリッド表示 */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item, index) => (
                <div key={item.id} className="relative group">
                  {editMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id.toString())}
                        onChange={() => toggleSelection(item.id.toString())}
                        className="checkbox checkbox-primary"
                      />
                    </div>
                  )}
                  <div
                    onClick={() => handleImageClick(item, index)}
                    className="cursor-pointer"
                  >
                    <img
                      src={getThumbUrl(item)}
                      alt={item.original_filename}
                      className="w-full h-40 object-cover rounded-lg shadow group-hover:opacity-90 transition"
                      loading="lazy"
                      onError={(e) => {
                        console.error('Image load error for item:', item.id, item.original_filename, e);
                        e.currentTarget.src = `data:image/svg+xml;base64,${base64EncodeUtf8(`
                          <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                            <rect width="300" height="200" fill="#f0f0f0"/>
                            <text x="150" y="105" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">${isVideo(item) ? '動画' : item.original_filename}</text>
                          </svg>
                        `)}`;
                      }}
                    />
                    {/* 動画には再生アイコンを重ねる */}
                    {item.mime_type?.startsWith('video/') && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-3">
                          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition">
                      {item.original_filename}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* リスト表示 */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    selectedItems.has(item.id.toString()) ? 'bg-primary/10 border-primary' : 'bg-base-100 border-base-300'
                  } ${editMode ? 'cursor-pointer hover:bg-base-200' : ''}`}
                  onClick={() => handleImageClick(item, index)}
                >
                  {editMode && (
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id.toString())}
                      onChange={() => toggleSelection(item.id.toString())}
                      className="checkbox checkbox-primary"
                    />
                  )}
                  <img
                    src={getThumbUrl(item)}
                    alt={item.original_filename}
                    className="w-16 h-16 object-cover rounded"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Image load error for item:', item.id, item.original_filename, e);
                      e.currentTarget.src = `data:image/svg+xml;base64,${base64EncodeUtf8(`
                        <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                          <rect width="64" height="64" fill="#f0f0f0"/>
                          <text x="32" y="34" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">${isVideo(item) ? '動画' : item.original_filename}</text>
                        </svg>
                      `)}`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.original_filename}</div>
                    <div className="text-sm text-base-content/60">
                      {formatFileSize(item.file_size)} • {formatDate(item.created_at)}
                    </div>
                  </div>
                  <div className="text-xs text-base-content/40">
                    {item.mime_type}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 無限スクロール用の監視要素 */}
          {hasMore && (
            <div ref={lastElementRef} className="py-8 text-center">
              {loading && (
                <div className="loading loading-spinner loading-lg"></div>
              )}
            </div>
          )}
        </>
      )}

      {/* 読み込み完了メッセージ */}
      {!hasMore && items.length > 0 && (
        <div className="py-8 text-center">
          <div className="text-sm text-gray-500">これ以上ありません（総数: {items.length}件）</div>
        </div>
      )}

      {/* 画像ビューアー */}
      <ImageViewer
        image={viewerImage && items.length > viewerIndex ? items[viewerIndex] : null}
        images={items}
        currentIndex={viewerIndex}
        onClose={() => setViewerImage(null)}
        onNavigate={setViewerIndex}
        resolveMediaUrl={resolveMediaUrl}
      />
    </AuthenticatedLayout>
  )
}