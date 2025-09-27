'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Dynamic import HLSVideoPlayer with SSR disabled
const HLSVideoPlayer = dynamic(
  () => import('@/components/HLSVideoPlayer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">動画プレーヤーを読み込み中...</span>
      </div>
    )
  }
)

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

export default function ArticleDetailContent() {
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setArticle(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : '記事の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchOne()
  }, [id])

  useEffect(() => {
    const fetchSiblings = async () => {
      if (!article?.id) return
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
        const res = await fetch(`${apiBase}/api/articles/${article.id}/siblings`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setPrevArticle(data.prev || null)
          setNextArticle(data.next || null)
        }
      } catch (e) {
        console.error('兄弟記事取得エラー:', e)
      }
    }
    fetchSiblings()
  }, [article?.id])

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (!article) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">記事が見つかりません</h1>
          <Link href="/articles" className="btn btn-primary">記事一覧に戻る</Link>
        </div>
      </AuthenticatedLayout>
    )
  }

  const getMediaDisplayUrl = (item: MediaItem) => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
    if (item.mime_type.startsWith('video/') && item.file_url.endsWith('.m3u8')) {
      return item.file_url
    }
    return `${apiBase}/api/media/${item.id}/image`
  }

  const getMediaThumbnailUrl = (item: MediaItem) => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
    if (item.thumbnail_url) {
      return item.thumbnail_url
    }
    return `${apiBase}/api/media/${item.id}/image`
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <nav className="breadcrumbs text-sm mb-6">
          <ul>
            <li><Link href="/" className="text-primary hover:text-primary-focus">ホーム</Link></li>
            <li><Link href="/articles" className="text-primary hover:text-primary-focus">記事一覧</Link></li>
            <li className="text-base-content opacity-70">{article.title}</li>
          </ul>
        </nav>

        <article className="prose prose-lg max-w-none">
          {article.heroImageUrl && (
            <div className="mb-8">
              <img
                src={article.heroImageUrl}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
              <time dateTime={article.pubDate}>
                📅 {new Date(article.pubDate).toLocaleDateString('ja-JP')}
              </time>
              {article.author.name && (
                <span>✍️ {article.author.name}</span>
              )}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${encodeURIComponent(tag)}`}
                      className="badge badge-outline badge-sm hover:badge-primary"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {article.description && (
              <p className="text-lg text-base-content/80 mt-4 font-normal">
                {article.description}
              </p>
            )}
          </header>

          <div className="prose-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>

          {article.media && article.media.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">📎 関連メディア</h2>
              <div className="grid gap-6">
                {article.media.map((item) => (
                  <div key={item.id} className="border border-base-300 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {item.mime_type.startsWith('image/') ? (
                          <span className="text-2xl">🖼️</span>
                        ) : item.mime_type.startsWith('video/') ? (
                          <span className="text-2xl">🎬</span>
                        ) : (
                          <span className="text-2xl">📄</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium mb-2">{item.original_filename}</h3>
                        <div className="text-sm text-base-content/70 mb-4">
                          <span className="mr-4">📁 {item.mime_type}</span>
                          <span className="mr-4">📊 {(item.file_size / 1024 / 1024).toFixed(2)} MB</span>
                          {item.width && item.height && (
                            <span className="mr-4">📐 {item.width}×{item.height}</span>
                          )}
                          {item.duration && (
                            <span>⏱️ {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}</span>
                          )}
                        </div>

                        {item.mime_type.startsWith('image/') && (
                          <img
                            src={getMediaDisplayUrl(item)}
                            alt={item.original_filename}
                            className="max-w-full h-auto rounded border"
                          />
                        )}

                        {item.mime_type.startsWith('video/') && (
                          <div className="video-container">
                            {item.file_url.endsWith('.m3u8') ? (
                              <HLSVideoPlayer
                                src={item.file_url}
                                poster={getMediaThumbnailUrl(item)}
                                media={item}
                              />
                            ) : (
                              <video
                                src={getMediaDisplayUrl(item)}
                                controls
                                poster={getMediaThumbnailUrl(item)}
                                className="w-full h-auto object-contain max-h-96"
                                preload="metadata"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-12 pt-8 border-t border-base-300">
            <div className="flex justify-between items-center">
              <Link href="/articles" className="btn btn-outline">
                ← 記事一覧に戻る
              </Link>
              <Link href={`/articles/${id}/edit`} className="btn btn-primary">
                ✏️ 編集
              </Link>
            </div>

            {(prevArticle || nextArticle) && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">関連記事</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prevArticle && (
                    <Link
                      href={`/articles/${prevArticle.id}`}
                      className="card bg-base-100 border border-base-300 hover:shadow-lg transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="text-xs text-primary mb-1">← 前の記事</div>
                        <div className="font-medium line-clamp-2">{prevArticle.title}</div>
                      </div>
                    </Link>
                  )}
                  {nextArticle && (
                    <Link
                      href={`/articles/${nextArticle.id}`}
                      className="card bg-base-100 border border-base-300 hover:shadow-lg transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="text-xs text-primary mb-1">次の記事 →</div>
                        <div className="font-medium line-clamp-2">{nextArticle.title}</div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </footer>
        </article>
      </div>
    </AuthenticatedLayout>
  )
}