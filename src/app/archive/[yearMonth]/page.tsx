'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface Article {
  id: string
  title: string
  slug: string
  pubDate: string
  author: {
    name: string | null
    displayName: string | null
  }
}

export default function ArchivePage() {
  const { yearMonth } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [year, setYear] = useState<number | null>(null)
  const [month, setMonth] = useState<number | null>(null)

  useEffect(() => {
    const fetchArchiveArticles = async () => {
      if (!session || !yearMonth) return

      // yearMonth の形式チェック (YYYYMM)
      const yearMonthStr = yearMonth as string
      if (!/^\d{6}$/.test(yearMonthStr)) {
        router.push('/archive')
        return
      }

      const yearNum = parseInt(yearMonthStr.substring(0, 4))
      const monthNum = parseInt(yearMonthStr.substring(4, 6))
      
      if (monthNum < 1 || monthNum > 12) {
        router.push('/archive')
        return
      }

      setYear(yearNum)
      setMonth(monthNum)

      setLoading(true)
      try {
        const response = await fetch(`/api/articles/archive/${yearMonthStr}`)
        if (response.ok) {
          const data = await response.json()
          setArticles(data.articles || [])
          setTotalCount(data.count || 0)
        } else if (response.status === 404) {
          setArticles([])
          setTotalCount(0)
        } else {
          throw new Error('Failed to fetch archive')
        }
      } catch (error) {
        console.error('Failed to fetch archive articles:', error)
        setArticles([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchArchiveArticles()
  }, [session, yearMonth, router])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>ログインが必要です</p>
      </div>
    )
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  const monthName = year && month ? new Date(year, month - 1).toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long' 
  }) : ''

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/articles')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            ← 記事一覧に戻る
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">📂</span>
            <h1 className="text-3xl font-bold text-gray-900">
              月別アーカイブ: <span className="text-blue-600">{monthName}</span>
            </h1>
          </div>
          
          <p className="text-gray-600">
            {monthName}の記事: {totalCount}件
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📂</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {monthName}の記事が見つかりませんでした
            </h2>
            <p className="text-gray-600 mb-6">この月にはまだ記事が投稿されていません</p>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/articles/new')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                新しい記事を書く
              </button>
              <button
                onClick={() => router.push('/archive')}
                className="text-blue-600 hover:text-blue-800"
              >
                他の月を見る
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200"
                onClick={() => router.push(`/articles/${article.slug}`)}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-3 hover:text-blue-600">
                  {article.title}
                </h2>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">👤</span>
                    <span>{article.author.displayName || article.author.name || '匿名'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">📅</span>
                    <span>{new Date(article.pubDate).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ナビゲーション */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">月別ナビゲーション</h3>
              <div className="flex space-x-4">
                {year && month && (
                  <>
                    {/* 前の月 */}
                    <button
                      onClick={() => {
                        const prevMonth = month === 1 ? 12 : month - 1
                        const prevYear = month === 1 ? year - 1 : year
                        const prevYearMonth = `${prevYear}${String(prevMonth).padStart(2, '0')}`
                        router.push(`/archive/${prevYearMonth}`)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ← 前の月
                    </button>
                    
                    {/* 次の月 */}
                    <button
                      onClick={() => {
                        const nextMonth = month === 12 ? 1 : month + 1
                        const nextYear = month === 12 ? year + 1 : year
                        const nextYearMonth = `${nextYear}${String(nextMonth).padStart(2, '0')}`
                        router.push(`/archive/${nextYearMonth}`)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      次の月 →
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => router.push('/archive')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  アーカイブ一覧
                </button>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/articles/new')}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              新しい記事を書く
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}