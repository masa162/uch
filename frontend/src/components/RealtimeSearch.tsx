'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDebouncedSearch, useSearchResults } from '@/hooks/useDebouncedSearch'

interface SearchResult {
  id: string
  title: string
  slug: string
  content: string
  tags: string[]
  createdAt: string
  author: {
    name: string | null
    email: string
  }
}

interface RealtimeSearchProps {
  placeholder?: string
  className?: string
  onNavigate?: () => void
}

const RealtimeSearch = ({ placeholder = "記事を検索...", className = "", onNavigate }: RealtimeSearchProps) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debouncedQuery = useDebouncedSearch(query, 300)
  const { results, isLoading, error, performSearch, clearResults } = useSearchResults()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery)
      setIsOpen(true)
    } else {
      clearResults()
      setIsOpen(false)
    }
    setSelectedIndex(-1)
  }, [debouncedQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev <= 0 ? results.length - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultSelect(results[selectedIndex])
        } else if (query.trim()) {
          handleSearchSubmit()
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleResultSelect = (result: SearchResult) => {
    router.push(`/articles/${result.slug}`)
    setQuery('')
    setIsOpen(false)
    clearResults()
    onNavigate?.()
  }

  const handleSearchSubmit = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      setIsOpen(false)
      clearResults()
      onNavigate?.()
    }
  }

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit() }}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="input input-bordered w-full pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="loading loading-spinner loading-sm"></div>
            </div>
          )}
        </div>
      </form>

      {isOpen && (query.length >= 2) && (
        <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-base-content/70">
              <div className="loading loading-spinner loading-sm mx-auto mb-2"></div>
              検索中...
            </div>
          ) : error ? (
            <div className="p-3 text-center text-error">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="p-3 text-center text-base-content/70">
              「{query}」の検索結果が見つかりませんでした
            </div>
          ) : (
            <>
              <div className="p-2 border-b border-base-300">
                <p className="text-xs text-base-content/70">
                  {results.length}件の検索結果
                </p>
              </div>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`p-3 cursor-pointer border-b border-base-300 last:border-b-0 hover:bg-base-200 ${
                    index === selectedIndex ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => handleResultSelect(result)}
                >
                  <h4 
                    className="font-medium text-base-content text-sm mb-1"
                    dangerouslySetInnerHTML={{ __html: highlightText(result.title, query) }}
                  />
                  <p 
                    className="text-xs text-base-content/70 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: highlightText(result.content, query) }}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-base-content/50">
                      {new Date(result.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                    {result.tags.length > 0 && (
                      <div className="flex space-x-1">
                        {result.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="badge badge-outline badge-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {result.tags.length > 2 && (
                          <span className="text-xs text-base-content/50">+{result.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="p-2 border-t border-base-300">
                <button
                  onClick={handleSearchSubmit}
                  className="w-full text-center text-xs text-primary hover:text-primary-focus"
                >
                  すべての検索結果を見る →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default RealtimeSearch