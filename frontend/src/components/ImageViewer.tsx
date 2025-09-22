'use client'

import { useEffect, useState } from 'react'

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
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [currentSrc, setCurrentSrc] = useState<string>('')
  const [errorCount, setErrorCount] = useState(0)

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1)
    }
    if (isRightSwipe && currentIndex > 0) {
      onNavigate(currentIndex - 1)
    }
  }

  const handleImageClick = (e: React.MouseEvent) => {
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
    >
      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
      >
        ✕
      </button>

      {/* 前の画像エリア（画面左半分） */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-0 top-0 w-1/2 h-full flex items-center justify-start pl-4 active:bg-black active:bg-opacity-30 md:hover:bg-black md:hover:bg-opacity-20 transition-colors z-10"
        >
          <div className="text-white text-4xl opacity-70 active:opacity-100 md:hover:opacity-100 transition-opacity">
            ‹
          </div>
        </button>
      )}

      {/* 次の画像エリア（画面右半分） */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-0 top-0 w-1/2 h-full flex items-center justify-end pr-4 active:bg-black active:bg-opacity-30 md:hover:bg-black md:hover:bg-opacity-20 transition-colors z-10"
        >
          <div className="text-white text-4xl opacity-70 active:opacity-100 md:hover:opacity-100 transition-opacity">
            ›
          </div>
        </button>
      )}

      {/* 表示エリア */}
      <div
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center relative z-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
