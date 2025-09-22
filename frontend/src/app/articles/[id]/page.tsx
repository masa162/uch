'use client'

import { useEffect, useState, useRef } from 'react'
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

// HLS Video Player Component with hls.js
function HLSVideoPlayer({ src, poster, media }: { src: string; poster?: string; media: MediaItem }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let hls: any = null

    const initializePlayer = async () => {
      if (!videoRef.current) return

      const video = videoRef.current

      // Safari has native HLS support
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('🎬 ネイティブHLSサポート（Safari）使用')
        video.src = src
        return
      }

      // For other browsers, use hls.js
      const Hls = (await import('hls.js')).default

      if (Hls.isSupported()) {
        console.log('🎬 hls.js使用でHLS再生開始')
        hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: false,
        })

        hls.loadSource(src)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('🎬 HLSマニフェスト解析完了')
        })

        hls.on(Hls.Events.ERROR, (event: any, data: any) => {
          console.error('🎬 HLSエラー:', data)
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('🎬 ネットワークエラー、リトライ中...')
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('🎬 メディアエラー、リカバリ中...')
                hls.recoverMediaError()
                break
              default:
                console.log('🎬 回復不可能なエラー')
                hls.destroy()
                break
            }
          }
        })
      } else {
        console.error('🎬 HLSサポートなし')
      }
    }

    initializePlayer()

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src])

  return (
    <>
      <video
        ref={videoRef}
        className="w-full h-auto object-contain max-h-96"
        controls
        preload="metadata"
        poster={poster}
        onError={(e) => {
          console.error('🎬 動画エラー:', e)
        }}
        onLoadStart={() => {
          console.log('🎬 動画読み込み開始:', src)
        }}
        onCanPlay={() => {
          console.log('🎬 動画再生可能')
        }}
      />
      {/* デバッグ情報は本番では非表示
      <div className="text-xs text-gray-500 mt-2">
        動画ファイル: {media.original_filename} ({media.mime_type})
        <br />
        Cloudflare Stream HLS: {src}
      </div>
      */}
    </>
  )
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
        const data = await res.json() as Article
        console.log('🎬 記事詳細取得:', data)
        console.log('🎬 取得したメディア:', data.media)
        console.log('🎬 メディア数:', data.media?.length || 0)
        setArticle(data)
        
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
              <div className="space-y-4">
                {article.media.map((media) => (
                  <div key={media.id} className="border border-base-300 rounded-lg overflow-hidden">
                    {media.mime_type.startsWith('image/') ? (
                      <img
                        src={`https://api.uchinokiroku.com/api/media/${media.id}`}
                        alt={media.original_filename}
                        className="w-full max-w-full h-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBDOTAuNDc3IDgwIDgyIDcxLjUyMyA4MiA2MkM4MiA1Mi40NzcgOTAuNDc3IDQ0IDEwMCA0NEMxMDkuNTIzIDQ0IDExOCA1Mi40NzcgMTE4IDYyQzExOCA3MS41MjMgMTA5LjUyMyA4MCAxMDAgODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
                        }}
                      />
                    ) : media.mime_type.startsWith('video/') ? (
                      <div className="relative">
                        {/* Cloudflare Streamの場合とローカルファイルの場合を分岐 */}
                        {media.file_url && media.file_url.includes('manifest/video.m3u8') ? (
                          // Cloudflare Stream HLS with hls.js
                          <HLSVideoPlayer
                            src={media.file_url}
                            poster={media.thumbnail_url || undefined}
                            media={media}
                          />
                        ) : (
                          // 通常のファイル配信
                          <video
                            className="w-full h-auto object-contain max-h-96"
                            controls
                            preload="metadata"
                            poster={media.thumbnail_url || undefined}
                            onError={(e) => {
                              console.error('🎬 動画読み込みエラー:', {
                                mediaId: media.id,
                                filename: media.original_filename,
                                mimeType: media.mime_type,
                                src: `https://api.uchinokiroku.com/api/media/${media.id}`,
                                error: e
                              })
                            }}
                            onLoadStart={() => {
                              console.log('🎬 動画読み込み開始:', {
                                mediaId: media.id,
                                filename: media.original_filename,
                                mimeType: media.mime_type,
                                src: `https://api.uchinokiroku.com/api/media/${media.id}`
                              })
                            }}
                          >
                            <source src={`https://api.uchinokiroku.com/api/media/${media.id}`} type={media.mime_type} />
                            お使いのブラウザは動画をサポートしていません。
                          </video>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-base-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-2">📄</div>
                          <div className="text-xs text-base-content/60">ファイル</div>
                        </div>
                      </div>
                    )}
                    {/* ファイル情報は本番では非表示
                    <div className="p-2">
                      <div className="text-sm font-medium truncate">{media.original_filename}</div>
                      <div className="text-xs text-base-content/60">
                        {Math.round(media.file_size / 1024)}KB
                      </div>
                    </div>
                    */}
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
