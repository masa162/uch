'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'
import dynamic from 'next/dynamic'
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
    // Only fetch articles after authentication state is resolved
    if (!authLoading) {
      fetchArticles()
    }
  }, [authLoading])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/articles')
      if (!response.ok) {
        throw new Error('記事の取得に失敗しました')
      }
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteArticle = async (article: Article) => {
    if (confirm(`「${article.title}」を削除しますか？この操作は元に戻せません。`)) {
      try {
        const response = await fetch(`/api/articles/${article.slug}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          alert('記事が削除されました')
          fetchArticles() // 記事一覧を再取得
        } else {
          const errorData = await response.json()
          alert(errorData.message || '削除に失敗しました')
        }
      } catch (err) {
        alert('削除中にエラーが発生しました')
      }
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
            <Link 
              href="/articles/new"
              className="btn btn-primary btn-lg"
            >
              最初の記事を書く
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {articles.map((article) => (
              <Link 
                key={article.id}
                href={`/articles/${article.slug}`}
                className="block"
              >
                <article 
                  className="card bg-base-100 shadow-lg hover:shadow-xl hover:bg-base-200 transition-all duration-200 cursor-pointer group"
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h2 className="card-title text-xl mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h2>
                        {article.description && (
                          <p className="text-gray-600 mb-3">{article.description}</p>
                        )}
                      </div>
                      <div className="ml-4">
                        <img 
                          src={article.heroImageUrl || '/images/ogp/ogp.png'} 
                          alt={article.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                    
                    {/* メタ情報 */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>👤 {article.author.displayName || article.author.name || article.author.email}</span>
                        <span>📅 {formatDate(article.pubDate)}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>💬 {article._count.comments}</span>
                        <span>❤️ {article._count.likes}</span>
                      </div>
                    </div>

                    {/* タグ */}
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.tags.map((tag) => (
                          <Link 
                            key={tag}
                            href={`/tags/${encodeURIComponent(tag)}`}
                            className="badge badge-primary badge-outline hover:badge-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* アクションボタン */}
                    <div className="card-actions justify-end mt-4" onClick={(e) => e.stopPropagation()}>
                      {user?.email === article.author.email && (
                        <>
                          <Link 
                            href={`/articles/${article.slug}/edit`}
                            className="btn btn-primary btn-sm"
                          >
                            編集
                          </Link>
                          <button 
                            className="btn btn-error btn-sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              runAuthAction(() => handleDeleteArticle(article))
                            }}
                          >
                            削除
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}