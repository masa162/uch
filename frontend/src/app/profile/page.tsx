'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface ProfileData {
  id: string;
  provider: string;
  email?: string;
  name?: string;
  pictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  pubDate: string;
  heroImageUrl: string | null;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string | null;
    email: string | null;
    displayName: string | null;
  };
}

export default function ProfilePage() {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/signin');
    }
  }, [user, authLoading, router]);

  // プロフィールデータ取得
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchArticles();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com';
      const response = await fetch(`${apiBase}/api/profile`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json() as ProfileData;
        setProfile(data);
        setName(data.name || '');
      } else {
        const errorData = await response.json() as { message?: string };
        setError(errorData.message || 'プロフィールの取得に失敗しました');
      }
    } catch (err) {
      setError('プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      setArticlesLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com';
      const response = await fetch(`${apiBase}/api/articles`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json() as Article[];
        setArticles(data);
      } else {
        console.error('記事の取得に失敗しました');
      }
    } catch (err) {
      console.error('記事の取得に失敗しました');
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com';
      const response = await fetch(`${apiBase}/api/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name.trim() })
      });

      if (response.ok) {
        const updatedProfile = await response.json() as ProfileData;
        setProfile(updatedProfile);
        setSuccess('プロフィールを更新しました');
        
        // 認証状態も更新
        window.location.reload();
      } else {
        const errorData = await response.json() as { message?: string };
        setError(errorData.message || 'プロフィールの更新に失敗しました');
      }
    } catch (err) {
      setError('プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">プロフィール</h1>
          <p className="text-gray-600">あなたの情報を管理できます</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* プロフィール編集セクション */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">プロフィール編集</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    表示名
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="表示名を入力してください"
                    maxLength={100}
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {name.length}/100文字
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </form>
            </div>

            {/* 記事一覧セクション */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">作成した記事</h2>
              
              {articlesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">記事を読み込み中...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">まだ記事がありません</p>
                  <Link href="/articles/new" className="btn btn-primary">
                    最初の記事を書く
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <Link 
                      key={article.id} 
                      href={`/articles/${article.slug}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 line-clamp-2">{article.title}</h3>
                      {article.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(article.pubDate).toLocaleDateString('ja-JP')}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
