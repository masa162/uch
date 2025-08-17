'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const [tags, setTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/articles/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error('タグの取得に失敗しました:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <aside className="w-1/4 block">
      <div className="sticky top-6">
        {/* サイトロゴ - TOPページリンク */}
        <div className="w-fit mx-auto mt-4 mb-4">
          <button
            onClick={() => router.push('/')}
            className="block"
            aria-label="トップページへ"
          >
            <img
              src="/images/ogp/ogp.png"
              alt="うちのきろく ロゴ画像"
              className="rounded-lg shadow hover:shadow-xl transition ease-in-out hover:scale-[102%] max-w-44 w-auto h-auto"
              width="300"
              height="300"
            />
          </button>
        </div>

        {/* 検索ボックス */}
        <div className="bg-base-100 p-4 rounded-lg shadow hover:shadow-xl transition ease-in-out hover:scale-[102%] mb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="記事を検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="sr-only">検索</span>
                <svg className="h-5 w-5 text-primary hover:text-primary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* 発見とメモ */}
        <div className="bg-base-100 p-4 rounded-lg shadow hover:shadow-xl transition ease-in-out hover:scale-[102%] mb-4">
          <h3 className="text-sm font-semibold text-primary-dark mb-2">🔍 発見とメモ</h3>
          <ul className="space-y-0.5 text-sm">
            <li>
              <button 
                onClick={() => router.push('/tags')}
                className="block text-left text-gray-600 hover:text-primary hover:bg-primary-light px-2 py-1.5 rounded w-full transition-colors"
              >
                🏷 タグ一覧
              </button>
            </li>
            <li>
              <button 
                onClick={() => router.push('/archive')}
                className="block text-left text-gray-600 hover:text-primary hover:bg-primary-light px-2 py-1.5 rounded w-full transition-colors"
              >
                📂 月別アーカイブ
              </button>
            </li>
            <li>
              <button 
                onClick={() => router.push('/essays')}
                className="block text-left text-gray-600 hover:text-primary hover:bg-primary-light px-2 py-1.5 rounded w-full transition-colors"
              >
                📝 エッセイ
              </button>
            </li>
          </ul>
        </div>

        {/* よく使われるタグ */}
        <div className="bg-base-100 p-4 rounded-lg shadow hover:shadow-xl transition ease-in-out hover:scale-[102%]">
          <h3 className="text-sm font-semibold text-primary-dark mb-3">🏷️ タグ一覧</h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/tags/${tag}`)}
                className="inline-block bg-primary-light text-primary-dark text-sm px-2 py-1 rounded hover:bg-primary hover:text-white cursor-pointer transition-colors"
              >
                #{tag}
              </button>
            ))}
            {tags.length === 0 && (
              <p className="text-gray-500 text-sm">まだタグがありません</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}