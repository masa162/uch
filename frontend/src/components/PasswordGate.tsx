'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const SITE_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD
const SESSION_STORAGE_KEY = 'site_password_verified'

// ひらがな・カタカナの相互変換（簡易）と前後空白・大文字小文字の正規化
const normalize = (s: string) => {
  const trimmed = s.trim().toLowerCase()
  // カタカナ → ひらがな
  const hira = trimmed.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  )
  return hira
}

const isPasswordMatch = (input: string) => {
  if (!SITE_PASSWORD) return false
  const base = normalize(SITE_PASSWORD)
  const target = normalize(input)
  // 同義語（よみ違い）も許容
  const synonyms = new Set<string>([
    base,
    normalize('きぼう'),
    normalize('キボウ'),
    normalize('希望'),
    normalize('kibou'),
  ])
  return synonyms.has(target)
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { status } = useSession()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // 入力の都度判定（正しければ即通過）
  useEffect(() => {
    if (SITE_PASSWORD && isPasswordMatch(password)) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')
      setIsAuthenticated(true)
      setError('')
      // 次の認証ステップへ誘導（まだログインしていなければ /signin へ）
      if (status !== 'authenticated') {
        // 現在のパスが /signin でなければ遷移
        if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
          router.push('/signin')
        }
      }
    }
  }, [password])

  // セッション記憶での通過
  useEffect(() => {
    if (SITE_PASSWORD) {
      const isVerified = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (isVerified === 'true') setIsAuthenticated(true)
    } else {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (SITE_PASSWORD && isPasswordMatch(password)) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')
      setIsAuthenticated(true)
      setError('')
      if (status !== 'authenticated') {
        if (typeof window !== 'undefined' && window.location.pathname !== '/signin') {
          router.push('/signin')
        }
      }
    } else {
      setError('あいことばが違います。ひらがな・カタカナ・「希望」も試せます。')
    }
  }

  if (!SITE_PASSWORD || isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 bg-base-100 flex items-center justify-center z-50">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="w-full flex justify-center mb-3">
            <img
              src="/images/ogp/ogp.png"
              alt="うちのきろく ロゴ画像"
              className="rounded-lg shadow max-w-[220px] w-full h-auto"
              width={220}
              height={120}
              loading="eager"
            />
          </div>
          <h2 className="card-title">あいことばを入力してください 🏠</h2>
          {/* 説明テキストは非表示に変更（要望により削除） */}
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <input
                type="text"
                placeholder="あいことば"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p className="text-error text-sm mt-2">{error}</p>}
            <div className="card-actions justify-end mt-4">
              <button type="submit" className="btn btn-primary">
                入室
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
