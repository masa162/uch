'use client'

import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useGridDimensions } from '@/hooks/useGridDimensions'

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

interface VirtualGridProps {
  items: MediaItem[]
  onItemClick: (item: MediaItem, index: number) => void
  onSelectionChange?: (selectedIds: Set<string>) => void
  selectedItems?: Set<string>
  editMode?: boolean
  getThumbUrl: (item: MediaItem) => string
  isVideo: (item: MediaItem) => boolean
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

const VirtualGrid: React.FC<VirtualGridProps> = ({
  items,
  onItemClick,
  onSelectionChange,
  selectedItems = new Set(),
  editMode = false,
  getThumbUrl,
  isVideo,
  onLoadMore,
  hasMore = false,
  loading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { width, height, columnCount, itemWidth, itemHeight } = useGridDimensions(containerRef)

  // グリッドの行数を計算
  const rowCount = Math.ceil(items.length / columnCount)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => itemHeight + 16, // itemHeight + gap
    overscan: 2,
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
    const virtualItems = rowVirtualizer.getVirtualItems()
    if (virtualItems.length === 0) return

    const lastItem = virtualItems[virtualItems.length - 1]
    if (lastItem && lastItem.index >= rowCount - 2 && hasMore && !loading && onLoadMore) {
      onLoadMore()
    }
  }, [rowVirtualizer.getVirtualItems(), rowCount, hasMore, loading, onLoadMore])

  return (
    <div
      ref={containerRef}
      className="w-full overflow-auto"
      style={{ height: `${height}px` }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowIndex = virtualRow.index
          const startIndex = rowIndex * columnCount
          const endIndex = Math.min(startIndex + columnCount, items.length)

          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                  height: `${itemHeight}px`,
                }}
              >
                {Array.from({ length: columnCount }, (_, colIndex) => {
                  const itemIndex = startIndex + colIndex
                  if (itemIndex >= items.length) {
                    return <div key={colIndex} />
                  }

                  const item = items[itemIndex]

                  return (
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
                        onClick={() => onItemClick(item, itemIndex)}
                        className="cursor-pointer h-full"
                      >
                        <img
                          src={getThumbUrl(item)}
                          alt={item.original_filename}
                          className="w-full h-full object-cover rounded-lg shadow group-hover:opacity-90 transition"
                          loading="lazy"
                          onError={(e) => {
                            console.error('Image load error for item:', item.id, item.original_filename, e)
                            e.currentTarget.src = `data:image/svg+xml;base64,${base64EncodeUtf8(`
                              <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                                <rect width="300" height="200" fill="#f0f0f0"/>
                                <text x="150" y="105" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">${isVideo(item) ? '動画' : item.original_filename}</text>
                              </svg>
                            `)}`
                          }}
                        />
                        {/* 動画には再生アイコンを重ねる */}
                        {item.mime_type?.startsWith('video/') && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/50 rounded-full p-3">
                              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition">
                          {item.original_filename}
                        </div>
                      </div>
                    </div>
                  )
                })}
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

export default VirtualGrid