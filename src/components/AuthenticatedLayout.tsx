'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // クライアントサイドでのみレンダリング
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (status === 'loading' && process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated' || process.env.NODE_ENV === 'development') {
    return (
      <div className="flex min-h-screen bg-gray-100"> {/* Flexコンテナを追加 */}
        <Sidebar /> {/* Sidebarを配置 */}
        <main className="flex-1 p-6 lg:ml-64"> {/* メインコンテンツ領域 */}
          {children}
        </main>
      </div>
    );
  }

  // 認証されていない場合は、NextAuth.jsの認証フローに任せる
  return null;
}