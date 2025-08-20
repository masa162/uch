'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

interface ProfileData {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  username?: string | null
  createdAt: string
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    username: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile()
    }
  }, [user, authLoading])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || '',
          username: data.username || ''
        })
      } else {
        setError('プロフィールの取得に失敗しました')
      }
    } catch (err) {
      setError('プロフィールの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data)
        setSuccess('プロフィールを更新しました')
        setEditing(false)
      } else {
        setError(data.error || 'プロフィールの更新に失敗しました')
      }
    } catch (err) {
      setError('プロフィールの更新中にエラーが発生しました')
    }
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (!profile) {
    return (
      <AuthenticatedLayout>
        <div className="card bg-base-100 shadow-xl p-6">
          <div className="text-center text-error">
            プロフィールの読み込みに失敗しました
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between mb-6">
              <h1 className="card-title text-2xl">📱 プロフィール</h1>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn btn-primary btn-sm"
                >
                  ✏️ 編集
                </button>
              )}
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-4">
                <span>{success}</span>
              </div>
            )}

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">名前</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input input-bordered"
                    placeholder="お名前を入力してください"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">ユーザー名</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="input input-bordered"
                    placeholder="ユーザー名を入力してください"
                  />
                  <label className="label">
                    <span className="label-text-alt">半角英数字とアンダースコアが使用できます</span>
                  </label>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      setFormData({
                        name: profile.name || '',
                        username: profile.username || ''
                      })
                      setError(null)
                      setSuccess(null)
                    }}
                    className="btn btn-outline"
                  >
                    キャンセル
                  </button>
                  <button type="submit" className="btn btn-primary">
                    保存
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="avatar">
                    <div className="w-20 h-20 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {profile.name || 'お名前未設定'}
                    </h2>
                    {profile.username && (
                      <p className="text-base-content/70">@{profile.username}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">メールアドレス</span>
                    </label>
                    <div className="input input-bordered bg-base-200">
                      {profile.email || '未設定'}
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">登録日</span>
                    </label>
                    <div className="input input-bordered bg-base-200">
                      {new Date(profile.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>

                {/* アカウント管理セクション */}
                <div className="mt-8 pt-6 border-t border-base-300">
                  <h3 className="text-lg font-semibold mb-4">🔧 アカウント管理</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setEditing(true)}
                      className="btn btn-outline"
                    >
                      ✏️ プロフィール編集
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('ログアウトしますか？')) {
                          signOut()
                        }
                      }}
                      className="btn btn-outline btn-error"
                    >
                      🚪 ログアウト
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}