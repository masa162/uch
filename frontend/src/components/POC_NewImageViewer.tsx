'use client'

import { useState, useEffect } from 'react'
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch'

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

type POCImageViewerProps = {
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
        <button
          onClick={onPrev}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-black/60 text-white text-2xl md:text-3xl backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 z-40"
          aria-label="Previous media"
        >
          ‹
        </button>
      )}

      {canNext && (
        <button
          onClick={onNext}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-black/60 text-white text-2xl md:text-3xl backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 z-40"
          aria-label="Next media"
        >
          ›
        </button>
      )}
    </>
  )
}

export default function POCImageViewer({
  image,
  images,
  currentIndex,
  onClose,
  onNavigate,
  resolveMediaUrl
}: POCImageViewerProps) {
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  const addDebugLog = (message: string) => {
    console.log(`[POCImageViewer] ${message}`)
    setDebugLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      addDebugLog(`Navigate to previous: ${currentIndex - 1}`)
      onNavigate(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      addDebugLog(`Navigate to next: ${currentIndex + 1}`)
      onNavigate(currentIndex + 1)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
    if (event.key === 'ArrowLeft') {
      handlePrevious()
    }
    if (event.key === 'ArrowRight') {
      handleNext()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  useEffect(() => {
    addDebugLog(`Viewer opened for image ${currentIndex + 1}/${images.length}`)
  }, [currentIndex])

  if (!image) return null

  const isVideo = image.mime_type?.startsWith('video/') ?? false

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      style={{ touchAction: 'none' }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white text-2xl hover:text-gray-300 hover:bg-black hover:bg-opacity-30 rounded-full transition-all z-40"
        aria-label="Close viewer"
      >
        ×
      </button>

      {/* Debug Panel (mobile-friendly) */}
      <div className="absolute top-4 left-4 bg-black/80 text-white text-xs p-2 rounded max-w-xs z-40">
        <div className="font-bold mb-1">POC Debug (react-zoom-pan-pinch)</div>
        {debugLogs.map((log, i) => (
          <div key={i} className="truncate">{log}</div>
        ))}
      </div>

      {/* Navigation Controls */}
      <NavigationControls
        onPrev={handlePrevious}
        onNext={handleNext}
        canPrev={currentIndex > 0}
        canNext={currentIndex < images.length - 1}
      />

      {/* Main Content */}
      <div className="relative h-full w-full max-h-[90vh] max-w-[90vw] overflow-hidden">
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
                cursor: 'grab'
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
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
              />
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>

      {/* Image Info */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center select-none">
        <div className="text-sm opacity-80">
          {currentIndex + 1} / {images.length}
        </div>
        <div className="text-xs opacity-60 mt-1">
          {image.original_filename}
        </div>
      </div>
    </div>
  )
}