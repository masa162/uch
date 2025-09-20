'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [secretWord, setSecretWord] = useState('')
  const [showError, setShowError] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const handleSecretWordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (secretWord.toLowerCase() === 'きぼう') {
      setShowAuth(true)
      setShowError(false)
      setSecretWord('')
    } else {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      setSecretWord('')
    }
  }

  const handleLineAuth = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
    const cb = typeof window !== 'undefined' ? window.location.origin + '/' : 'https://uchinokiroku.com/'
    if (typeof window !== 'undefined') {
      window.location.href = `${apiBase}/api/auth/signin/line?callbackUrl=${encodeURIComponent(cb)}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* メインロゴ */}
        <div className="text-center mb-8">
          <img
            src="/images/ogp/ogp.png"
            alt="うちのきろく"
            className="mx-auto w-32 h-32 rounded-2xl shadow-lg mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">うちのきろく</h1>
          <p className="text-gray-600">家族の大切な思い出を、やさしく残す場所</p>
        </div>

        {!showAuth ? (
          /* あいことば入力フェーズ */
          <div className="card bg-white shadow-xl border-0">
            <div className="card-body p-8">
              <h2 className="card-title text-center text-2xl mb-6">🌟 あいことば</h2>
              <p className="text-center text-gray-600 mb-6">
                ご家族の方であることを確認させてください
              </p>
              
              <form onSubmit={handleSecretWordSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={secretWord}
                    onChange={(e) => setSecretWord(e.target.value)}
                    placeholder="あいことばを入力してください"
                    className="input input-bordered w-full text-center text-lg py-4"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                
                {showError && (
                  <div className="alert alert-error">
                    <span>❌ あいことばが違います</span>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-full text-lg py-4"
                  disabled={!secretWord.trim()}
                >
                  確認する
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* LINE認証フェーズ */
          <div className="card bg-white shadow-xl border-0">
            <div className="card-body p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">認証完了</h2>
                <p className="text-gray-600">
                  ようこそ、ご家族の皆さま。<br />
                  LINEでログインして続行してください。
                </p>
              </div>
              
              <button 
                onClick={handleLineAuth}
                className="btn btn-success w-full text-lg py-4 mb-4"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.628-.629.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                LINEでログイン
              </button>
              
              <p className="text-center text-sm text-gray-500">
                初回の方も同じボタンからアカウント作成できます
              </p>
            </div>
          </div>
        )}
        
        {/* フッター */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2024 うちのきろく - 家族の思い出を大切に</p>
        </div>
      </div>
    </div>
  )
}