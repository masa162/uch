'use client'

import React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

// サンプルデータ生成
const generateItems = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    description: `Description for item ${index + 1}`
  }))
}

const VirtualizationTest: React.FC = () => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  // 大量データで仮想化テスト
  const items = generateItems(10000)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // 各アイテムの高さ
    overscan: 5, // 画面外にレンダリングするアイテム数
  })

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">@tanstack/react-virtual テスト</h2>
      <div className="text-sm text-gray-600 mb-4">
        総アイテム数: {items.length}件 | 表示中: {virtualizer.getVirtualItems().length}件
      </div>

      <div
        ref={parentRef}
        className="h-96 w-full overflow-auto border border-gray-300 rounded"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index]
            return (
              <div
                key={virtualItem.key}
                className="absolute top-0 left-0 w-full px-4 py-2 border-b border-gray-200 bg-white hover:bg-gray-50"
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 text-sm text-green-600">
        ✅ @tanstack/react-virtual が正常に動作しています
      </div>
    </div>
  )
}

export default VirtualizationTest