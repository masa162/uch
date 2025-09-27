'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-base-content mb-2">
            ページが見つかりません
          </h2>
          <p className="text-base-content/70 mb-8">
            お探しのページは削除されたか、URLが間違っている可能性があります。
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="btn btn-outline w-full"
          >
            前のページに戻る
          </button>

          <Link href="/" className="btn btn-primary w-full">
            ホームページに戻る
          </Link>

          <Link href="/articles" className="btn btn-ghost w-full">
            記事一覧を見る
          </Link>
        </div>

        <div className="pt-8 text-center text-xs text-base-content/50">
          <p>問題が解決しない場合は、管理者にお問い合わせください。</p>
        </div>
      </div>
    </div>
  )
}