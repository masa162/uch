'use client'

import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

  const handleGuestSignIn = async () => {
    setLoading(true)
    try {
      await signIn('guest', { callbackUrl: '/' })
    } catch (error) {
      console.error('Guest sign in failed:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            うちのきろく
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            家族の大切な思い出を残そう
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleGuestSignIn}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'ゲストとして利用する'
            )}
          </button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              ゲストとして利用すると、一部機能に制限があります
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}