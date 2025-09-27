'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') ?? ''
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    setMessage('')
  }, [token])

  const handleRequest = async () => {
    try {
      setLoading(true)
      setError('')
      setMessage('')

      const response = await fetch(`${apiBase}/auth/email/reset-request`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json().catch(() => ({})) as { message?: string }

      if (!response.ok) {
        setError(data?.message || 'メールの送信に失敗しました。時間をおいてもう一度お試しください。')
        return
      }

      setMessage(data?.message || 'リセット手順をお送りしました。メールをご確認くださいね。')
      setEmail('')
    } catch (err) {
      console.error('reset-request error', err)
      setError('メールの送信に失敗しました。時間をおいてもう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (password.length === 0) {
      setError('あたらしいあいことばを入力してください。')
      return
    }
    if (password !== confirmPassword) {
      setError('あいことばが一致していないようです。')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')

      const response = await fetch(`${apiBase}/auth/email/reset-confirm`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json().catch(() => ({})) as { message?: string }

      if (!response.ok) {
        setError(data?.message || 'あいことばの再設定に失敗しました。再度お試しください。')
        return
      }

      setMessage(data?.message || 'あたらしいあいことばを設定しました。')
      setPassword('')
      setConfirmPassword('')

      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/?auth=success'
        }, 1500)
      }
    } catch (err) {
      console.error('reset-confirm error', err)
      setError('あいことばの再設定に失敗しました。再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const mode = token ? 'confirm' : 'request'

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">🔑 あいことばサポート</h1>
          <p className="text-base-content/70">
            {mode === 'request'
              ? 'ご登録のメールアドレス宛に、あたらしいあいことばを作る手順をお送りします。'
              : 'メールに記載されたトークンを確認しました。あたらしいあいことばを作りましょう。'}
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-6">
            {error && (
              <div className="alert alert-error">
                <span>⚠️ {error}</span>
              </div>
            )}

            {message && (
              <div className="alert alert-success">
                <span>🌱 {message}</span>
              </div>
            )}

            {mode === 'request' ? (
              <div className="space-y-4">
                <label className="form-control">
                  <span className="label-text">メールアドレス</span>
                  <input
                    type="email"
                    className="input input-bordered"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="example@uchinokiroku.com"
                  />
                </label>
                <button
                  onClick={handleRequest}
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? <span className="loading loading-spinner loading-sm"></span> : 'リセット手順を送る'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="alert alert-info text-sm">
                  <span>メールに記載されたリンクからアクセスしています。あたらしいあいことばを入力してくださいね。</span>
                </div>
                <label className="form-control">
                  <span className="label-text">あたらしい あいことば</span>
                  <input
                    type="password"
                    className="input input-bordered"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </label>
                <label className="form-control">
                  <span className="label-text">あいことばの確認</span>
                  <input
                    type="password"
                    className="input input-bordered"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </label>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? <span className="loading loading-spinner loading-sm"></span> : 'あいことばを更新する'}
                </button>
              </div>
            )}

            <div className="text-center text-sm text-base-content/70 space-y-2">
              <button
                type="button"
                className="btn btn-link"
                onClick={() => router.push('/signin')}
              >
                サインイン画面にもどる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={(
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
          <div className="card bg-base-100 shadow-xl p-6 text-center space-y-2">
            <span className="loading loading-spinner loading-lg" />
            <p className="text-base-content/70">読み込み中です…</p>
          </div>
        </div>
      )}
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
