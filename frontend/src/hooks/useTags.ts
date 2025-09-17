import { useState, useEffect } from 'react'

interface Tag {
  name: string
  count: number
}

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const response = await fetch(`${apiBase}/api/articles`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const articles = await response.json() as any[]
        
        // 全記事からタグを抽出してカウント
        const tagCounts: Record<string, number> = {}
        
        articles.forEach((article: any) => {
          if (article.tags && Array.isArray(article.tags)) {
            article.tags.forEach((tag: string) => {
              if (tag && tag.trim()) {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1
              }
            })
          }
        })
        
        // カウント順でソートして上位10件を取得
        const sortedTags = Object.entries(tagCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
        
        setTags(sortedTags)
      } else {
        setError('タグの取得に失敗しました')
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
