'use client'

import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import Link from 'next/link';

export default function HomePage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">おかえりなさい 🏠</h1>
          <p className="text-gray-600">今日も家族の大切な思い出を、やさしく残していきましょう 💝</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 記事一覧カード */}
          <Link href="/articles" className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer">
            <div className="card-body">
              <h2 className="card-title">📚 記事一覧</h2>
              <p>みんなの思い出を見る</p>
            </div>
          </Link>
          
          {/* 新しい記事カード */}
          <Link href="/articles/new" className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer border-2 border-primary">
            <div className="card-body">
              <h2 className="card-title">✍️ 新しい記事</h2>
              <p>新しい思い出を書く</p>
            </div>
          </Link>
          
          {/* プロフィールカード */}
          <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer">
            <div className="card-body">
              <h2 className="card-title">👤 プロフィール</h2>
              <p>あなたについて教えてください</p>
            </div>
          </div>
        </div>
        
        {/* 最近の記事セクション */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">最近の記事</h2>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">まだ記事がありません</p>
            <Link href="/articles/new" className="btn btn-primary">
              最初の記事を書く
            </Link>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}