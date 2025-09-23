'use client'

import { useState } from 'react'

export type ContentType = 'all' | 'articles' | 'media' | 'images' | 'videos' | 'documents'
export type SortOption = 'relevance' | 'date' | 'size'

export interface SearchFilters {
  contentType: ContentType
  dateFrom?: string
  dateTo?: string
  tags: string[]
  sortBy: SortOption
}

interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  resultCount?: number
  availableTags?: string[]
  className?: string
}

const SearchFiltersComponent = ({
  filters,
  onFiltersChange,
  resultCount = 0,
  availableTags = [],
  className = ""
}: SearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const contentTypeOptions = [
    { value: 'all', label: 'すべて', icon: '🔍' },
    { value: 'articles', label: '記事', icon: '📄' },
    { value: 'media', label: 'メディア', icon: '🎬' },
    { value: 'images', label: '画像', icon: '🖼️' },
    { value: 'videos', label: '動画', icon: '🎥' },
    { value: 'documents', label: '文書', icon: '📋' }
  ] as const

  const sortOptions = [
    { value: 'relevance', label: '関連度順' },
    { value: 'date', label: '日付順' },
    { value: 'size', label: 'サイズ順' }
  ] as const

  const handleContentTypeChange = (contentType: ContentType) => {
    onFiltersChange({ ...filters, contentType })
  }

  const handleSortChange = (sortBy: SortOption) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const handleDateFromChange = (dateFrom: string) => {
    onFiltersChange({ ...filters, dateFrom: dateFrom || undefined })
  }

  const handleDateToChange = (dateTo: string) => {
    onFiltersChange({ ...filters, dateTo: dateTo || undefined })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    onFiltersChange({ ...filters, tags: newTags })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      contentType: 'all',
      sortBy: 'relevance',
      tags: []
    })
  }

  const hasActiveFilters = filters.contentType !== 'all' ||
                          filters.dateFrom ||
                          filters.dateTo ||
                          filters.tags.length > 0 ||
                          filters.sortBy !== 'relevance'

  return (
    <div className={`bg-base-100 border border-base-300 rounded-lg ${className}`}>
      {/* フィルタヘッダー */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-base-content">検索フィルタ</h3>
            {resultCount > 0 && (
              <span className="badge badge-primary badge-sm">{resultCount}件</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn btn-ghost btn-xs"
              >
                クリア
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-ghost btn-sm"
            >
              {isExpanded ? '折りたたむ' : '詳細'}
              <svg
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツタイプフィルタ（常に表示） */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {contentTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleContentTypeChange(option.value)}
              className={`btn btn-sm ${
                filters.contentType === option.value
                  ? 'btn-primary'
                  : 'btn-outline btn-ghost'
              }`}
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 詳細フィルタ（展開時のみ表示） */}
      {isExpanded && (
        <div className="border-t border-base-300">
          {/* ソート順 */}
          <div className="p-4 border-b border-base-300">
            <h4 className="font-medium text-sm mb-3">並び順</h4>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`btn btn-sm ${
                    filters.sortBy === option.value
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 日付範囲 */}
          <div className="p-4 border-b border-base-300">
            <h4 className="font-medium text-sm mb-3">日付範囲</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label className="label label-text text-xs">開始日</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="input input-bordered input-sm w-full"
                />
              </div>
              <div className="flex-1">
                <label className="label label-text text-xs">終了日</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="input input-bordered input-sm w-full"
                />
              </div>
            </div>
          </div>

          {/* タグフィルタ */}
          {availableTags.length > 0 && (
            <div className="p-4">
              <h4 className="font-medium text-sm mb-3">タグ</h4>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`badge cursor-pointer ${
                      filters.tags.includes(tag)
                        ? 'badge-primary'
                        : 'badge-outline hover:badge-primary'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {availableTags.length > 10 && (
                  <span className="text-xs text-base-content/50 self-center">
                    +{availableTags.length - 10}個のタグ
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchFiltersComponent