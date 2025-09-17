'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Article = {
  id: string
  title: string
  slug: string
  description: string | null
  content: string
  pubDate: string
  heroImageUrl: string | null
  tags: string[]
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
