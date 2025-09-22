'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { animated, to, useSpring } from '@react-spring/web'
import { useGesture } from '@use-gesture/react'

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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export default function ImageViewer({
  image,
  images,
  currentIndex,
  onClose,
  onNavigate,
  resolveMediaUrl
}: ImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const activeMediaRef = useRef<HTMLImageElement | null>(null)
  const zoomStateRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 })

  const [{ x }, trackApi] = useSpring(() => ({ x: 0 }))
  const [{ scale, offsetX, offsetY }, zoomApi] = useSpring(() => ({ scale: 1, offsetX: 0, offsetY: 0 }))
  const [isZoomed, setIsZoomed] = useState(false)
  const [imageErrorCounts, setImageErrorCounts] = useState<Record<number, number>>({})
  const isActiveVideoRef = useRef(false)

  const getEffectiveWidth = () => {
    if (viewport.width > 1) return viewport.width
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect()
      if (rect.width > 1) return rect.width
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      if (rect.width > 1) return rect.width
    }
    return typeof window !== 'undefined' ? window.innerWidth : 1
  }

  const getEffectiveHeight = () => {
    if (viewport.height > 1) return viewport.height
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect()
      if (rect.height > 1) return rect.height
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      if (rect.height > 1) return rect.height
    }
    return typeof window !== 'undefined' ? window.innerHeight : 1
  }

  const resetZoom = () => {
    zoomStateRef.current = { scale: 1, offsetX: 0, offsetY: 0 }
    setIsZoomed(false)
    zoomApi.start({ scale: 1, offsetX: 0, offsetY: 0 })
  }

  const navigateTo = (index: number, immediate = false) => {
    const next = clamp(index, 0, images.length - 1)
    setActiveIndex(next)
    const width = getEffectiveWidth()
    trackApi.start({ x: -next * width, immediate })
    if (next !== currentIndex) {
      onNavigate(next)
    }
    resetZoom()
  }

  const toggleZoom = () => {
    if (isActiveVideoRef.current) return
    const shouldZoom = !isZoomed
    if (shouldZoom) {
      zoomStateRef.current.scale = 2
      setIsZoomed(true)
      zoomApi.start({ scale: 2, offsetX: 0, offsetY: 0, config: { tension: 260, friction: 30 } })
    } else {
      resetZoom()
    }
  }

  useEffect(() => setActiveIndex(currentIndex), [currentIndex])

  useLayoutEffect(() => {
    if (!trackRef.current) return
    const update = () => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect) return
      setViewport({ width: rect.width, height: rect.height })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(trackRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
      if (event.key === 'ArrowLeft') {
        navigateTo(activeIndex - 1, true)
      }
      if (event.key === 'ArrowRight') {
        navigateTo(activeIndex + 1, true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  })

  useEffect(() => {
    const width = getEffectiveWidth()
    trackApi.start({ x: -activeIndex * width, immediate: true })
  }, [activeIndex, viewport.width, trackApi])

  useEffect(() => {
    const active = images[activeIndex]
    const isVideo = Boolean(active?.mime_type?.startsWith('video/'))
    isActiveVideoRef.current = isVideo
    if (isVideo) {
      resetZoom()
    }
  }, [activeIndex, images])

  const bind = useGesture(
    {
      onDrag: ({ active, first, event, movement: [mx, my], velocity: [vx], memo }) => {
        event.preventDefault()
        const width = getEffectiveWidth()
        const height = getEffectiveHeight()

        if (!width) return memo

        const zoomed = zoomStateRef.current.scale > 1.02 && !isActiveVideoRef.current
        if (zoomed) {
          const startMemo = first
            ? { startX: zoomStateRef.current.offsetX, startY: zoomStateRef.current.offsetY }
            : (memo as { startX: number; startY: number } | undefined) ?? {
                startX: zoomStateRef.current.offsetX,
                startY: zoomStateRef.current.offsetY
              }

          const currentScale = zoomStateRef.current.scale
          const limitX = ((width * (currentScale - 1)) / 2) + 40
          const limitY = ((height * (currentScale - 1)) / 2) + 40
          const nextX = clamp(startMemo.startX + mx, -limitX, limitX)
          const nextY = clamp(startMemo.startY + my, -limitY, limitY)

          zoomStateRef.current.offsetX = nextX
          zoomStateRef.current.offsetY = nextY
          zoomApi.start({ offsetX: nextX, offsetY: nextY, immediate: true })
          return startMemo
        }

        const baseline = -activeIndex * width
        if (active) {
          trackApi.start({ x: baseline + mx, immediate: true })
        } else {
          const threshold = width * 0.18
          const shouldAdvance = Math.abs(mx) > threshold || Math.abs(vx) > 0.5
          let nextIndex = activeIndex
          if (shouldAdvance && mx !== 0) {
            nextIndex = clamp(activeIndex - Math.sign(mx), 0, images.length - 1)
          }
          navigateTo(nextIndex, false)
        }
        return memo
      },
      onPinch: ({ first, offset: [scaleOffset], origin, event }) => {
        if (isActiveVideoRef.current) return
        event.preventDefault()

        const clamped = clamp(scaleOffset, 1, 4)
        if (first && activeMediaRef.current) {
          const rect = activeMediaRef.current.getBoundingClientRect()
          const ox = origin[0] - (rect.left + rect.width / 2)
          const oy = origin[1] - (rect.top + rect.height / 2)
          zoomStateRef.current.offsetX = ox
          zoomStateRef.current.offsetY = oy
          zoomApi.start({ offsetX: ox, offsetY: oy, immediate: true })
        }

        zoomStateRef.current.scale = clamped
        setIsZoomed(clamped > 1.02)
        zoomApi.start({ scale: clamped, immediate: true })

        if (clamped <= 1.01) {
          resetZoom()
        }
      },
      onDoubleClick: ({ event }) => {
        event.preventDefault()
        toggleZoom()
      }
    },
    {
      drag: { filterTaps: true, axis: 'lock' },
      pinch: { scaleBounds: { min: 1, max: 4 }, rubberband: true }
    }
  )

  const getImageSrc = (item: MediaItem) => {
    const attempts = imageErrorCounts[item.id] ?? 0
    if (attempts === 0) return resolveMediaUrl(item.file_url)
    if (attempts === 1 && item.thumbnail_url) return resolveMediaUrl(item.thumbnail_url)
    return resolveMediaUrl(`/api/media/${item.id}/image`)
  }

  const handleImageError = (item: MediaItem) => {
    setImageErrorCounts(prev => {
      const current = prev[item.id] ?? 0
      if (current >= 2) return prev
      return { ...prev, [item.id]: current + 1 }
    })
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isZoomed) {
      onClose()
    }
  }

  useEffect(() => {
    if (!image) return
    const src = getImageSrc(image)
    const preload = new Image()
    preload.src = src
  }, [image])

  if (!image) return null

  const slideWidth = getEffectiveWidth()

  const showPrev = activeIndex > 0
  const showNext = activeIndex < images.length - 1

  return (
    <div
      ref={containerRef}
      {...bind()}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      style={{ touchAction: 'none' }}
      onClick={handleBackdropClick}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white text-2xl hover:text-gray-300 hover:bg-black hover:bg-opacity-30 rounded-full transition-all z-40"
        aria-label="Close viewer"
      >
        ×
      </button>

      {showPrev && (
        <button
          type="button"
          onClick={() => navigateTo(activeIndex - 1, true)}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-black/60 text-white text-2xl md:text-3xl backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 z-40"
          aria-label="Previous media"
        >
          ‹
        </button>
      )}

      {showNext && (
        <button
          type="button"
          onClick={() => navigateTo(activeIndex + 1, true)}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-black/60 text-white text-2xl md:text-3xl backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 z-40"
          aria-label="Next media"
        >
          ›
        </button>
      )}

      <animated.div
        ref={trackRef}
        className="relative h-full w-full max-h-[90vh] max-w-[90vw] overflow-hidden"
      >
        <animated.div
          className="flex h-full"
          style={{ transform: x.to(value => `translate3d(${value}px, 0, 0)`), height: '100%' }}
        >
          {images.map((item, index) => {
            const isActive = index === activeIndex
            const mediaIsVideo = item.mime_type?.startsWith('video/') ?? false

            return (
              <div
                key={item.id ?? index}
                className="flex items-center justify-center"
                style={{ width: slideWidth, height: '100%', flexShrink: 0, position: 'relative' }}
              >
                {mediaIsVideo ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <iframe
                      src={`https://iframe.videodelivery.net/${item.filename}`}
                      allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="w-[90vw] h-[50vh] md:h-[70vh] rounded"
                    />
                  </div>
                ) : (
                  <animated.img
                    ref={node => {
                      if (isActive) {
                        activeMediaRef.current = node
                      } else if (activeMediaRef.current === node) {
                        activeMediaRef.current = null
                      }
                    }}
                    src={getImageSrc(item)}
                    alt={item.original_filename}
                    className="select-none object-contain"
                    style={{
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      touchAction: 'none',
                      transform: isActive
                        ? to([scale, offsetX, offsetY], (s, ox, oy) => `translate3d(${ox}px, ${oy}px, 0) scale(${s})`)
                        : 'scale(1)'
                    }}
                    draggable={false}
                    onError={() => handleImageError(item)}
                  />
                )}
              </div>
            )
          })}
        </animated.div>
      </animated.div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center select-none">
        <div className="text-sm opacity-80">
          {activeIndex + 1} / {images.length}
        </div>
        <div className="text-xs opacity-60 mt-1">
          {images[activeIndex]?.original_filename}
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 select-none">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateTo(index, true)}
              className={`w-2 h-2 rounded-full ${
                index === activeIndex ? 'bg-white' : 'bg-white opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
