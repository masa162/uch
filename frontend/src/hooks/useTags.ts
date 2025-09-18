import { useState, useEffect } from 'react'

interface Tag {
  id: number;
  name: string
  count: number
}

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const response = await fetch(`${apiBase}/api/tags`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json() as Tag[]
        setTags(data)
      } else {
        const errData = await response.json()
        setError(errData.error || 'タグの取得に失敗しました')
      }
    } catch (error) {
      console.error('Tags fetch error:', error)
      setError('タグの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  return {
    tags,
    loading,
    error,
    refetch: fetchTags
  }
}
