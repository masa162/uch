'use client'

import { useEffect, useState } from 'react'
import type { MouseEvent, TouchEvent } from 'react'

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

type ImageViewerProps = {
  image: MediaItem | null
  images: MediaItem[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
  resolveMediaUrl: (url: string | null) => string
}

export default function ImageViewer({ image, images, currentIndex, onClose, onNavigate, resolveMediaUrl }: ImageViewerProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('')
  const [errorCount, setErrorCount] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  // 強化されたスワイプ状態管理
  const [swipeState, setSwipeState] = useState({
    startX: 0,
    startY: 0,
    startTime: 0,
    isTracking: false
  })

  useEffect(() => {
    if (image) {
      // When the image prop changes, reset the source to the primary URL and clear errors
      setCurrentSrc(resolveMediaUrl(image.file_url))
      setErrorCount(0)
    }
  }, [image, resolveMediaUrl])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        onNavigate(Math.max(0, currentIndex - 1))
      } else if (e.key === 'ArrowRight') {
        onNavigate(Math.min(images.length - 1, currentIndex + 1))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, images.length, onClose, onNavigate])

  const handleImageError = () => {
    if (!image) return

    const nextErrorCount = errorCount + 1
    setErrorCount(nextErrorCount)

    // Try fallbacks in order
    if (nextErrorCount === 1) {
      // 1. Try thumbnail_url
      const thumbnailUrl = resolveMediaUrl(image.thumbnail_url)
      if (thumbnailUrl) {
        setCurrentSrc(thumbnailUrl)
        return
      }
    }
    
    if (nextErrorCount <= 2) {
      // 2. Try direct API endpoint (if thumbnail was null or also failed)
      setCurrentSrc(resolveMediaUrl(`/api/media/${image.id}/image`))
      return
    }
    // All fallbacks have failed
  }

  // 強化されたスワイプハンドラー
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const touch = e.targetTouches[0]
    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isTracking: true
    })
    setSwipeDirection(null)
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!swipeState.isTracking) return

    const touch = e.targetTouches[0]
    const deltaX = touch.clientX - swipeState.startX
    const deltaY = touch.clientY - swipeState.startY

    // 水平方向のスワイプのみ処理（縦スワイプを無効化）
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left')

      // 縦スクロールを防止
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (!swipeState.isTracking) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - swipeState.startX
    const deltaY = touch.clientY - swipeState.startY
    const deltaTime = Date.now() - swipeState.startTime

    // スワイプ判定条件（強化版）
    const isValidSwipe =
      Math.abs(deltaX) > 30 &&                    // 最小距離30px
      Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && // 水平方向優先
      deltaTime < 300 &&                          // 300ms以内
      Math.abs(deltaX) / deltaTime > 0.1          // 最小速度

    if (isValidSwipe) {
      if (deltaX > 0 && currentIndex > 0) {
        // 右スワイプ：前の画像
        onNavigate(currentIndex - 1)
        // ハプティックフィードバック
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      } else if (deltaX < 0 && currentIndex < images.length - 1) {
        // 左スワイプ：次の画像
        onNavigate(currentIndex + 1)
        // ハプティックフィードバック
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      }
    }

    // スワイプ状態をリセット
    setSwipeState({
      startX: 0,
      startY: 0,
      startTime: 0,
      isTracking: false
    })

    // フィードバック表示をクリア（少し遅らせて）
    setTimeout(() => setSwipeDirection(null), 200)
  }

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!image) return null

  const isVideo = image.mime_type?.startsWith('video/')
  const streamUid = isVideo ? image.filename : '' // registerVideo で filename に uid を保存

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={handleImageClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 閉じるボタン保護エリア */}
      <div className="absolute top-0 right-0 w-20 h-20 z-40" />

      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white text-2xl hover:text-gray-300 hover:bg-black hover:bg-opacity-30 rounded-full transition-all z-40"
      >
        ✕
      </button>

      {/* 前の画像エリア（最適化済み） */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-start px-4 md:left-4 md:top-1/2 md:bottom-auto md:w-20 md:h-32 md:px-0 md:justify-center md:rounded-lg md:-translate-y-1/2 md:transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-colors z-30 active:bg-white/10 md:hover:bg-white/10"
          aria-label="Previous media"
        >
          <span
            className={`flex h-12 w-12 items-center justify-center text-white text-3xl md:text-4xl ${isVideo ? 'bg-black/60 md:bg-black/40 rounded-full backdrop-blur-sm' : ''}`}
            aria-hidden="true"
          >
            ‹
          </span>
        </button>
      )}

      {/* 次の画像エリア（最適化済み） */}
      {currentIndex < images.length - 1 && (
        <button
          type="button"
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end px-4 md:right-4 md:top-1/2 md:bottom-auto md:w-20 md:h-32 md:px-0 md:justify-center md:rounded-lg md:-translate-y-1/2 md:transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-colors z-30 active:bg-white/10 md:hover:bg-white/10"
          aria-label="Next media"
        >
          <span
            className={`flex h-12 w-12 items-center justify-center text-white text-3xl md:text-4xl ${isVideo ? 'bg-black/60 md:bg-black/40 rounded-full backdrop-blur-sm' : ''}`}
            aria-hidden="true"
          >
            ›
          </span>
        </button>
      )}

      {isVideo && (
        <div className="absolute top-16 left-4 md:top-20 md:left-8 bg-black/60 text-white text-xs md:text-sm px-3 py-1 rounded backdrop-blur-sm z-30">
          Video {currentIndex + 1}/{images.length}
        </div>
      )}

      {/* 表示エリア */}
      <div
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center relative z-20"
      >
        {isVideo ? (
          // Cloudflare Stream 埋め込み（uid から iframe）
          <iframe
            src={`https://iframe.videodelivery.net/${streamUid}`}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-[90vw] h-[50vh] md:h-[70vh] rounded"
          />
        ) : (
          <img
            src={currentSrc}
            alt={image.original_filename}
            className="max-w-full max-h-full object-contain"
            draggable={false}
            onError={handleImageError}
          />
        )}
      </div>

      {/* 情報 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <div className="text-sm opacity-80">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="text-xs opacity-60 mt-1">
          {image.original_filename}
        </div>
      </div>

      {/* ナビゲーションドット */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
