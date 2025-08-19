'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from './Sidebar';
import AuthRequiredModal from './AuthRequiredModal';

type AuthenticatedLayoutProps = {
  children: React.ReactNode;
};

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // ローディング中は何もしない
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  // ローディング中または未認証の場合はローディング画面を表示
  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-gray-600">
            {status === 'loading' ? '読み込み中...' : 'サインイン画面に移動中...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4">
            <Sidebar />
          </aside>
          <main className="w-full md:w-3/4">
            {children}
          </main>
        </div>
      </div>
      <AuthRequiredModal />
    </div>
  );
}