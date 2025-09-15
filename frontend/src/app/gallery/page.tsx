'use client'

import { useEffect, useRef, useState } from 'react'
import UploadWidget from '@/components/UploadWidget'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import ImageViewer from '@/components/ImageViewer'

type MediaItem = {
  id: string
  url: string
  thumbnailUrl: string
  createdAt: string
  mimeType: string
  originalFilename: string
  fileSize: number
}

type ViewMode = 'grid' | 'list'

export default function GalleryPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uch-api.belong2jazz.workers.dev'
  const [items, setItems] = useState<MediaItem[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [editMode, setEditMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewerImage, setViewerImage] = useState<MediaItem | null>(null)
  const [viewerIndex, setViewerIndex] = useState(0)
  const loader = useRef<HTMLDivElement | null>(null)

  const fetchMore = async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await fetch(`${apiBase}/api/media?offset=${offset}&limit=24`, { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { items: MediaItem[]; nextOffset: number }
      setItems((prev) => [...prev, ...data.items])
      setOffset(data.nextOffset)
      if (data.items.length === 0) setHasMore(false)
    } catch (e) {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const handleImageClick = (item: MediaItem, index: number) => {
    if (editMode) {
      toggleSelection(item.id)
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
    setSelectedItems(new Set(items.map(item => item.id)))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const handleBulkDownload = async () => {
    if (selectedItems.size === 0) return
    
    for (const id of Array.from(selectedItems)) {
      const item = items.find(i => i.id === id)
      if (item) {
        const link = document.createElement('a')
        link.href = `${apiBase}/api/media/${id}/image`
        link.download = item.originalFilename
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
      setItems(prev => prev.filter(item => !selectedItems.has(item.id)))
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

  useEffect(() => {
    fetchMore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!loader.current) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchMore()
    })
    io.observe(loader.current)
    return () => io.disconnect()
  }, [loader.current])

  return (
    <AuthenticatedLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📷 メディアギャラリー</h1>
        <div className="flex items-center gap-2">
          <UploadWidget onUploaded={() => { setItems([]); setOffset(0); setHasMore(true); fetchMore() }} />
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

      {items.length === 0 && !loading ? (
        <div className="text-center text-base-content/60 py-20">まだメディアがありません。右上から追加してください。</div>
      ) : (
        <>
          {/* グリッド表示 */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((item, index) => (
                <div key={item.id} className="relative group">
                  {editMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="checkbox checkbox-primary"
                      />
                    </div>
                  )}
                  <div
                    onClick={() => handleImageClick(item, index)}
                    className="cursor-pointer"
                  >
                    <img
                      src={`${apiBase}/api/media/${item.id}/image`}
                      alt={item.originalFilename}
                      className="w-full h-40 object-cover rounded-lg shadow group-hover:opacity-90 transition"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition">
                      {item.originalFilename}
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
                    selectedItems.has(item.id) ? 'bg-primary/10 border-primary' : 'bg-base-100 border-base-300'
                  } ${editMode ? 'cursor-pointer hover:bg-base-200' : ''}`}
                  onClick={() => handleImageClick(item, index)}
                >
                  {editMode && (
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="checkbox checkbox-primary"
                    />
                  )}
                  <img
                    src={`${apiBase}/api/media/${item.id}/image`}
                    alt={item.originalFilename}
                    className="w-16 h-16 object-cover rounded"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.originalFilename}</div>
                    <div className="text-sm text-base-content/60">
                      {formatFileSize(item.fileSize)} • {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <div className="text-xs text-base-content/40">
                    {item.mimeType}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div ref={loader} className="py-8 text-center">
        {loading ? <span className="loading loading-dots" /> : hasMore ? ' ' : 'これ以上ありません'}
      </div>

      {/* 画像ビューアー */}
      <ImageViewer
        image={viewerImage}
        images={items}
        currentIndex={viewerIndex}
        onClose={() => setViewerImage(null)}
        onNavigate={setViewerIndex}
      />
    </AuthenticatedLayout>
  )
}

