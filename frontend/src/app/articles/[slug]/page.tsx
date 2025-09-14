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
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = params?.slug

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOne = async () => {
      if (!slug) return
      try {
        setLoading(true)
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
        const res = await fetch(`${apiBase}/api/articles/${encodeURIComponent(slug)}`, { credentials: 'include' })
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
      } catch (e) {
        setError(e instanceof Error ? e.message : '読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchOne()
  }, [slug])

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
          <p className="text-sm text-gray-500 mb-6">
            by {article.author?.name || 'Unknown'} ・ {formatDate(article.pubDate)}
          </p>
          {article.heroImageUrl && (
            <img src={article.heroImageUrl} alt={article.title} className="rounded-lg mb-6" />
          )}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content || ''}
          </ReactMarkdown>
          <div className="mt-8 flex gap-3">
            <Link href={`/articles/${encodeURIComponent(slug as string)}/edit`} className="btn btn-outline">編集する</Link>
            <Link href="/articles" className="btn">一覧へ戻る</Link>
          </div>
        </article>
      ) : null}
    </AuthenticatedLayout>
  )
}
