'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'
import { useAuthAction } from '@/hooks/useAuthAction'

interface Article {
  id: string
  title: string
  slug: string
  description: string | null
  content: string
  pubDate: string
  authorId: string
  heroImageUrl: string | null
  tags: string[]
  isPublished: boolean
  author: {
    name: string | null
    email: string | null
    displayName: string | null
  }
  _count: {
    comments: number
    likes: number
  }
}

export default function ArticlesPage() {
  const { user, loading: authLoading } = useAuth()
  const { runAuthAction } = useAuthAction()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) {
      fetchArticles()
    }
  }, [authLoading])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const res = await fetch(`${apiBase}/api/articles`, { credentials: 'include' })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = (await res.json()) as unknown
      setArticles(Array.isArray(data) ? (data as Article[]) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
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

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">記事を読み込み中...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-8">
          <div className="alert alert-error max-w-md mx-auto">
            <span>⚠️ {error}</span>
          </div>
          <button 
            onClick={fetchArticles}
            className="btn btn-primary mt-4"
          >
            再試行
          </button>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📚 記事一覧</h1>
            <p className="text-gray-600">みんなの思い出を共有しましょう</p>
          </div>
          <div className="flex gap-2">
            <Link 
              href="/search"
              className="btn btn-outline"
            >
              🔍 検索
            </Link>
            <Link 
              href="/articles/new"
              className="btn btn-primary"
            >
              ✍️ 新しい記事を書く
            </Link>
          </div>
        </div>

        {/* 記事一覧 */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">まだ記事がありません</h2>
            <p className="text-gray-600 mb-6">最初の記事を書いて、思い出を残しましょう</p>
            <Link href="/articles/new" className="btn btn-primary btn-lg">
              最初の記事を書く
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <h3 className="card-title text-xl line-clamp-2">{article.title}</h3>
                  {article.description && (
                    <p className="text-gray-600 line-clamp-3">{article.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-3">
                    <p>by {article.author?.name || 'Unknown'}</p>
                    <p>{formatDate(article.pubDate)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
