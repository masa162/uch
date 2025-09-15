'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ProfileData {
  id: string;
  provider: string;
  email?: string;
  name?: string;
  pictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>
          <p className="text-gray-600 mt-2">アカウント情報を管理できます</p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {profile && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <p className="text-sm text-gray-600">{profile.email || '未設定'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  認証プロバイダー
                </label>
                <p className="text-sm text-gray-600 capitalize">{profile.provider}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  アカウント作成日
                </label>
                <p className="text-sm text-gray-600">
                  {new Date(profile.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
