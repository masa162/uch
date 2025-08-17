'use client'

import { useState, useEffect } from 'react'
import PasswordGate from '@/components/PasswordGate'
import AuthForm from '@/components/AuthForm'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { useSession, signOut } from 'next-auth/react'

interface Article {
  id: string
  title: string
  slug: string
  pubDate: string
  author: {
    name: string | null
  }
}

export default function Home() { console.log('Home component rendered'); console.log('Home component rendered');
  const [hasPassword, setHasPassword] = useState(process.env.NODE_ENV === 'development' ? true : false)
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchRecentArticles = async () => {
      if (session) {
        setLoading(true)
        try {
          const response = await fetch('/api/articles?limit=3')
          if (response.ok) {
            const data = await response.json()
            setRecentArticles(data.articles || [])
          }
        } catch (error) {
          console.error('Failed to fetch recent articles:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchRecentArticles()
  }, [session])

  console.log('Home: !mounted'); if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

    console.log('Home: !hasPassword'); if (!hasPassword && process.env.NODE_ENV !== 'development') {
    return <PasswordGate onSuccess={() => setHasPassword(true)} />
  }

  console.log('Home: status loading'); if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  console.log('Home: !session'); if (!session && process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <AuthForm />
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <nav className="bg-white shadow mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">うちのきろく</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                こんにちは、{session?.user?.email}さん
              </span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            おかえりなさい 🏠
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            今日も家族の大切な思い出を、やさしく残していきましょう 💝
          </p>
          
          {/* 最近の記事セクション */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-left">最近の記事</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p>読み込み中...</p>
              </div>
            ) : recentArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-gray-200"
                    onClick={() => window.location.href = `/articles/${article.slug}`}
                  >
                    <h4 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">👤</span>
                      <span className="mr-4">{article.author.name || '匿名'}</span>
                      <span className="mr-2">📅</span>
                      <span>{new Date(article.pubDate).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">まだ記事がありません</p>
                <button
                  onClick={() => window.location.href = '/articles/new'}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
                >
                  最初の記事を書く
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => window.location.href = '/articles'}
                className="bg-base-100 p-6 rounded-lg shadow hover:shadow-xl transition ease-in-out hover:scale-[102%] text-left border-2 border-transparent hover:border-primary-light"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">📚</span>
                  <h3 className="text-xl font-semibold text-gray-800">記事一覧</h3>
                </div>
                <p className="text-gray-600">みんなの思い出を見る</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/articles/new'}
                className="bg-gradient-to-br from-primary-light to-accent-yellow p-6 rounded-lg shadow hover:shadow-xl transition ease-in-out hover:scale-[102%] text-left border-2 border-primary hover:border-primary-dark"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">✍️</span>
                  <h3 className="text-xl font-semibold text-primary-dark">新しい記事</h3>
                </div>
                <p className="text-primary">新しい思い出を書く</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/profile'}
                className="bg-base-100 p-6 rounded-lg shadow hover:shadow-xl transition ease-in-out hover:scale-[102%] text-left border-2 border-transparent hover:border-accent-brown"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">👤</span>
                  <h3 className="text-xl font-semibold text-gray-800">プロフィール</h3>
                </div>
                <p className="text-gray-600">あなたについて教えてください</p>
              </button>
            </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}