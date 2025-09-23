'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import SearchFiltersComponent from '@/components/SearchFilters'
import RealtimeSearch from '@/components/RealtimeSearch'
import Link from 'next/link'
import { useSearchResults } from '@/hooks/useDebouncedSearch'
import { UnifiedSearchResult, SearchFilters } from '@/types/search'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams?.get('q') || ''

  const { results, searchResponse, isLoading, error, performSearch } = useSearchResults()
  const [searchQuery, setSearchQuery] = useState(query)
  const [filters, setFilters] = useState<SearchFilters>({
    contentType: 'all',
    tags: [],
    sortBy: 'relevance'
  })

  useEffect(() => {
    if (query) {
      setSearchQuery(query)
      performSearchWithFilters(query, filters)
    }
  }, [query])

  useEffect(() => {
    if (searchQuery) {
      performSearchWithFilters(searchQuery, filters)
    }
  }, [filters])

  const performSearchWithFilters = (searchQuery: string, currentFilters: SearchFilters) => {
    performSearch(searchQuery, {
      type: currentFilters.contentType,
      dateFrom: currentFilters.dateFrom,
      dateTo: currentFilters.dateTo,
      tags: currentFilters.tags,
      sortBy: currentFilters.sortBy
    })
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const handleNewSearch = (newQuery: string) => {
    setSearchQuery(newQuery)
    router.push(`/search?q=${encodeURIComponent(newQuery)}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderResultCard = (result: UnifiedSearchResult) => {
    const isArticle = result.type === 'article'
    const article = result as any // Legacy compatibility

    return (
      <Link
        key={result.id}
        href={result.url}
        className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer"
      >
        <div className="card-body">
          <div className="flex items-start gap-3">
            {result.thumbnailUrl && (
              <div className="avatar">
                <div className="w-16 h-16 rounded">
                  <img src={result.thumbnailUrl} alt={result.title} />
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {isArticle ? '📄' : result.type === 'image' ? '🖼️' : result.type === 'video' ? '🎥' : '📋'}
                </span>
                <h3 className="card-title text-lg line-clamp-2">{result.title}</h3>
              </div>
              {(article.description || article.content) && (
                <p className="text-gray-600 text-sm line-clamp-3 mb-2">
                  {article.description || article.content?.substring(0, 150) + '...'}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <p>by {result.author?.displayName || result.author?.name || 'Unknown'}</p>
                  <p>{formatDate(result.createdAt)}</p>
                </div>
                {result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="badge badge-outline badge-sm">
                        {tag}
                      </span>
                    ))}
                    {result.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{result.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">サイト内検索</h1>
          <p className="text-gray-600">記事、画像、動画など、あらゆるコンテンツを検索できます</p>
        </div>

        {/* 検索ボックス */}
        <div className="max-w-2xl">
          <RealtimeSearch
            placeholder="記事、メディアファイルなどを検索..."
            className="w-full"
          />
        </div>

        {/* 検索結果とフィルタ */}
        {searchQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* フィルタパネル */}
            <div className="lg:col-span-1">
              <SearchFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                resultCount={searchResponse?.total || results.length}
                availableTags={searchResponse?.availableTags || []}
              />
            </div>

            {/* 検索結果 */}
            <div className="lg:col-span-3">
              {searchQuery && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800">
                    「{searchQuery}」の検索結果: {searchResponse?.total || results.length}件
                    {filters.contentType !== 'all' && (
                      <span className="ml-2 badge badge-primary badge-sm">
                        {filters.contentType === 'articles' ? '記事' :
                         filters.contentType === 'media' ? 'メディア' :
                         filters.contentType === 'images' ? '画像' :
                         filters.contentType === 'videos' ? '動画' : '文書'}のみ
                      </span>
                    )}
                  </p>
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">検索中...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="alert alert-error max-w-md mx-auto">
                    <span>⚠️ {error.message}</span>
                  </div>
                </div>
              ) : results.length === 0 && searchQuery ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">該当するコンテンツが見つかりませんでした</p>
                  <div className="space-x-2">
                    <Link href="/articles" className="btn btn-primary">
                      記事一覧を見る
                    </Link>
                    <Link href="/gallery" className="btn btn-outline">
                      ギャラリーを見る
                    </Link>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => renderResultCard(result))}

                  {searchResponse?.hasMore && (
                    <div className="text-center py-4">
                      <button className="btn btn-outline">
                        さらに読み込む
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <svg className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-lg font-medium mb-2">検索を開始しましょう</p>
                    <p>上の検索ボックスにキーワードを入力してください</p>
                  </div>
                  <div className="space-x-2">
                    <Link href="/articles" className="btn btn-primary">
                      記事一覧を見る
                    </Link>
                    <Link href="/gallery" className="btn btn-outline">
                      ギャラリーを見る
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 初期状態（検索クエリがない場合） */}
        {!searchQuery && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <svg className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium mb-2">検索を開始しましょう</p>
              <p>上の検索ボックスにキーワードを入力してください</p>
            </div>
            <div className="space-x-2">
              <Link href="/articles" className="btn btn-primary">
                記事一覧を見る
              </Link>
              <Link href="/gallery" className="btn btn-outline">
                ギャラリーを見る
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    }>
      <SearchContent />
    </Suspense>
  )
}
