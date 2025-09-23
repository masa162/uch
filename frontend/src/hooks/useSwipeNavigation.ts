'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { useGesture } from '@use-gesture/react'

// スワイプ設定（モバイル最適化）
export const SWIPE_CONFIG = {
  // 方向判定（より敏感に）
  horizontalThreshold: 1.5,    // velocityX/velocityY > 1.5でX方向判定

  // 距離判定（より少ない距離で遷移）
  distanceThreshold: 0.15,     // 画面幅の15%移動で遷移

  // 速度判定（より低速でも反応）
  velocityThreshold: 0.2,      // 最小フリック速度

  // 境界判定
  boundaryDetectionMargin: 0.9 // 境界90%位置でスワイプ有効
}

// ジェスチャー状態
export interface GestureState {
  scale: number
  positionX: number
  positionY: number
  isAtLeftBoundary: boolean
  isAtRightBoundary: boolean
  enableSwipeTransition: boolean
}

// ジェスチャー優先制御
export type GesturePriority = 'swipe_primary' | 'swipe_secondary' | 'pan_primary'

export const getGesturePriority = (
  scale: number,
  position: { x: number; y: number },
  isAtLeftBoundary: boolean,
  isAtRightBoundary: boolean
): GesturePriority => {
  if (scale <= 1.1) return 'swipe_primary'      // 等倍時：スワイプ優先

  // ズーム時は境界でのみスワイプ可能
  if (isAtLeftBoundary || isAtRightBoundary) return 'swipe_secondary'

  return 'pan_primary'                          // ズーム中：パン優先
}

// 境界検出
export const detectImageBoundary = (
  positionX: number,
  scale: number,
  containerWidth: number = typeof window !== 'undefined' ? window.innerWidth : 1
) => {
  const imageWidth = containerWidth * scale
  const maxPanDistance = (imageWidth - containerWidth) / 2

  const leftBoundaryThreshold = maxPanDistance * SWIPE_CONFIG.boundaryDetectionMargin
  const rightBoundaryThreshold = -maxPanDistance * SWIPE_CONFIG.boundaryDetectionMargin

  return {
    isAtLeft: positionX >= leftBoundaryThreshold,
    isAtRight: positionX <= rightBoundaryThreshold
  }
}

