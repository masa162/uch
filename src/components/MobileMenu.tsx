'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      onClose()
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-80 bg-base-100 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        <div className="p-4">
          {/* Close button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="メニューを閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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

          {/* Search */}
          <div className="mb-6">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="記事を検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>
          </div>

          {/* Navigation */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-primary-dark mb-3">🔍 発見とメモ</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleNavigation('/tags')}
                  className="block text-left text-gray-600 hover:text-primary hover:bg-primary-light px-3 py-2 rounded w-full transition-colors"
                >
                  🏷 タグ一覧
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/archive')}
                  className="block text-left text-gray-600 hover:text-primary hover:bg-primary-light px-3 py-2 rounded w-full transition-colors"
                >
                  📂 月別アーカイブ
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('/essays')}
                  className="block text-left text-gray-600 hover:text-primary hover:bg-primary-light px-3 py-2 rounded w-full transition-colors"
                >
                  📝 エッセイ
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}