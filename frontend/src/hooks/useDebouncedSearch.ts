import { useState, useEffect } from 'react'

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

export const useDebouncedSearch = (query: string, delay: number = 300) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), delay)
    return () => clearTimeout(timer)
  }, [query, delay])
  
  return debouncedQuery
}

export const useSearchResults = () => {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const response = await fetch(`${apiBase}/api/articles/search?q=${encodeURIComponent(searchTerm)}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = (await response.json()) as unknown
        const items = (data && typeof data === 'object' && 'articles' in data)
          ? (data as { articles?: SearchResult[] }).articles ?? []
          : []
        setResults(items)
      } else {
        setError('検索に失敗しました')
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('検索中にエラーが発生しました')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    results,
    isLoading,
    error,
    performSearch,
    clearResults: () => setResults([])
  }
}
