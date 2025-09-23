'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Zoom, Keyboard } from 'swiper/modules'

// Swiper styles for zoom functionality
import 'swiper/css'
import 'swiper/css/zoom'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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

const VideoNavigationControls = ({ onPrev, onNext, canPrev, canNext }: {
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
}) => {
  return (
    <>
      {canPrev && (
        <motion.button
          onClick={onPrev}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-black/60 text-white text-2xl md:text-3xl backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 z-50"
          aria-label="Previous media"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ‹
        </motion.button>
      )}

      {canNext && (
        <motion.button
          onClick={onNext}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-black/60 text-white text-2xl md:text-3xl backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 z-50"
          aria-label="Next media"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ›
        </motion.button>
      )}
    </>
  )
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
  const [currentZoom, setCurrentZoom] = useState(1)
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
      swiperRef.current?.slidePrev()
    }
    if (event.key === 'ArrowRight') {
      swiperRef.current?.slideNext()
    }
  }, [onClose])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      addDebugLog(`Navigate to previous: ${currentIndex - 1}`)
      swiperRef.current?.slidePrev()
    }
  }, [currentIndex, addDebugLog])

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      addDebugLog(`Navigate to next: ${currentIndex + 1}`)
      swiperRef.current?.slideNext()
    }
  }, [currentIndex, images.length, addDebugLog])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    addDebugLog(`Swiper viewer opened for image ${currentIndex + 1}/${images.length}`)
  }, [currentIndex, images.length, addDebugLog])

  // Swiperのスライド変更時の処理
  const handleSlideChange = useCallback((swiper: any) => {
    const newIndex = swiper.activeIndex
    addDebugLog(`Slide changed to index: ${newIndex}`)
    onNavigate(newIndex)
  }, [onNavigate, addDebugLog])

  // Swiperの初期化完了時の処理
  const handleSwiperInit = useCallback((swiper: any) => {
    addDebugLog(`Swiper initialized with ${images.length} slides, zoom enabled`)
    swiperRef.current = swiper

    // 現在のインデックスにスライドを設定
    if (currentIndex !== swiper.activeIndex) {
      swiper.slideTo(currentIndex, 0) // 0ms = アニメーションなし
    }
  }, [currentIndex, images.length, addDebugLog])

  // ズーム変更時の処理
  const handleZoomChange = useCallback((swiper: any, scale: number) => {
    setCurrentZoom(scale)
    addDebugLog(`Zoom changed: ${scale.toFixed(2)}x`)
  }, [addDebugLog])

  // currentIndexが変更された時にSwiperのスライドを更新
  useEffect(() => {
    if (swiperRef.current) {
      const swiper = swiperRef.current
      if (swiper.activeIndex !== currentIndex) {
        swiper.slideTo(currentIndex, 300) // 300ms アニメーション
        addDebugLog(`External navigation to index: ${currentIndex}`)
      }
    }
  }, [currentIndex, addDebugLog])

  if (!image) return null

  const isCurrentVideoMedia = image.mime_type?.startsWith('video/') ?? false

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
        <div className="font-bold mb-1">Swiper ImageViewer (LINE-style + Zoom)</div>
        <div className="text-xs opacity-80 mb-1">
          Current: {currentIndex + 1}/{images.length} | Zoom: {currentZoom.toFixed(2)}x
        </div>
        <div className="text-xs opacity-60 mb-1">
          📱 Pinch to zoom | 👆👆 Double-tap to toggle
          {isCurrentVideoMedia && ' | 🎬 Video nav buttons'}
        </div>
        {debugLogs.map((log, i) => (
          <div key={i} className="truncate text-xs opacity-70">{log}</div>
        ))}
      </div>

      {/* Swiper Container */}
      <div className="relative h-full w-full max-h-[90vh] max-w-[90vw] overflow-hidden">
        <Swiper
          modules={[Zoom, Keyboard]}
          slidesPerView={1}
          spaceBetween={0}
          speed={300}
          loop={false}
          keyboard={{
            enabled: true,
          }}
          mousewheel={false}
          touchRatio={1}
          resistance={true}
          resistanceRatio={0.85}
          threshold={5}
          preventInteractionOnTransition={false}
          simulateTouch={true}
          allowTouchMove={true}
          zoom={{
            maxRatio: 4,
            minRatio: 1,
            toggle: true,
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
          onSwiper={handleSwiperInit}
          onSlideChange={handleSlideChange}
          onZoomChange={handleZoomChange}
          initialSlide={currentIndex}
        >
          {images.map((item, index) => {
            const isVideo = item.mime_type?.startsWith('video/') ?? false

            return (
              <SwiperSlide key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  <div className="swiper-zoom-container">
                    <img
                      src={resolveMediaUrl(item.file_url)}
                      alt={item.original_filename}
                      className="select-none object-contain max-w-full max-h-full"
                      style={{
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        touchAction: 'manipulation'
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
                  </div>
                )}
              </SwiperSlide>
            )
          })}
        </Swiper>

        {/* Video Navigation Controls - 動画表示時のみ */}
        {isCurrentVideoMedia && (
          <VideoNavigationControls
            onPrev={handlePrevious}
            onNext={handleNext}
            canPrev={currentIndex > 0}
            canNext={currentIndex < images.length - 1}
          />
        )}
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