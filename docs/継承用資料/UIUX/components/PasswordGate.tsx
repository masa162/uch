'use client'

import { useState, useEffect } from 'react'

interface PasswordGateProps {
  onSuccess: () => void
}

const PASSWORD_COOKIE = 'uchi_password_validated'

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // ページロード時にCookieをチェック
  useEffect(() => {
    const isValidated = localStorage.getItem(PASSWORD_COOKIE)
    if (isValidated === 'true') {
      onSuccess()
    }
  }, [onSuccess])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Check password against environment variable
    if (password === process.env.NEXT_PUBLIC_SITE_PASSWORD) {
      // Cookieに保存（7日間有効）
      localStorage.setItem(PASSWORD_COOKIE, 'true')
      onSuccess()
    } else {
      setError('あれれ？ちがうあいことばのようです。もう一度お試しください 😊')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-primary-light dark:bg-primary">
            <span className="text-3xl">🏠</span>
          </div>
          <h1 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            うちのきろく
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            家族のあたたかい思い出をつづる場所です 💝
          </p>
        </div>
        
        <div className="bg-base-100 dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="text-center mb-4">
            <span className="text-2xl">🔑</span>
            <h2 className="text-lg font-medium text-primary-dark dark:text-primary-light mt-2">
              あいことばを教えてください
            </h2>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                あいことば
              </label>
              <input
                id="password"
                name="password"
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="ひらがなで入力してくださいね"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-md p-3 text-center">
                <span className="text-red-600 dark:text-red-300 text-sm">
                  {error}
                </span>
              </div>
            )}
            
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800 transition ease-in-out hover:scale-[102%]"
              >
                <span className="mr-2">🏠</span>
                おうちに入る
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>ご家族から教えてもらったあいことばを入力してください</p>
          </div>
        </div>
      </div>
    </div>
  )
}