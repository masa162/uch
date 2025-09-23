import { useState, useEffect } from 'react'
import {
  UnifiedSearchRequest,
  UnifiedSearchResult,
  SearchResponse,
  SearchError,
  ContentType,
  SortOption
} from '@/types/search'

export const useDebouncedSearch = (query: string, delay: number = 300) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), delay)
    return () => clearTimeout(timer)
  }, [query, delay])
  
  return debouncedQuery
}

export const useSearchResults = () => {
  const [results, setResults] = useState<UnifiedSearchResult[]>([])
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<SearchError | null>(null)

  const performSearch = async (
    searchTerm: string,
    options: Partial<UnifiedSearchRequest> = {}
  ) => {
    if (!searchTerm.trim()) {
      setResults([])
      setSearchResponse(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'

      // Build query parameters
      const params = new URLSearchParams({
        q: searchTerm,
        ...(options.type && options.type !== 'all' && { type: options.type }),
        ...(options.dateFrom && { date_from: options.dateFrom }),
        ...(options.dateTo && { date_to: options.dateTo }),
        ...(options.tags && options.tags.length > 0 && { tags: options.tags.join(',') }),
        ...(options.sortBy && options.sortBy !== 'relevance' && { sort_by: options.sortBy }),
        ...(options.page && { page: options.page.toString() }),
        ...(options.limit && { limit: options.limit.toString() })
      })

      // Use new unified search API if available, fallback to articles API
      const endpoint = `/api/search?${params.toString()}`
      const fallbackEndpoint = `/api/articles?q=${encodeURIComponent(searchTerm)}`

      let response = await fetch(`${apiBase}${endpoint}`, {
        credentials: 'include'
      })

      // If unified API returns 404, fallback to articles API
      if (response.status === 404) {
        response = await fetch(`${apiBase}${fallbackEndpoint}`, {
          credentials: 'include'
        })
      }

      if (response.ok) {
        const data = (await response.json()) as unknown
        console.log('Search API response:', data)

        // Handle different response formats
        let searchResponse: SearchResponse

        if (Array.isArray(data)) {
          // Legacy articles API format
          const articles = data as any[]
          searchResponse = {
            results: articles.map(article => ({
              ...article,
              type: 'article' as const,
              url: `/articles/${article.slug}`,
              pubDate: article.pubDate || article.createdAt
            })),
            total: articles.length,
            page: 1,
            limit: articles.length,
            hasMore: false,
            availableTags: [],
            filters: {
              contentTypes: [{ type: 'articles' as ContentType, count: articles.length }],
              dateRange: { earliest: '', latest: '' }
            }
          }
        } else if (data && typeof data === 'object') {
          // New unified API format
          if ('results' in data) {
            searchResponse = data as SearchResponse
          } else if ('articles' in data) {
            // Intermediate format
            const articles = (data as { articles: any[] }).articles
            searchResponse = {
              results: articles.map(article => ({
                ...article,
                type: 'article' as const,
                url: `/articles/${article.slug}`,
                pubDate: article.pubDate || article.createdAt
              })),
              total: articles.length,
              page: 1,
              limit: articles.length,
              hasMore: false,
              availableTags: [],
              filters: {
                contentTypes: [{ type: 'articles' as ContentType, count: articles.length }],
                dateRange: { earliest: '', latest: '' }
              }
            }
          } else {
            throw new Error('Unexpected API response format')
          }
        } else {
          throw new Error('Invalid API response')
        }

        console.log('Processed search results:', searchResponse.results.length, 'items')
        setResults(searchResponse.results)
        setSearchResponse(searchResponse)
      } else {
        console.error('Search API error:', response.status, response.statusText)
        const errorData = await response.json().catch(() => ({})) as any
        setError({
          message: errorData.message || '検索に失敗しました',
          code: errorData.code,
          details: errorData
        })
        setResults([])
        setSearchResponse(null)
      }
    } catch (error) {
      console.error('Search error:', error)
      setError({
        message: error instanceof Error ? error.message : '検索中にエラーが発生しました'
      })
      setResults([])
      setSearchResponse(null)
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
    setSearchResponse(null)
    setError(null)
  }

  return {
    results,
    searchResponse,
    isLoading,
    error,
    performSearch,
    clearResults
  }
}

// Legacy support for existing components
export const useArticleSearch = () => {
  const searchHook = useSearchResults()

  return {
    ...searchHook,
    performSearch: (searchTerm: string) =>
      searchHook.performSearch(searchTerm, { type: 'articles' })
  }
}
