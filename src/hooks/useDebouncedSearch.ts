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
      const response = await fetch(`/api/articles/search?q=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.articles || [])
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