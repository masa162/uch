'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

// 動的ルーティングのため静的エクスポートを無効化
export const dynamic = 'force-dynamic'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  tags: string[]
  createdAt: string
  author: {
    name: string | null
    email: string
    displayName: string | null
  }
}

function SearchContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalCount, setTotalCount] = useState(0)

  const query = searchParams?.get('q') || ''

  useEffect(() => {
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [query, session])

  const performSearch = async (searchTerm: string) => {
    if (!session || !searchTerm.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/articles/search?q=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
        setTotalCount(data.count || 0)
      } else {
        console.error('Search failed:', response.statusText)
        setArticles([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Failed to search articles:', error)
      setArticles([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>ログインが必要です</p>
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">検索結果</h1>
          
          {/* 検索フォーム */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="記事を検索..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <svg className="h-5 w-5 text-blue-600 hover:text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5" />
                </svg>
              </button>
            </div>
          </form>

          {query && (
            <div className="mb-6">
              <p className="text-gray-600">
                「<span className="font-semibold text-gray-800">{query}</span>」の検索結果: {totalCount}件
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">検索中...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            {query ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">検索結果が見つかりませんでした</h2>
                <p className="text-gray-600 mb-6">別のキーワードで検索してみてください</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">検索キーワードを入力してください</h2>
                <p className="text-gray-600 mb-6">記事のタイトル、内容、タグから検索できます</p>
              </>
            )}
            <button
              onClick={() => router.push('/articles')}
              className="text-blue-600 hover:text-blue-800"
            >
              記事一覧を見る
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200"
                onClick={() => router.push(`/articles/${article.slug}`)}
              >
                <h2 
                  className="text-xl font-semibold text-gray-800 mb-3 hover:text-blue-600"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(article.title, query) 
                  }}
                />
                
                <div 
                  className="text-gray-600 mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(article.content, query) 
                  }}
                />
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="mr-1">👤</span>
                      <span>{article.author.displayName || article.author.name || '匿名'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">📅</span>
                      <span>{new Date(article.createdAt).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                  
                  {article.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="mr-1">🏷️</span>
                      <div className="flex space-x-1">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="text-gray-400 text-xs">+{article.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/articles')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 記事一覧に戻る
          </button>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">検索ページを読み込み中...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    }>
      <SearchContent />
    </Suspense>
  )
}