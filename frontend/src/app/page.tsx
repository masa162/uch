'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import NameSetupModal from '@/components/NameSetupModal';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Article {
  id: string
  title: string
  slug: string
  description: string | null
  content: string
  pubDate: string
  heroImageUrl: string | null
  tags: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
  author: {
    name: string | null
    email: string | null
    displayName: string | null
  }
}

export default function HomePage() {
  const { user, checkNameSetup, authLoading } = useAuth();
  const router = useRouter();
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNameSetup, setShowNameSetup] = useState(false)
  const [allowRedirect, setAllowRedirect] = useState(false)

  // 初回ロード後に少し待ってからリダイレクトを許可（認証状態の安定化を待つ）
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Allowing redirect after auth state stabilization')
      setAllowRedirect(true)
    }, 2000) // 2秒待機

    return () => clearTimeout(timer)
  }, [])

  // 未認証ユーザーをランディングページにリダイレクト（allowRedirect後のみ）
  useEffect(() => {
    if (!authLoading && !user && allowRedirect) {
      console.log('Redirecting to landing page: user not authenticated')
      router.push('/landing')
      return
    }
  }, [authLoading, user, allowRedirect, router])

  useEffect(() => {
    const fetchRecentArticles = async () => {
      try {
        setLoading(true)
        // Prefer explicit API base to avoid 404 when edge functions are disabled
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
        const response = await fetch(`${apiBase}/api/articles`, { credentials: 'include' })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = (await response.json()) as unknown
        // 型安全のため最低限のバリデーションを行う
        if (Array.isArray(data)) {
          setRecentArticles(data as Article[])
        } else {
          setRecentArticles([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentArticles()
  }, [])

  // 名前設定チェック
  useEffect(() => {
    const checkName = async () => {
      if (user && checkNameSetup) {
        const needsNameSetup = await checkNameSetup();
        if (needsNameSetup) {
          setShowNameSetup(true);
        }
      }
    };

    checkName();
  }, [user, checkNameSetup])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }


  // 認証状態確定まではローディング表示
  if (authLoading || (!user && !allowRedirect)) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-base-content/70">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <NameSetupModal 
        isOpen={showNameSetup} 
        onClose={() => setShowNameSetup(false)} 
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">おかえりなさい 🏠</h1>
          <p className="text-gray-600">今日も家族の大切な思い出を、やさしく残していきましょう 💝</p>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 記事一覧カード */}
          <Link href="/articles" className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer">
            <div className="card-body">
              <h2 className="card-title">📚 記事一覧</h2>
              <p>みんなの思い出を見る</p>
            </div>
          </Link>
          
          {/* 検索カード */}
          <Link href="/search" className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer">
            <div className="card-body">
              <h2 className="card-title">🔍 検索</h2>
              <p>記事を検索する</p>
            </div>
          </Link>
          
          {/* 新しい記事カード */}
          <Link href="/articles/new" className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer border-2 border-primary">
            <div className="card-body">
              <h2 className="card-title">✍️ 新しい記事</h2>
              <p>新しい思い出を書く</p>
            </div>
          </Link>
          
          {/* プロフィールカード */}
          <Link href="/profile" className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer">
            <div className="card-body">
              <h2 className="card-title">👤 プロフィール</h2>
              <p>あなたについて教えてください</p>
            </div>
          </Link>
        </div>
        
        {/* 最近の記事セクション */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">最近の記事</h2>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">記事を読み込み中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="alert alert-error max-w-md mx-auto">
                <span>⚠️ {error}</span>
              </div>
            </div>
          ) : recentArticles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">まだ記事がありません</p>
              <Link href="/articles/new" className="btn btn-primary">
                最初の記事を書く
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <Link 
                  key={article.id} 
                  href={`/articles/${article.slug}`}
                  className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer"
                >
                  <div className="card-body">
                    <h3 className="card-title text-lg line-clamp-2">{article.title}</h3>
                    {article.description && (
                      <p className="text-gray-600 text-sm line-clamp-3">{article.description}</p>
                    )}
                    <div className="card-actions justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        <p>by {article.author?.displayName || article.author?.name || 'Unknown'}</p>
                        <p>{formatDate(article.pubDate)}</p>
                      </div>
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 2).map((tag, index) => (
                            <Link 
                              key={index} 
                              href={`/tags/${encodeURIComponent(tag)}`}
                              className="badge badge-outline badge-sm hover:badge-primary transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {tag}
                            </Link>
                          ))}
                          {article.tags.length > 2 && (
                            <span className="badge badge-outline badge-sm">+{article.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
