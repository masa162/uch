'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthAction } from '@/hooks/useAuthAction'
import RealtimeSearch from '@/components/RealtimeSearch'

interface Tag {
  name: string
  count: number
}

interface Article {
  id: string
  title: string
  slug: string
  pubDate: Date
}

interface ArchiveHierarchy {
  [year: string]: {
    [month: string]: Article[]
  }
}

export default function Sidebar() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { runAuthAction } = useAuthAction()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [archiveHierarchy, setArchiveHierarchy] = useState<ArchiveHierarchy>({})
  const [loadingArchive, setLoadingArchive] = useState(false)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  // タグ一覧を取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true)
        const response = await fetch('/api/articles/tags')
        if (response.ok) {
          const data = await response.json()
          // タグデータを整形
          const formattedTags = data.tags.map((tag: string) => ({
            name: tag,
            count: 1 // APIからは個別のカウントが取得できないため、1として表示
          }))
          setTags(formattedTags)
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      } finally {
        setLoadingTags(false)
      }
    }

    fetchTags()
  }, [])

  // 月別アーカイブの階層データを取得
  useEffect(() => {
    const fetchArchiveHierarchy = async () => {
      try {
        setLoadingArchive(true)
        const response = await fetch('/api/articles/archive/hierarchy')
        if (response.ok) {
          const data = await response.json()
          setArchiveHierarchy(data.hierarchy)
          
          // 最新の年と月をデフォルトで展開
          const years = Object.keys(data.hierarchy)
          if (years.length > 0) {
            const latestYear = years[0]
            setExpandedYears(new Set([latestYear]))
            
            const months = Object.keys(data.hierarchy[latestYear])
            if (months.length > 0) {
              const latestMonth = months[0]
              setExpandedMonths(new Set([`${latestYear}-${latestMonth}`]))
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch archive hierarchy:', error)
      } finally {
        setLoadingArchive(false)
      }
    }

    fetchArchiveHierarchy()
  }, [])

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleSignOut = () => {
    if (confirm('ログアウトしますか？')) {
      signOut()
      setShowUserMenu(false)
    }
  }

  const handleTagClick = (tagName: string) => {
    router.push(`/tags/${encodeURIComponent(tagName)}`)
  }


  const toggleYear = (year: string) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev)
      if (newSet.has(year)) {
        newSet.delete(year)
        // 年を閉じる時は、その年の月も全て閉じる
        setExpandedMonths(prevMonths => {
          const newMonthSet = new Set(prevMonths)
          Object.keys(archiveHierarchy[year]).forEach(month => {
            newMonthSet.delete(`${year}-${month}`)
          })
          return newMonthSet
        })
      } else {
        newSet.add(year)
      }
      return newSet
    })
  }

  const toggleMonth = (year: string, month: string) => {
    const key = `${year}-${month}`
    setExpandedMonths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const handleArticleClick = (slug: string) => {
    router.push(`/articles/${slug}`)
  }

  const formatMonth = (month: string) => {
    const monthNum = parseInt(month)
    const monthNames = [
      '1月', '2月', '3月', '4月', '5月', '6月',
      '7月', '8月', '9月', '10月', '11月', '12月'
    ]
    return monthNames[monthNum - 1] || month
  }

  return (
    <div className="card bg-base-100 shadow-xl p-6 space-y-4">
      {/* Logo */}
      <div className="w-fit mx-auto mb-6">
        <button
          onClick={() => handleNavigation('/')}
          className="block"
          aria-label="トップページへ"
        >
          <img
            src="/images/ogp/ogp.png"
            alt="うちのきろく ロゴ画像"
            className="rounded-lg shadow hover:shadow-xl transition ease-in-out hover:scale-[102%] max-w-32 w-auto h-auto"
            width="200"
            height="200"
          />
        </button>
      </div>
      {/* リアルタイム検索ボックス */}
      <RealtimeSearch 
        placeholder="記事を検索..." 
        className="form-control"
      />
      
      {/* ユーザーメニュー */}
      {user && (
        <div className="space-y-2">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-primary-light transition-colors"
            >
              <div className="avatar">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </div>
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-semibold flex items-center gap-2">
                  {user.name || 'ユーザー'}
                  {user.role === 'GUEST' && (
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                      ゲスト
                    </span>
                  )}
                </div>
                {user.username && (
                  <div className="text-xs text-base-content/70">
                    @{user.username}
                  </div>
                )}
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showUserMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10">
                {user.role !== 'GUEST' && (
                  <>
                    <button
                      onClick={() => {
                        handleNavigation('/profile')
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-base-200 transition-colors"
                    >
                      📱 プロフィール
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        runAuthAction(() => handleNavigation('/articles/new'))
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-base-200 transition-colors"
                    >
                      ✏️ 記事を書く
                    </button>
                    <hr className="border-base-300" />
                  </>
                )}
                
                {user.role === 'GUEST' ? (
                  <button
                    onClick={() => {
                      handleNavigation('/auth/signin')
                      setShowUserMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-base-200 transition-colors text-primary"
                  >
                    🔑 ログイン/新規登録
                  </button>
                ) : (
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 hover:bg-base-200 transition-colors text-error"
                  >
                    🚪 ログアウト
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 発見とメモ */}
      <div className="space-y-2">
        <h3 className="font-bold text-primary-dark">🔍 発見とメモ</h3>
        <ul className="menu">
          <li>
            <button
              onClick={() => setShowTags(!showTags)}
              className="flex items-center justify-between w-full hover:bg-primary-light hover:text-primary-dark transition-colors"
            >
              <span>🏷️ タグ一覧</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showTags ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTags && (
              <div className="ml-4 mt-2 space-y-2">
                {loadingTags ? (
                  <div className="flex justify-center py-2">
                    <span className="loading loading-spinner loading-sm"></span>
                  </div>
                ) : tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => handleTagClick(tag.name)}
                        className="badge badge-primary badge-outline hover:badge-primary text-xs cursor-pointer transition-colors"
                        title={tag.name}
                      >
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-base-content/70 px-2 py-1">
                    タグがありません
                  </div>
                )}
              </div>
            )}
          </li>
          <li>
            <button
              onClick={() => setShowArchive(!showArchive)}
              className="flex items-center justify-between w-full hover:bg-primary-light hover:text-primary-dark transition-colors"
            >
              <span>📂 月別アーカイブ</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showArchive ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showArchive && (
              <div className="ml-4 mt-2 space-y-2">
                {loadingArchive ? (
                  <div className="flex justify-center py-2">
                    <span className="loading loading-spinner loading-sm"></span>
                  </div>
                ) : Object.keys(archiveHierarchy).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(archiveHierarchy).map(([year, months]) => (
                      <div key={year} className="space-y-1">
                        {/* 年のヘッダー */}
                        <button
                          onClick={() => toggleYear(year)}
                          className="flex items-center gap-2 w-full text-sm font-medium hover:text-primary-dark transition-colors"
                        >
                          <svg 
                            className={`w-3 h-3 transition-transform ${expandedYears.has(year) ? 'rotate-90' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <span>{year}年</span>
                        </button>
                        
                        {/* 月のリスト */}
                        {expandedYears.has(year) && (
                          <div className="ml-4 space-y-1">
                            {Object.entries(months).map(([month, articles]) => (
                              <div key={`${year}-${month}`} className="space-y-1">
                                {/* 月のヘッダー */}
                                <button
                                  onClick={() => toggleMonth(year, month)}
                                  className="flex items-center gap-2 w-full text-xs hover:text-primary-dark transition-colors"
                                >
                                  <svg 
                                    className={`w-2 h-2 transition-transform ${expandedMonths.has(`${year}-${month}`) ? 'rotate-90' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <span>{formatMonth(month)} ({articles.length}件)</span>
                                </button>
                                
                                {/* 記事のリスト */}
                                {expandedMonths.has(`${year}-${month}`) && (
                                  <div className="ml-4 space-y-1">
                                    {articles.map((article) => (
                                      <button
                                        key={article.id}
                                        onClick={() => handleArticleClick(article.slug)}
                                        className="block w-full text-left text-xs text-base-content/70 hover:text-primary-dark transition-colors truncate"
                                        title={article.title}
                                      >
                                        {article.title}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-base-content/70 px-2 py-1">
                    記事がありません
                  </div>
                )}
              </div>
            )}
          </li>
          <li>
            <a className="hover:bg-primary-light hover:text-primary-dark transition-colors">
              📝 エッセイ
            </a>
          </li>
        </ul>
      </div>
      
      {/* よく使われるタグ */}
      <div className="space-y-2">
        <h3 className="font-bold text-primary-dark">🏷️ 人気のタグ</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleTagClick('家族')}
            className="badge badge-primary badge-outline hover:badge-primary cursor-pointer transition-colors"
          >
            家族
          </button>
          <button 
            onClick={() => handleTagClick('思い出')}
            className="badge badge-primary badge-outline hover:badge-primary cursor-pointer transition-colors"
          >
            思い出
          </button>
          <button 
            onClick={() => handleTagClick('旅行')}
            className="badge badge-primary badge-outline hover:badge-primary cursor-pointer transition-colors"
          >
            旅行
          </button>
          <button 
            onClick={() => handleTagClick('料理')}
            className="badge badge-primary badge-outline hover:badge-primary cursor-pointer transition-colors"
          >
            料理
          </button>
          <button 
            onClick={() => handleTagClick('季節')}
            className="badge badge-primary badge-outline hover:badge-primary cursor-pointer transition-colors"
          >
            季節
          </button>
        </div>
      </div>
    </div>
  );
}