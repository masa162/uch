'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar';
import AuthRequiredModal from './AuthRequiredModal';
import MobileMenu from './MobileMenu';
import { useAuth } from '@/contexts/AuthContext';

type AuthenticatedLayoutProps = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 開発環境では認証チェックをスキップ
  const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true'

  useEffect(() => {
    if (loading || skipAuth) return // ローディング中または認証スキップ時は何もしない
    
    // ユーザーがない場合のみサインイン画面にリダイレクト
    if (!user) {
      router.push('/signin')
      return
    }
  }, [loading, router, user, skipAuth])

  // ローディング中の場合はローディング画面を表示
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* ハンバーガーメニューボタン (モバイル時のみ表示) */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-20 bg-base-100 p-3 rounded-lg shadow-lg border border-base-300 hover:bg-base-200 transition-colors"
        aria-label="メニューを開く"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className="w-5 h-0.5 bg-base-content mb-1"></span>
          <span className="w-5 h-0.5 bg-base-content mb-1"></span>
          <span className="w-5 h-0.5 bg-base-content"></span>
        </div>
      </button>

      {/* モバイルメニュー */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* デスクトップ時のサイドバー */}
          <aside className="hidden md:block md:w-1/4">
            <Sidebar />
          </aside>
          
          {/* メインコンテンツ (モバイル時は上部余白を追加) */}
          <main className="w-full md:w-3/4 pt-16 md:pt-0">
            {children}
          </main>
        </div>
      </div>
      <AuthRequiredModal />
    </div>
  );
}