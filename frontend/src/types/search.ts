export type ContentType = 'all' | 'articles' | 'media' | 'images' | 'videos' | 'documents'
export type SortOption = 'relevance' | 'date' | 'size'

export interface SearchFilters {
  contentType: ContentType
  dateFrom?: string
  dateTo?: string
  tags: string[]
  sortBy: SortOption
}

export interface UnifiedSearchRequest {
  query: string
  type?: ContentType
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  sortBy?: SortOption
  page?: number
  limit?: number
}

export interface BaseSearchResult {
  id: string
  title: string
  type: 'article' | 'image' | 'video' | 'document'
  url: string
  thumbnailUrl?: string
  createdAt: string
  tags: string[]
  author: {
    name: string | null
    displayName?: string | null
    email?: string
  }
  metadata?: Record<string, any>
}

export interface ArticleSearchResult extends BaseSearchResult {
  type: 'article'
  slug: string
  description?: string | null
  content: string
  pubDate: string
}

export interface MediaSearchResult extends BaseSearchResult {
  type: 'image' | 'video' | 'document'
  fileName: string
  fileSize: number
  mimeType: string
  width?: number
  height?: number
  duration?: number // for videos
}

export type UnifiedSearchResult = ArticleSearchResult | MediaSearchResult

export interface SearchResponse {
  results: UnifiedSearchResult[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  availableTags: string[]
  filters: {
    contentTypes: { type: ContentType; count: number }[]
    dateRange: {
      earliest: string
      latest: string
    }
  }
}

export interface SearchError {
  message: string
  code?: string
  details?: any
}