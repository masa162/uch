'use client'

import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function AuthenticatedLayout({ 
  children, 
  showSidebar = true 
}: AuthenticatedLayoutProps) {
  const { user, loading } = useAuth()

  // ログイン画面やあいことば画面ではサイドバーを表示しない
  if (!user || loading) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-base-200">
      {showSidebar ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row gap-8">
            <Sidebar />
            <main className="w-3/4">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
    </div>
  )
}