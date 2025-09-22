'use client'

import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface MediaItem {
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

interface VirtualListProps {
  items: MediaItem[]
  onItemClick: (item: MediaItem, index: number) => void
  onSelectionChange?: (selectedIds: Set<string>) => void
  selectedItems?: Set<string>
  editMode?: boolean
  getThumbUrl: (item: MediaItem) => string
  isVideo: (item: MediaItem) => boolean
  formatFileSize: (size: number) => string
  formatDate: (date: string) => string
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

const VirtualList: React.FC<VirtualListProps> = ({
  items,
  onItemClick,
  onSelectionChange,
  selectedItems = new Set(),
  editMode = false,
  getThumbUrl,
  isVideo,
  formatFileSize,
  formatDate,
  onLoadMore,
  hasMore = false,
  loading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 80, // 固定の行高さ
    overscan: 5,
  })

  const toggleSelection = (itemId: string) => {
    if (!onSelectionChange) return

    const newSelection = new Set(selectedItems)
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId)
    } else {
      newSelection.add(itemId)
    }
    onSelectionChange(newSelection)
  }

  // Base64エンコード関数
  const base64EncodeUtf8 = (str: string) => {
    return btoa(unescape(encodeURIComponent(str)))
  }

  // 無限スクロール検知
  React.useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems()
    if (virtualItems.length === 0) return

    const lastItem = virtualItems[virtualItems.length - 1]
    if (lastItem && lastItem.index >= items.length - 5 && hasMore && !loading && onLoadMore) {
      onLoadMore()
    }
  }, [virtualizer.getVirtualItems(), items.length, hasMore, loading, onLoadMore])

  return (
    <div
      ref={containerRef}
      className="w-full overflow-auto"
      style={{ height: '600px' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index]

          return (
            <div
              key={virtualItem.key}
              className="absolute top-0 left-0 w-full px-2"
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  selectedItems.has(item.id.toString())
                    ? 'bg-primary/10 border-primary'
                    : 'bg-base-100 border-base-300'
                } ${editMode ? 'cursor-pointer hover:bg-base-200' : ''}`}
                onClick={() => onItemClick(item, virtualItem.index)}
              >
                {editMode && (
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id.toString())}
                    onChange={() => toggleSelection(item.id.toString())}
                    className="checkbox checkbox-primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <img
                  src={getThumbUrl(item)}
                  alt={item.original_filename}
                  className="w-16 h-16 object-cover rounded"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Image load error for item:', item.id, item.original_filename, e)
                    e.currentTarget.src = `data:image/svg+xml;base64,${base64EncodeUtf8(`
                      <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                        <rect width="64" height="64" fill="#f0f0f0"/>
                        <text x="32" y="34" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">${isVideo(item) ? '動画' : item.original_filename}</text>
                      </svg>
                    `)}`
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
            </div>
          )
        })}
      </div>

      {/* ローディング表示 */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}
    </div>
  )
}

export default VirtualList