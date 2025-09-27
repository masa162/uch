'use client'

import { useEffect, useState, useRef } from 'react'

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

// HLS Video Player Component with hls.js - Client-side only
export default function HLSVideoPlayer({ src, poster, media }: { src: string; poster?: string; media: MediaItem }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Strict client-side environment check
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined') {
      setIsClient(true)
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    if (!isClient || !isReady) return

    let hls: any = null

    const initializePlayer = async () => {
      // Additional safety checks for browser environment
      if (!videoRef.current ||
          typeof window === 'undefined' ||
          typeof document === 'undefined' ||
          typeof navigator === 'undefined') {
        return
      }

      const video = videoRef.current

      // Safari has native HLS support
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('🎬 ネイティブHLSサポート（Safari）使用')
        video.src = src
        return
      }

      // For other browsers, use hls.js - only in browser environment
      try {
        const Hls = (await import('hls.js')).default

        if (Hls.isSupported()) {
          console.log('🎬 hls.js使用でHLS再生開始')
          hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: false,
          })

          hls.loadSource(src)
          hls.attachMedia(video)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('🎬 HLSマニフェスト解析完了')
          })

          hls.on(Hls.Events.ERROR, (event: any, data: any) => {
            console.error('🎬 HLSエラー:', data)
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('🎬 ネットワークエラー、リトライ中...')
                  hls.startLoad()
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('🎬 メディアエラー、リカバリ中...')
                  hls.recoverMediaError()
                  break
                default:
                  console.log('🎬 回復不可能なエラー')
                  hls.destroy()
                  break
              }
            }
          })
        } else {
          console.error('🎬 HLSサポートなし')
        }
      } catch (error) {
        console.error('🎬 hls.js読み込みエラー:', error)
      }
    }

    initializePlayer()

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src, isClient, isReady])

  // Only render video when client-side environment is confirmed
  if (!isClient || !isReady) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">動画を読み込み中...</span>
      </div>
    )
  }

  return (
    <>
      <video
        ref={videoRef}
        className="w-full h-auto object-contain max-h-96"
        controls
        preload="metadata"
        poster={poster}
        onError={(e) => {
          console.error('🎬 動画エラー:', e)
        }}
        onLoadStart={() => {
          console.log('🎬 動画読み込み開始:', src)
        }}
        onCanPlay={() => {
          console.log('🎬 動画再生可能')
        }}
      />
    </>
  )
}