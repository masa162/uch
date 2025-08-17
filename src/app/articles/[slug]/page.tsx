'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  heroImage?: string
  tags: string[]
  pubDate: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    likes: number
    comments: number
  }
  isLikedByUser: boolean
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    name: string | null
    email: string
  }
}

export default function ArticleDetailPage() {
  const { slug } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [likingArticle, setLikingArticle] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      if (!session || !slug) return

      try {
        const response = await fetch(`/api/articles/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setArticle(data)
        } else if (response.status === 404) {
          alert('記事が見つかりません')
          router.push('/articles')
        }
      } catch (error) {
        console.error('Failed to fetch article:', error)
        alert('記事の読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [session, slug, router])

  useEffect(() => {
    const fetchComments = async () => {
      if (!session || !slug) return

      try {
        const response = await fetch(`/api/articles/${slug}/comments`)
        if (response.ok) {
          const data = await response.json()
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      }
    }

    fetchComments()
  }, [session, slug])

  const handleLike = async () => {
    if (!session || !article || likingArticle) return

    setLikingArticle(true)
    try {
      const response = await fetch(`/api/articles/${slug}/like`, {
        method: article.isLikedByUser ? 'DELETE' : 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setArticle(prev => prev ? {
          ...prev,
          isLikedByUser: data.isLiked,
          _count: {
            ...prev._count,
            likes: data.likeCount
          }
        } : null)
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
      alert('いいねの処理に失敗しました')
    } finally {
      setLikingArticle(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !commentText.trim() || submittingComment) return

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/articles/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        setCommentText('')
        
        // コメント数を更新
        setArticle(prev => prev ? {
          ...prev,
          _count: {
            ...prev._count,
            comments: prev._count.comments + 1
          }
        } : null)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'コメントの投稿に失敗しました')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('コメントの投稿に失敗しました')
    } finally {
      setSubmittingComment(false)
    }
  }

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

  if (!article) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">記事が見つかりません</h2>
            <button
              onClick={() => router.push('/articles')}
              className="text-blue-600 hover:text-blue-800"
            >
              記事一覧に戻る
            </button>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 記事ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/articles')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            ← 記事一覧に戻る
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
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
            {article.tags.length > 0 && (
              <div className="flex items-center">
                <span className="mr-1">🏷️</span>
                <div className="flex space-x-1">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* いいね・コメント数 */}
          <div className="flex items-center space-x-6 mb-6">
            <button
              onClick={handleLike}
              disabled={likingArticle}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full transition ${
                article.isLikedByUser
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              <span>{article.isLikedByUser ? '❤️' : '🤍'}</span>
              <span>{article._count.likes}</span>
            </button>
            
            <div className="flex items-center space-x-1 text-gray-600">
              <span>💬</span>
              <span>{article._count.comments} コメント</span>
            </div>
          </div>
        </div>

        {/* ヒーロー画像 */}
        {article.heroImage && (
          <div className="mb-8">
            <img
              src={article.heroImage}
              alt={article.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* 記事内容 */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {article.content}
          </div>
        </div>

        {/* コメントセクション */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            コメント ({comments.length})
          </h3>

          {/* コメント投稿フォーム */}
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="mb-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="コメントを書く..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={!commentText.trim() || submittingComment}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submittingComment ? 'コメント中...' : 'コメントする'}
            </button>
          </form>

          {/* コメント一覧 */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">まだコメントがありません</p>
                <p className="text-sm text-gray-500 mt-1">最初のコメントを書いてみませんか？</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-800">
                      {comment.author.name || '匿名'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}