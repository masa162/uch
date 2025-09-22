'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  description: string | null
  content: string
  pubDate: string
  author: {
    name: string | null
    displayName: string | null
  }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams?.get('q') || ''
  
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query) {
      searchArticles(query)
    }
  }, [query])

  const searchArticles = async (searchQuery: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const response = await fetch(`${apiBase}/api/articles?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setArticles(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索に失敗しました')
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">記事検索</h1>
          <p className="text-gray-600">キーワードで記事を検索できます</p>
        </div>

        {query && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              「{query}」の検索結果: {articles.length}件
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">検索中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="alert alert-error max-w-md mx-auto">
              <span>⚠️ {error}</span>
            </div>
          </div>
        ) : articles.length === 0 && query ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">該当する記事が見つかりませんでした</p>
            <Link href="/articles" className="btn btn-primary">
              記事一覧を見る
            </Link>
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link 
                key={article.id} 
                href={`/articles/${article.slug}`}
                className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer"
              >
                <div className="card-body">
                  <h3 className="card-title text-lg line-clamp-2">{article.title}</h3>
                  {article.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">{article.description}</p>
                  )}
                  <div className="card-actions justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                      <p>by {article.author?.displayName || article.author?.name || 'Unknown'}</p>
                      <p>{formatDate(article.pubDate)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">検索キーワードを入力してください</p>
            <Link href="/articles" className="btn btn-primary">
              記事一覧を見る
            </Link>
          </div>
        )}
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
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    }>
      <SearchContent />
    </Suspense>
  )
}
