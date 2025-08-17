'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface Article {
  id: string
  title: string
  slug: string
  pubDate: string
  author: {
    name: string | null
  }
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { data: session } = useSession()

  const fetchArticles = async (pageNum: number = 1, reset: boolean = false) => {
    if (!session) return

    setLoading(true)
    try {
      const response = await fetch(`/api/articles?page=${pageNum}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        const newArticles = data.articles || []
        
        if (reset) {
          setArticles(newArticles)
        } else {
          setArticles(prev => [...prev, ...newArticles])
        }
        
        setHasMore(newArticles.length === 10)
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles(1, true)
  }, [session])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchArticles(nextPage, false)
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">記事一覧</h1>
          <button
            onClick={() => window.location.href = '/articles/new'}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
          >
            新しい記事を書く
          </button>
        </div>

        {loading && page === 1 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">まだ記事がありません</h2>
            <p className="text-gray-600 mb-6">最初の記事を書いて、家族の思い出を残しましょう</p>
            <button
              onClick={() => window.location.href = '/articles/new'}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark"
            >
              最初の記事を書く
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200"
                onClick={() => window.location.href = `/articles/${article.slug}`}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-3 hover:text-primary">
                  {article.title}
                </h2>
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <span className="mr-1">👤</span>
                    <span>{article.author.name || '匿名'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">📅</span>
                    <span>{new Date(article.pubDate).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  {loading ? '読み込み中...' : 'もっと読む'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-gray-600 hover:text-gray-800"
          >
            ← ホームに戻る
          </button>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}