'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'

interface ArticleFormData {
  title: string
  description: string
  content: string
  tags: string
  isPublished: boolean
}

export default function NewArticlePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    description: '',
    content: '',
    tags: '',
    isPublished: true
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    if (!formData.content.trim()) {
      setError('本文を入力してください')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // タグを配列に変換
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags,
          pubDate: new Date().toISOString()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '記事の作成に失敗しました')
      }

      const result = await response.json()
      
      // 作成成功後、記事詳細ページにリダイレクト
      router.push(`/articles/${result.article.slug}`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-8">
          <div className="alert alert-error max-w-md mx-auto">
            <span>⚠️ ログインが必要です</span>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">✍️ 新しい記事を書く</h1>
            <p className="text-gray-600">家族の大切な思い出を残しましょう</p>
          </div>
          <Link 
            href="/articles"
            className="btn btn-outline"
          >
            ← 記事一覧に戻る
          </Link>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* 記事作成フォーム */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* タイトル */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base">タイトル *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="記事のタイトルを入力してください"
                  className="input input-bordered w-full focus:input-primary"
                  required
                />
              </div>

              {/* 説明 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base">説明</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="記事の概要や説明を入力してください"
                  className="textarea textarea-bordered w-full focus:textarea-primary"
                  rows={3}
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">読者が記事の内容を理解しやすくなります</span>
                </label>
              </div>

              {/* タグ */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base">タグ</span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="家族, 旅行, 料理 (カンマ区切りで入力)"
                  className="input input-bordered w-full focus:input-primary"
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">カンマ区切りで複数のタグを入力できます</span>
                </label>
              </div>

              {/* 本文 */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base">本文 *</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="記事の本文を入力してください...

家族との大切な思い出や日常の出来事を、心を込めて綴ってみてください。
マークダウン記法を使って、見出しやリスト、リンクなども自由に使えます。"
                  className="textarea textarea-bordered w-full font-serif text-lg leading-relaxed focus:textarea-primary"
                  rows={20}
                  required
                  style={{ minHeight: '400px' }}
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    マークダウン形式で入力できます（# 見出し、**太字**、- リストなど）
                  </span>
                </label>
              </div>

              {/* 公開設定 */}
              <div className="form-control">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <span className="label-text font-semibold text-base">公開設定</span>
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.isPublished 
                        ? '✅ 記事を公開して、みんなに共有します' 
                        : '📝 下書きとして保存し、後で公開できます'
                      }
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="checkbox checkbox-primary checkbox-lg"
                  />
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link 
                  href="/articles"
                  className="btn btn-outline btn-lg"
                >
                  キャンセル
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      保存中...
                    </>
                  ) : (
                    formData.isPublished ? '🚀 記事を公開' : '📝 下書き保存'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ヘルプ */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-lg">💡 記事作成のヒント</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>タイトルは分かりやすく、内容を端的に表現しましょう</li>
              <li>説明文で記事の概要を伝えると、読者が理解しやすくなります</li>
              <li>タグは関連するキーワードをカンマ区切りで入力してください</li>
              <li>本文は読みやすく、段落を意識して書くと良いでしょう</li>
              <li>下書きとして保存して、後で編集することもできます</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}