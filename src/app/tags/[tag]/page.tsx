'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
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

export default function TagPage() {
  const { tag } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const decodedTag = tag ? decodeURIComponent(tag as string) : ''

  useEffect(() => {
    const fetchTagArticles = async () => {
      if (!session || !tag) return

      setLoading(true)
      try {
        const response = await fetch(`/api/articles/tag/${encodeURIComponent(tag as string)}`)
        if (response.ok) {
          const data = await response.json()
          setArticles(data.articles || [])
          setTotalCount(data.count || 0)
        } else if (response.status === 404) {
          setArticles([])
          setTotalCount(0)
        }
      } catch (error) {
        console.error('Failed to fetch tag articles:', error)
        setArticles([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchTagArticles()
  }, [session, tag])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>ログインが必要です</p>
      </div>
    )
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/articles')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            ← 記事一覧に戻る
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">🏷️</span>
            <h1 className="text-3xl font-bold text-gray-900">
              タグ: <span className="text-blue-600">#{decodedTag}</span>
            </h1>
          </div>
          
          <p className="text-gray-600">
            「{decodedTag}」タグが付いた記事: {totalCount}件
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">🏷️</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              「{decodedTag}」タグの記事が見つかりませんでした
            </h2>
            <p className="text-gray-600 mb-6">このタグが付いた記事はまだありません</p>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/articles/new')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                新しい記事を書く
              </button>
              <button
                onClick={() => router.push('/articles')}
                className="text-blue-600 hover:text-blue-800"
              >
                記事一覧を見る
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200"
                onClick={() => router.push(`/articles/${article.slug}`)}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-3 hover:text-blue-600">
                  {article.title}
                </h2>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                  <div className="flex items-center">
                    <span className="mr-1">🏷️</span>
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                      #{decodedTag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 関連タグや操作 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">その他の操作</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/search')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  記事を検索
                </button>
                <button
                  onClick={() => router.push('/archive')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  月別アーカイブ
                </button>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/articles/new')}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              新しい記事を書く
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}