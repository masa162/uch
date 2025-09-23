'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation'

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

type NewImageViewerProps = {
  image: MediaItem | null
  images: MediaItem[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
  resolveMediaUrl: (url: string | null) => string
}

const NavigationControls = ({ onPrev, onNext, canPrev, canNext }: {
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
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-black/60 text-white text-2xl md:text-3xl backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 z-40"
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
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-black/60 text-white text-2xl md:text-3xl backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 z-40"
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

const SwipeIndicator = ({ progress, direction, currentIndex, totalImages }: {
  progress: number
  direction: 'prev' | 'next' | null
  currentIndex: number
  totalImages: number
}) => {
  if (!direction || Math.abs(progress) < 0.05) return null

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="flex space-x-2">
        {Array.from({ length: totalImages }, (_, i) => (
          <motion.div
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              i === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
            animate={{
              scale: i === currentIndex ? 1 + Math.abs(progress) * 0.5 : 1,
              backgroundColor: i === currentIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function NewImageViewer({
  image,
  images,
  currentIndex,
  onClose,
  onNavigate,
  resolveMediaUrl
}: NewImageViewerProps) {
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  const addDebugLog = useCallback((message: string) => {
    console.log(`[NewImageViewer] ${message}`)
    setDebugLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  // スワイプナビゲーション
  const {
    gestureHandlers,
    gestureState,
    isTransitioning,
    swipeProgress,
    swipeDirection,
    canSwipePrev,
    canSwipeNext,
    handleZoomChange
  } = useSwipeNavigation({
    currentIndex,
    totalImages: images.length,
    onNavigate,
    onSwipeStart: () => addDebugLog('Swipe started'),
    onSwipeProgress: (progress, direction) => {
      addDebugLog(`Swipe progress: ${(progress * 100).toFixed(1)}% ${direction}`)
    },
    onSwipeComplete: (direction) => addDebugLog(`Swipe completed: ${direction}`)
  })

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      addDebugLog(`Navigate to previous: ${currentIndex - 1}`)
      onNavigate(currentIndex - 1)
    }
  }, [currentIndex, onNavigate, addDebugLog])

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      addDebugLog(`Navigate to next: ${currentIndex + 1}`)
      onNavigate(currentIndex + 1)
    }
  }, [currentIndex, images.length, onNavigate, addDebugLog])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
    if (event.key === 'ArrowLeft') {
      handlePrevious()
    }
    if (event.key === 'ArrowRight') {
      handleNext()
    }
  }, [onClose, handlePrevious, handleNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    addDebugLog(`Viewer opened for image ${currentIndex + 1}/${images.length}`)
  }, [currentIndex, images.length, addDebugLog])

  if (!image) return null

  const isVideo = image.mime_type?.startsWith('video/') ?? false

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      style={{ touchAction: 'none' }}
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
        <div className="font-bold mb-1">New ImageViewer (LINE-style Swipe)</div>
        <div className="text-xs opacity-80 mb-1">
          Scale: {gestureState.scale.toFixed(2)} |
          Boundaries: [{gestureState.isAtLeftBoundary ? 'L' : '-'}, {gestureState.isAtRightBoundary ? 'R' : '-'}]
        </div>
        <div className="text-xs opacity-80 mb-1">
          Swipe: {swipeDirection || 'none'} ({(Math.abs(swipeProgress) * 100).toFixed(1)}%)
        </div>
        {debugLogs.map((log, i) => (
          <div key={i} className="truncate text-xs opacity-70">{log}</div>
        ))}
      </div>

      {/* Navigation Controls - スワイプ専用化のため一時的に非表示 */}
      {false && (
        <NavigationControls
          onPrev={handlePrevious}
          onNext={handleNext}
          canPrev={currentIndex > 0}
          canNext={currentIndex < images.length - 1}
        />
      )}

      {/* Swipe Progress Indicator */}
      <AnimatePresence>
        <SwipeIndicator
          progress={swipeProgress}
          direction={swipeDirection}
          currentIndex={currentIndex}
          totalImages={images.length}
        />
      </AnimatePresence>

      {/* Main Content with Gesture Handling */}
      <div
        className="relative h-full w-full max-h-[90vh] max-w-[90vw] overflow-hidden"
        {...gestureHandlers()}
      >
        {isVideo ? (
          <div className="w-full h-full flex items-center justify-center">
            <iframe
              src={`https://iframe.videodelivery.net/${image.filename}`}
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="w-[90vw] h-[50vh] md:h-[70vh] rounded"
            />
          </div>
        ) : (
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={4}
            centerZoomedOut={true}
            limitToBounds={true}
            doubleClick={{
              disabled: false,
              mode: "toggle",
              step: 2,
              animationTime: 300
            }}
            pinch={{
              step: 0.3
            }}
            panning={{
              disabled: false
            }}
            wheel={{
              disabled: true // モバイルでは無効化
            }}
            onTransformed={(ref) => {
              const { scale, positionX, positionY } = ref.state
              handleZoomChange(scale, positionX, positionY)
              addDebugLog(`Transform: scale=${scale.toFixed(2)} pos=[${positionX.toFixed(0)}, ${positionY.toFixed(0)}]`)
            }}
            onZoom={(ref, event) => {
              addDebugLog(`Zoom: ${ref.state.scale.toFixed(2)}x`)
            }}
            onPanning={(ref, event) => {
              addDebugLog(`Pan: x=${ref.state.positionX.toFixed(0)}, y=${ref.state.positionY.toFixed(0)}`)
            }}
            onPinching={(ref, event) => {
              addDebugLog(`Pinch: ${ref.state.scale.toFixed(2)}x`)
            }}
          >
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                cursor: gestureState.scale > 1.1 ? 'grab' : 'default'
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <motion.img
                src={resolveMediaUrl(image.file_url)}
                alt={image.original_filename}
                className="select-none object-contain max-w-full max-h-full"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  touchAction: 'none'
                }}
                draggable={false}
                onLoad={() => addDebugLog('Image loaded successfully')}
                onError={() => addDebugLog('Image load error')}
                animate={{
                  x: isTransitioning ? 0 : swipeProgress * (typeof window !== 'undefined' ? window.innerWidth : 0)
                }}
                transition={{
                  type: isTransitioning ? "spring" : "tween",
                  stiffness: 400,
                  damping: 35,
                  duration: isTransitioning ? 0.3 : 0
                }}
              />
            </TransformComponent>
          </TransformWrapper>
        )}

        {/* Adjacent Images Preview (for swipe feedback) */}
        <AnimatePresence>
          {swipeDirection === 'prev' && images[currentIndex - 1] && Math.abs(swipeProgress) > 0.1 && (
            <motion.div
              className="absolute left-0 top-0 w-full h-full flex items-center justify-center opacity-30"
              initial={{ x: -window.innerWidth }}
              animate={{ x: swipeProgress * window.innerWidth }}
              exit={{ x: -window.innerWidth }}
            >
              <img
                src={resolveMediaUrl(images[currentIndex - 1].file_url)}
                alt="Previous image"
                className="object-contain max-w-full max-h-full"
                style={{ maxWidth: '90vw', maxHeight: '90vh' }}
              />
            </motion.div>
          )}

          {swipeDirection === 'next' && images[currentIndex + 1] && Math.abs(swipeProgress) > 0.1 && (
            <motion.div
              className="absolute right-0 top-0 w-full h-full flex items-center justify-center opacity-30"
              initial={{ x: window.innerWidth }}
              animate={{ x: swipeProgress * window.innerWidth }}
              exit={{ x: window.innerWidth }}
            >
              <img
                src={resolveMediaUrl(images[currentIndex + 1].file_url)}
                alt="Next image"
                className="object-contain max-w-full max-h-full"
                style={{ maxWidth: '90vw', maxHeight: '90vh' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
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