'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { useTags } from '@/hooks/useTags'

export default function TagIndexPage() {
  const { tags, loading, error, refetch } = useTags()

  const sortedTags = useMemo(() => {
    if (!tags || tags.length === 0) return []
    return [...tags].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }, [tags])

  let content

  if (loading) {
    content = (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  } else if (error) {
    content = (
      <div className="alert alert-error flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10 3h4l1 2h5a1 1 0 011 1v2h-2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8H4V6a1 1 0 011-1h5l1-2z" />
          </svg>
          <span>タグの取得に失敗しました: {error}</span>
        </div>
        <button className="btn btn-sm btn-primary self-start" onClick={refetch}>
          再読み込み
        </button>
      </div>
    )
  } else if (sortedTags.length === 0) {
    content = (
      <div className="text-center py-16 space-y-4">
        <div className="text-6xl">🏷️</div>
        <h2 className="text-2xl font-semibold">まだタグがありません</h2>
        <p className="text-base-content/70">記事を投稿して、タグをつけてみましょう。</p>
        <div className="space-x-3">
          <Link href="/articles/new" className="btn btn-primary">
            新しい記事を書く
          </Link>
          <Link href="/articles" className="btn btn-outline">
            記事一覧を見る
          </Link>
        </div>
      </div>
    )
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedTags.map((tag) => (
          <Link
            key={tag.name}
            href={`/tag/${encodeURIComponent(tag.name)}`}
            className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">🏷️</span>
                <span className="badge badge-primary badge-outline">
                  {tag.count}件
                </span>
              </div>
              <h3 className="card-title text-lg line-clamp-2 mb-2">{tag.name}</h3>
              <p className="text-sm text-base-content/60">
                タグ付きの記事を見る
              </p>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">タグ一覧</h1>
          <p className="text-base-content/70">家族の思い出を彩るタグから、気になるテーマを見つけましょう。</p>
        </div>
        {content}
      </div>
    </AuthenticatedLayout>
  )
}
