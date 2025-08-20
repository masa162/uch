'use client'

import { useState, useEffect } from 'react'
import PublicLayout from '@/components/PublicLayout'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  slug: string
  description: string | null
  pubDate: string
  heroImageUrl: string | null
  tags: string[]
  author: {
    name: string | null
    email: string | null
  }
  _count: {
    comments: number
    likes: number
  }
}

export default function EssayPage() {
  const tag = 'エッセイ'
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArticlesByTag()
  }, [])

  const fetchArticlesByTag = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/articles/tag/${encodeURIComponent(tag)}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      } else if (response.status === 404) {
        setArticles([])
      } else {
        throw new Error('エッセイの取得に失敗しました')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
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


  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">エッセイを読み込み中...</p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="text-center py-8">
          <div className="alert alert-error max-w-md mx-auto">
            <span>⚠️ {error}</span>
          </div>
          <button 
            onClick={fetchArticlesByTag}
            className="btn btn-primary mt-4"
          >
            再試行
          </button>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📝 エッセイ一覧</h1>
            <p className="text-gray-600">{articles.length}件のエッセイが見つかりました</p>
          </div>
          <div className="flex gap-2">
            <Link 
              href="/articles"
              className="btn btn-outline"
            >
              📚 記事一覧
            </Link>
            <Link 
              href="/articles/new"
              className="btn btn-primary"
            >
              ✍️ 新しい記事を書く
            </Link>
          </div>
        </div>

        {/* エッセイ一覧 */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">まだエッセイがありません</h2>
            <p className="text-gray-600 mb-6">「エッセイ」タグを付けた記事がまだありません</p>
            <div className="space-x-4">
              <Link 
                href="/articles/new"
                className="btn btn-primary btn-lg"
              >
                最初のエッセイを書く
              </Link>
              <Link 
                href="/articles"
                className="btn btn-outline"
              >
                記事一覧を見る
              </Link>
            </div>
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
                        <span>👤 {article.author.name || article.author.email}</span>
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
                        {article.tags.map((tagName) => (
                          <Link 
                            key={tagName}
                            href={`/tags/${encodeURIComponent(tagName)}`}
                            className={`badge ${tagName === 'エッセイ' ? 'badge-primary' : 'badge-outline'} hover:badge-primary transition-colors`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {tagName}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}