'use client'

import nextDynamic from 'next/dynamic'

// Force dynamic rendering to avoid SSR issues with hls.js
export const dynamic = 'force-dynamic'

// Dynamic import ArticleDetailContent with SSR completely disabled
const ArticleDetailContent = nextDynamic(
  () => import('@/components/ArticleDetailContent'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-base-content/70">記事を読み込み中...</p>
        </div>
      </div>
    )
  }
)

export default function ArticleDetailPage() {
  return <ArticleDetailContent />
}