// スワイプナビゲーションフック
export const useSwipeNavigation = ({
  currentIndex,
  totalImages,
  onNavigate,
  onSwipeStart,
  onSwipeProgress,
  onSwipeComplete
}: {
  currentIndex: number
  totalImages: number
  onNavigate: (index: number) => void
  onSwipeStart?: () => void
  onSwipeProgress?: (progress: number, direction: 'prev' | 'next') => void
  onSwipeComplete?: (direction: 'prev' | 'next') => void
}) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    scale: 1,
    positionX: 0,
    positionY: 0,
    isAtLeftBoundary: false,
    isAtRightBoundary: false,
    enableSwipeTransition: true
  })

  const [isTransitioning, setIsTransitioning] = useState(false)
  const [swipeProgress, setSwipeProgress] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<'prev' | 'next' | null>(null)

  // デバッグログ
  const addDebugLog = useCallback((message: string) => {
    console.log(`[SwipeNavigation] ${message}`)
  }, [])

  // 画像遷移実行
  const triggerImageTransition = useCallback((
    direction: 'prev' | 'next',
    velocity: number
  ) => {
    const nextIndex = direction === 'next' ?
      Math.min(currentIndex + 1, totalImages - 1) :
      Math.max(currentIndex - 1, 0)

    addDebugLog(`Trigger transition: ${direction} to index ${nextIndex} (velocity: ${velocity.toFixed(2)})`)

    // 境界チェック
    if (nextIndex === currentIndex) {
      addDebugLog('At boundary - bounce effect')
      // TODO: バウンス効果実装
      return
    }

    // 遷移実行
    setIsTransitioning(true)
    onNavigate(nextIndex)
    onSwipeComplete?.(direction)

    // 遷移完了後のクリーンアップ
    setTimeout(() => {
      setIsTransitioning(false)
      setSwipeProgress(0)
      setSwipeDirection(null)
    }, 300)
  }, [currentIndex, totalImages, onNavigate, onSwipeComplete, addDebugLog])

  // ジェスチャーハンドラー（安定性重視）
  const gestureHandlers = useGesture({
    onDrag: ({
      movement: [mx, my],
      velocity: [vx, vy],
      last,
      cancel,
      direction: [dirX],
      active,
      first,
      event
    }) => {
      // 遷移中は無効
      if (isTransitioning) {
        cancel?.()
        return
      }

      // 1. 早期方向判定（より厳密に）
      const absVx = Math.abs(vx)
      const absVy = Math.abs(vy)
      const absMx = Math.abs(mx)
      const absMy = Math.abs(my)

      // 最初のフレームでの方向判定を強化
      if (first || absMx < 5) {
        // 初期判定は距離ベース
        if (absMy > absMx * 0.5) {
          // 縦方向が強い場合は早期リターン
          return
        }
      } else {
        // 進行中は速度ベース
        const isHorizontalSwipe = absVx > absVy * SWIPE_CONFIG.horizontalThreshold
        if (!isHorizontalSwipe) {
          return
        }
      }

      // 2. ジェスチャー優先判定
      const priority = getGesturePriority(
        gestureState.scale,
        { x: gestureState.positionX, y: gestureState.positionY },
        gestureState.isAtLeftBoundary,
        gestureState.isAtRightBoundary
      )

      // パン優先の場合はreact-zoom-pan-pinchに委譲
      if (priority === 'pan_primary') {
        addDebugLog('Pan priority - delegating to zoom component')
        return
      }

      // ブラウザのデフォルト動作を防止
      event.preventDefault?.()

      // 3. スワイプ開始処理
      if (first) {
        onSwipeStart?.()
        addDebugLog('Swipe gesture started')
      }

      // 4. スワイプ進行度計算
      const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1
      const progress = mx / containerWidth
      const direction = dirX > 0 ? 'prev' : 'next'

      setSwipeProgress(progress)
      setSwipeDirection(direction)
      onSwipeProgress?.(Math.abs(progress), direction)

      addDebugLog(`Swipe progress: ${(progress * 100).toFixed(1)}% (${direction}) vel=${absVx.toFixed(2)}`)

      // 5. スワイプ完了判定（より敏感に）
      if (last) {
        const swipeDistance = Math.abs(progress)
        const shouldTransition =
          swipeDistance > SWIPE_CONFIG.distanceThreshold ||
          absVx > SWIPE_CONFIG.velocityThreshold

        addDebugLog(`Swipe end: distance=${(swipeDistance * 100).toFixed(1)}% velocity=${absVx.toFixed(2)} shouldTransition=${shouldTransition}`)

        if (shouldTransition) {
          triggerImageTransition(direction, vx)
        } else {
          // 元位置に戻る
          setSwipeProgress(0)
          setSwipeDirection(null)
          addDebugLog('Swipe cancelled - returning to original position')
        }
      }
    }
  }, {
    drag: {
      threshold: 5,        // 閾値を下げて敏感に
      filterTaps: true,
      preventDefault: true // より積極的に制御
    }
  })

  // ジェスチャー状態更新
  const updateGestureState = useCallback((newState: Partial<GestureState>) => {
    setGestureState(prev => ({ ...prev, ...newState }))
  }, [])

  // ズーム状態監視用のコールバック
  const handleZoomChange = useCallback((scale: number, positionX: number, positionY: number) => {
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1
    const boundary = detectImageBoundary(positionX, scale, containerWidth)

    updateGestureState({
      scale,
      positionX,
      positionY,
      isAtLeftBoundary: boundary.isAtLeft,
      isAtRightBoundary: boundary.isAtRight,
      enableSwipeTransition: scale <= 1.1 || boundary.isAtLeft || boundary.isAtRight
    })

    addDebugLog(`Zoom state: scale=${scale.toFixed(2)} pos=[${positionX.toFixed(0)}, ${positionY.toFixed(0)}] boundaries=[${boundary.isAtLeft}, ${boundary.isAtRight}]`)
  }, [updateGestureState, addDebugLog])

  return {
    gestureHandlers,
    gestureState,
    isTransitioning,
    swipeProgress,
    swipeDirection,
    canSwipePrev: currentIndex > 0 && gestureState.enableSwipeTransition,
    canSwipeNext: currentIndex < totalImages - 1 && gestureState.enableSwipeTransition,
    handleZoomChange,
    updateGestureState
  }
}