'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-error mb-4">⚠️</h1>
          <h2 className="text-2xl font-semibold text-base-content mb-2">
            予期しないエラーが発生しました
          </h2>
          <p className="text-base-content/70 mb-8">
            申し訳ございません。アプリケーションでエラーが発生しました。
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="btn btn-primary w-full"
          >
            もう一度試す
          </button>

          <Link href="/" className="btn btn-outline w-full">
            ホームページに戻る
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-error/10 border border-error/20 rounded-lg text-left">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-error">
                開発者向け詳細情報
              </summary>
              <pre className="mt-2 text-xs text-error break-all">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          </div>
        )}

        <div className="pt-8 text-center text-xs text-base-content/50">
          <p>問題が解決しない場合は、管理者にお問い合わせください。</p>
        </div>
      </div>
    </div>
  )
}