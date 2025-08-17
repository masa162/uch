'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import PasswordGate from '@/components/PasswordGate'
import AuthForm from '@/components/AuthForm'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function Home() {
  const [hasPassword, setHasPassword] = useState(false)
  const { user, loading, signOut } = useAuth()

  if (!hasPassword) {
    return <PasswordGate onSuccess={() => setHasPassword(true)} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
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
                こんにちは、{user.email}さん
              </span>
              <button
                onClick={signOut}
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
