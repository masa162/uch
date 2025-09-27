'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import ArticleCard from '@/components/ArticleCard'
import Pagination from '@/components/Pagination'

interface ArticlesByTagResponse {
  articles: any[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  tag: {
    name: string
    count: number
  }
}

export default function TagPageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tagName = decodeURIComponent(params.tagname as string)
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [articles, setArticles] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [tagInfo, setTagInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticlesByTag = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
        const response = await fetch(
          `${apiBase}/api/articles?tag=${encodeURIComponent(tagName)}&page=${page}&limit=20`,
          {
            credentials: 'include'
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data: ArticlesByTagResponse = await response.json()
        console.log('Tag page data:', data)

        setArticles(data.articles || [])
        setPagination(data.pagination)
        setTagInfo(data.tag)

      } catch (error) {
        console.error('タグ記事取得エラー:', error)
        setError(error instanceof Error ? error.message : 'タグ記事の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (tagName) {
      fetchArticlesByTag()
    }
  }, [tagName, page])

  let content

  if (isLoading) {
    content = (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  } else if (error) {
    content = (
      <div className="alert alert-error">
        <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>エラー: {error}</span>
      </div>
    )
  } else {
    content = (
      <>
        {/* パンくずナビゲーション */}
        <div className="breadcrumbs text-sm mb-6">
          <ul>
            <li><Link href="/" className="text-primary hover:text-primary-focus">ホーム</Link></li>
            <li><Link href="/tag" className="text-primary hover:text-primary-focus">タグ一覧</Link></li>
            <li className="text-base-content opacity-70">タグ: {tagName}</li>
          </ul>
        </div>

        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="badge badge-primary badge-lg px-4 py-3">
              🏷️ {tagName}
            </div>
            {tagInfo && (
              <span className="text-base-content/70">
                {tagInfo.count}件の記事
              </span>
            )}
          </div>

          <div className="divider"></div>
        </div>

        {/* 記事一覧 */}
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium mb-2">タグ「{tagName}」の記事が見つかりません</h3>
            <p className="text-base-content/70 mb-6">
              このタグに関連する記事はまだ投稿されていません。
            </p>
            <div className="space-x-4">
              <Link href="/" className="btn btn-primary">
                ホームに戻る
              </Link>
              <Link href="/tag" className="btn btn-outline">
                他のタグを探す
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:gap-8">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  className="border border-base-300 rounded-lg p-6 hover:shadow-lg transition-shadow"
                />
              ))}
            </div>

            {/* ページネーション */}
            {pagination && pagination.total > pagination.limit && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={Math.ceil(pagination.total / pagination.limit)}
                  onPageChange={(newPage) => {
                    const currentParams = new URLSearchParams(searchParams.toString())
                    currentParams.set('page', newPage.toString())
                    router.push(`/tag/${encodeURIComponent(tagName)}?${currentParams.toString()}`)
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* 関連タグ提案 (将来の機能として準備) */}
        <div className="mt-16 p-6 bg-base-200 rounded-lg">
          <h3 className="text-lg font-medium mb-4">💡 関連するタグを探す</h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/tag"
              className="btn btn-sm btn-outline"
            >
              すべてのタグを見る
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(tagName)}`}
              className="btn btn-sm btn-ghost"
            >
              「{tagName}」で詳細検索
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {content}
      </div>
    </AuthenticatedLayout>
  )
}