'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { register } from 'swiper/element/bundle'

// Swiper Elementを登録
register()

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

type SwiperImageViewerProps = {
  image: MediaItem | null
  images: MediaItem[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
  resolveMediaUrl: (url: string | null) => string
}

export default function SwiperImageViewer({
  image,
  images,
  currentIndex,
  onClose,
  onNavigate,
  resolveMediaUrl
}: SwiperImageViewerProps) {
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const swiperRef = useRef<any>(null)

  const addDebugLog = useCallback((message: string) => {
    console.log(`[SwiperImageViewer] ${message}`)
    setDebugLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
    if (event.key === 'ArrowLeft') {
      swiperRef.current?.swiper?.slidePrev()
    }
    if (event.key === 'ArrowRight') {
      swiperRef.current?.swiper?.slideNext()
    }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    addDebugLog(`Swiper viewer opened for image ${currentIndex + 1}/${images.length}`)
  }, [currentIndex, images.length, addDebugLog])

  // Swiperのスライド変更時の処理
  const handleSlideChange = useCallback((event: any) => {
    const swiper = event.detail[0]
    const newIndex = swiper.activeIndex
    addDebugLog(`Slide changed to index: ${newIndex}`)
    onNavigate(newIndex)
  }, [onNavigate, addDebugLog])

  // Swiperの初期化完了時の処理
  const handleSwiperInit = useCallback((event: any) => {
    const swiper = event.detail[0]
    addDebugLog(`Swiper initialized with ${images.length} slides`)

    // 現在のインデックスにスライドを設定
    if (currentIndex !== swiper.activeIndex) {
      swiper.slideTo(currentIndex, 0) // 0ms = アニメーションなし
    }
  }, [currentIndex, images.length, addDebugLog])

  useEffect(() => {
    const swiperEl = swiperRef.current
    if (swiperEl) {
      // イベントリスナーを追加
      swiperEl.addEventListener('slidechange', handleSlideChange)
      swiperEl.addEventListener('swiperslidechange', handleSlideChange)
      swiperEl.addEventListener('swiperInit', handleSwiperInit)

      return () => {
        // クリーンアップ
        swiperEl.removeEventListener('slidechange', handleSlideChange)
        swiperEl.removeEventListener('swiperslidechange', handleSlideChange)
        swiperEl.removeEventListener('swiperInit', handleSwiperInit)
      }
    }
  }, [handleSlideChange, handleSwiperInit])

  // currentIndexが変更された時にSwiperのスライドを更新
  useEffect(() => {
    if (swiperRef.current?.swiper) {
      const swiper = swiperRef.current.swiper
      if (swiper.activeIndex !== currentIndex) {
        swiper.slideTo(currentIndex, 300) // 300ms アニメーション
        addDebugLog(`External navigation to index: ${currentIndex}`)
      }
    }
  }, [currentIndex, addDebugLog])

  if (!image) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Close Button */}
      <motion.button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white text-2xl hover:text-gray-300 hover:bg-black hover:bg-opacity-30 rounded-full transition-all z-40"
        aria-label="Close viewer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        ×
      </motion.button>

      {/* Debug Panel */}
      <div className="absolute top-4 left-4 bg-black/80 text-white text-xs p-2 rounded max-w-xs z-40">
        <div className="font-bold mb-1">Swiper ImageViewer (LINE-style Continuous Scroll)</div>
        <div className="text-xs opacity-80 mb-1">
          Current: {currentIndex + 1}/{images.length}
        </div>
        {debugLogs.map((log, i) => (
          <div key={i} className="truncate text-xs opacity-70">{log}</div>
        ))}
      </div>

      {/* Swiper Container */}
      <div className="relative h-full w-full max-h-[90vh] max-w-[90vw] overflow-hidden">
        <swiper-container
          ref={swiperRef}
          slides-per-view="1"
          space-between="0"
          speed="300"
          loop="false"
          keyboard="true"
          mousewheel="false"
          touch-ratio="1"
          resistance="true"
          resistance-ratio="0.85"
          threshold="5"
          touch-start-prevent-default="false"
          touch-move-stop-propagation="true"
          simulate-touch="true"
          allow-touch-move="true"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {images.map((item, index) => {
            const isVideo = item.mime_type?.startsWith('video/') ?? false

            return (
              <swiper-slide key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isVideo ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <iframe
                      src={`https://iframe.videodelivery.net/${item.filename}`}
                      allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="w-[90vw] h-[50vh] md:h-[70vh] rounded"
                    />
                  </div>
                ) : (
                  <img
                    src={resolveMediaUrl(item.file_url)}
                    alt={item.original_filename}
                    className="select-none object-contain max-w-full max-h-full"
                    style={{
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      touchAction: 'none'
                    }}
                    draggable={false}
                    onLoad={() => {
                      if (index === currentIndex) {
                        addDebugLog(`Image ${index + 1} loaded successfully`)
                      }
                    }}
                    onError={() => {
                      if (index === currentIndex) {
                        addDebugLog(`Image ${index + 1} load error`)
                      }
                    }}
                  />
                )}
              </swiper-slide>
            )
          })}
        </swiper-container>
      </div>

      {/* Image Info */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center select-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-sm opacity-80">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="text-xs opacity-60 mt-1">
          {image.original_filename}
        </div>
      </motion.div>
    </motion.div>
  )
}