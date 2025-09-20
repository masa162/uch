'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MediaItem = {
  id: number
  filename: string
  original_filename: string
  mime_type: string
  file_size: number
  file_url: string
  thumbnail_url: string | null
  width: number | null
  height: number | null
  duration: number | null
  created_at: string
}

type Article = {
  id: string
  title: string
  slug: string
  description: string | null
  content: string
  pubDate: string
  heroImageUrl: string | null
  tags: string[]
  media?: MediaItem[]
  author: { name: string | null; email: string | null }
}

export default function ArticleDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prevArticle, setPrevArticle] = useState<Article | null>(null)
  const [nextArticle, setNextArticle] = useState<Article | null>(null)

  useEffect(() => {
    const fetchOne = async () => {
      if (!id) return
      try {
        setLoading(true)
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
        const res = await fetch(`${apiBase}/api/articles/${id}`, { credentials: 'include' })
        if (res.status === 404) {
          setError('記事が見つかりませんでした')
          setArticle(null)
          return
        }
        if (!res.ok) {
          setError(`読み込みに失敗しました (HTTP ${res.status})`)
          return
        }
        const data = await res.json()
        console.log('🎬 記事詳細取得:', data)
        console.log('🎬 取得したメディア:', data.media)
        console.log('🎬 メディア数:', data.media?.length || 0)
        setArticle(data as Article)
        
        // 前後の記事を取得
        try {
          const allArticlesRes = await fetch(`${apiBase}/api/articles`, { credentials: 'include' })
          if (allArticlesRes.ok) {
            const allArticles = await allArticlesRes.json() as Article[]
            const currentIndex = allArticles.findIndex(a => a.id === id)
            
            if (currentIndex > 0) {
              setPrevArticle(allArticles[currentIndex - 1])
            }
            if (currentIndex < allArticles.length - 1) {
              setNextArticle(allArticles[currentIndex + 1])
            }
          }
        } catch (e) {
          console.error('Failed to fetch adjacent articles:', e)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchOne()
  }, [id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  return (
    <AuthenticatedLayout>
      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="alert alert-error max-w-md mx-auto">
            <span>⚠️ {error}</span>
          </div>
          <button className="btn btn-primary mt-4" onClick={() => router.push('/articles')}>一覧へ戻る</button>
        </div>
      ) : article ? (
        <article className="prose max-w-none">
          <h1 className="mb-2">{article.title}</h1>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              by {article.author?.name || 'Unknown'} ・ {formatDate(article.pubDate)}
            </p>
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="badge badge-outline badge-sm hover:badge-primary transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {article.heroImageUrl && (
            <img src={article.heroImageUrl} alt={article.title} className="rounded-lg mb-6" />
          )}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content || ''}
          </ReactMarkdown>

          {/* 添付メディア */}
          {article.media && article.media.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-bold mb-4">📷 添付メディア</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {article.media.map((media) => (
                  <div key={media.id} className="border border-base-300 rounded-lg overflow-hidden">
                    {media.mime_type.startsWith('image/') ? (
                      <img
                        src={`https://api.uchinokiroku.com/api/media/${media.id}`}
                        alt={media.original_filename}
                        className="w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(`https://api.uchinokiroku.com/api/media/${media.id}`, '_blank')}
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBDOTAuNDc3IDgwIDgyIDcxLjUyMyA4MiA2MkM4MiA1Mi40NzcgOTAuNDc3IDQ0IDEwMCA0NEMxMDkuNTIzIDQ0IDExOCA1Mi40NzcgMTE4IDYyQzExOCA3MS41MjMgMTA5LjUyMyA4MCAxMDAgODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
                        }}
                      />
                    ) : media.mime_type.startsWith('video/') ? (
                      <div className="relative">
                        <video
                          className="w-full h-32 object-cover"
                          controls
                          preload="metadata"
                        >
                          <source src={`https://api.uchinokiroku.com/api/media/${media.id}`} type={media.mime_type} />
                          お使いのブラウザは動画をサポートしていません。
                        </video>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-base-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-2">📄</div>
                          <div className="text-xs text-base-content/60">ファイル</div>
                        </div>
                      </div>
                    )}
                    <div className="p-2">
                      <div className="text-sm font-medium truncate">{media.original_filename}</div>
                      <div className="text-xs text-base-content/60">
                        {Math.round(media.file_size / 1024)}KB
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 前後の記事ナビゲーション */}
          {(prevArticle || nextArticle) && (
            <div className="mt-12 border-t pt-8">
              <div className="flex justify-between items-start gap-4">
                {prevArticle ? (
                  <Link 
                    href={`/articles/${prevArticle.id}`}
                    className="flex-1 p-4 border border-base-300 rounded-lg hover:bg-base-100 transition-colors"
                  >
                    <div className="text-sm text-base-content/70 mb-1">← 前の記事</div>
                    <div className="font-medium text-base-content">{prevArticle.title}</div>
                    <div className="text-xs text-base-content/50 mt-1">
                      by {prevArticle.author?.name || 'Unknown'} ・ {formatDate(prevArticle.pubDate)}
                    </div>
                  </Link>
                ) : (
                  <div className="flex-1"></div>
                )}
                
                {nextArticle ? (
                  <Link 
                    href={`/articles/${nextArticle.id}`}
                    className="flex-1 p-4 border border-base-300 rounded-lg hover:bg-base-100 transition-colors text-right"
                  >
                    <div className="text-sm text-base-content/70 mb-1">次の記事 →</div>
                    <div className="font-medium text-base-content">{nextArticle.title}</div>
                    <div className="text-xs text-base-content/50 mt-1">
                      by {nextArticle.author?.name || 'Unknown'} ・ {formatDate(nextArticle.pubDate)}
                    </div>
                  </Link>
                ) : (
                  <div className="flex-1"></div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex gap-3">
            <Link href={`/articles/${encodeURIComponent(id as string)}/edit`} className="btn btn-outline">編集する</Link>
            <Link href="/articles" className="btn">一覧へ戻る</Link>
          </div>
        </article>
      ) : null}
    </AuthenticatedLayout>
  )
}
