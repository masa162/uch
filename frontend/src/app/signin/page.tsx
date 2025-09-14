'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // NextAuth からの error クエリをフレンドリーに表示
  useEffect(() => {
    const err = searchParams?.get('error')
    if (!err) return
    const map: Record<string, string> = {
      OAuthSignin: 'プロバイダへの接続に失敗しました。時間をおいて再試行してください。',
      OAuthCallback: 'Googleからの応答の処理に失敗しました。',
      CallbackRouteError: 'コールバック処理でエラーが発生しました。',
      AccessDenied: 'アクセスが拒否されました。',
      Configuration: '設定エラーです。管理者へ連絡してください。',
      Verification: '検証に失敗しました。もう一度お試しください。',
      Default: 'サインインに失敗しました。もう一度お試しください。',
    }
    setError(map[err] ?? map.Default)
  }, [searchParams])

  // 既にログインしている場合はトップへ（履歴を汚さない・errorクエリを消す）
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.replace('/')
      }
    }
    checkSession()
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError('')
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const cb = typeof window !== 'undefined' ? window.location.origin + '/' : 'https://uchinokiroku.com/'
      // Top-level redirect to API domain (stable across browsers)
      if (typeof window !== 'undefined') {
        window.location.href = `${apiBase}/api/auth/signin/google?callbackUrl=${encodeURIComponent(cb)}`
      }
    } catch (err) {
      setError('Googleサインインに失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleLineSignIn = async () => {
    try {
      setLoading(true)
      setError('')
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const cb = typeof window !== 'undefined' ? window.location.origin + '/' : 'https://uchinokiroku.com/'
      if (typeof window !== 'undefined') {
        window.location.href = `${apiBase}/api/auth/signin/line?callbackUrl=${encodeURIComponent(cb)}`
      }
    } catch (err) {
      setError('LINEサインインに失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">🏠 うちのきろく</h1>
          <h2 className="text-2xl font-semibold text-base-content mb-2">
            おかえりなさい
          </h2>
          <p className="text-base-content/70">
            家族の大切な思い出を、やさしく残していきましょう 💝
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-6">
            {error && (
              <div className="alert alert-error">
                <span>⚠️ {error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Googleサインインボタン */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn btn-outline w-full h-14 text-lg font-medium hover:bg-google hover:text-white hover:border-google transition-all duration-200"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-md"></span>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Googleでサインイン
                  </>
                )}
              </button>

              {/* LINEサインインボタン */}
              <button
                onClick={handleLineSignIn}
                disabled={loading}
                className="btn btn-outline w-full h-14 text-lg font-medium hover:bg-line hover:text-white hover:border-line transition-all duration-200"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-md"></span>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"
                      />
                    </svg>
                    LINEでサインイン
                  </>
                )}
              </button>
            </div>

            <div className="divider">または</div>

            {/* パスワード認証 */}
            <div className="text-center">
              <p className="text-sm text-base-content/70 mb-4">
                あいことばをお持ちの方はこちら
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn btn-primary w-full h-12"
              >
                🏠 あいことばで入室
              </button>
            </div>

            <div className="text-center text-xs text-base-content/50">
              <p>サインインすることで、</p>
              <p>家族の思い出を安全に共有できます 💝</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
