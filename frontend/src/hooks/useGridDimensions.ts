import { useState, useEffect, useCallback } from 'react'

interface GridDimensions {
  width: number
  height: number
  columnCount: number
  itemWidth: number
  itemHeight: number
}

export const useGridDimensions = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [dimensions, setDimensions] = useState<GridDimensions>({
    width: 0,
    height: 0,
    columnCount: 2,
    itemWidth: 200,
    itemHeight: 200,
  })

  const getColumnCount = useCallback((width: number): number => {
    if (width < 768) return 2  // mobile
    if (width < 1024) return 3  // tablet
    return 4  // desktop
  }, [])

  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const width = rect.width
    const height = Math.max(400, window.innerHeight - 300) // 最小400px、画面に合わせて調整

    const columnCount = getColumnCount(width)
    const gap = 16 // gap-4 = 16px
    const itemWidth = (width - gap * (columnCount - 1)) / columnCount
    const itemHeight = 200 // 固定高さ

    setDimensions({
      width,
      height,
      columnCount,
      itemWidth,
      itemHeight,
    })
  }, [containerRef, getColumnCount])

  useEffect(() => {
    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [updateDimensions])

  return dimensions
}