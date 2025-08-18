'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ImageUpload from '@/components/ImageUpload'
import { useAuthAction } from '@/hooks/useAuthAction'

interface Article {
  id: string
  title: string
  slug: string
  description: string | null
  content: string
  pubDate: string
  authorId: string
  heroImageUrl: string | null
  tags: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
  author: {
    name: string | null
    email: string | null
  }
}

interface ArticleFormData {
  title: string
  description: string
  content: string
  tags: string
  isPublished: boolean
}

export default function EditArticlePage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { runAuthAction } = useAuthAction()
  
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit')
  
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    description: '',
    content: '',
    tags: '',
    isPublished: true
  })

  useEffect(() => {
    if (slug) {
      fetchArticle()
    }
  }, [slug])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/articles/${slug}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('記事が見つかりません')
        }
        throw new Error('記事の取得に失敗しました')
      }

      const articleData = await response.json()

      // 認証チェック
      if (user?.email !== articleData.author.email) {
        throw new Error('この記事を編集する権限がありません')
      }

      setArticle(articleData)
      setFormData({
        title: articleData.title,
        description: articleData.description || '',
        content: articleData.content,
        tags: articleData.tags.join(', '),
        isPublished: articleData.isPublished
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleImageUploaded = (markdown: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n\n' + markdown
    }))
  }

  const handleSubmit = async () => {
    
    if (!formData.title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    if (!formData.content.trim()) {
      setError('本文を入力してください')
      return
    }

    try {
      setSaving(true)
      setError(null)

      // タグを配列に変換
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const response = await fetch(`/api/articles/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '記事の更新に失敗しました')
      }

      // 更新成功後、記事詳細ページにリダイレクト
      router.push(`/articles/${slug}`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('この記事を削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/articles/${slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '記事の削除に失敗しました')
      }

      // 削除成功後、記事一覧ページにリダイレクト
      router.push('/articles')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runAuthAction(handleSubmit)
  }

  const handleDeleteWithAuth = () => {
    runAuthAction(handleDelete)
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">記事を読み込み中...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-8">
          <div className="alert alert-error max-w-md mx-auto">
            <span>⚠️ {error}</span>
          </div>
          <div className="mt-4 space-x-4">
            <button 
              onClick={fetchArticle}
              className="btn btn-primary"
            >
              再試行
            </button>
            <Link 
              href="/articles"
              className="btn btn-outline"
            >
              記事一覧に戻る
            </Link>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  if (!article) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-8">
          <div className="alert alert-error max-w-md mx-auto">
            <span>⚠️ 記事が見つかりません</span>
          </div>
          <Link 
            href="/articles"
            className="btn btn-primary mt-4"
          >
            記事一覧に戻る
          </Link>
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
            <h1 className="text-3xl font-bold">✏️ 記事を編集</h1>
            <p className="text-gray-600">「{article.title}」を編集中</p>
          </div>
          <div className="flex space-x-2">
            <Link 
              href={`/articles/${slug}`}
              className="btn btn-outline"
            >
              ← 記事に戻る
            </Link>
            <Link 
              href="/articles"
              className="btn btn-outline"
            >
              記事一覧
            </Link>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="alert alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* 記事編集フォーム */}
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* タイトル */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">タイトル *</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="記事のタイトルを入力してください"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* 説明 */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">説明</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="記事の概要や説明を入力してください"
              className="textarea textarea-bordered w-full"
              rows={3}
            />
          </div>

          {/* タグ */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">タグ</span>
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="家族, 旅行, 料理 (カンマ区切りで入力)"
              className="input input-bordered w-full"
            />
            <label className="label">
              <span className="label-text-alt">カンマ区切りで複数のタグを入力できます</span>
            </label>
          </div>

          {/* 本文 */}
          <div className="form-control">
            <div className="flex justify-between items-center">
              <label className="label">
                <span className="label-text font-semibold">本文 *</span>
              </label>
              <div className="tabs tabs-boxed">
                <button
                  type="button"
                  className={`tab ${previewMode === 'edit' ? 'tab-active' : ''}`}
                  onClick={() => setPreviewMode('edit')}
                >
                  ✏️ 編集
                </button>
                <button
                  type="button"
                  className={`tab ${previewMode === 'preview' ? 'tab-active' : ''}`}
                  onClick={() => setPreviewMode('preview')}
                >
                  👁️ プレビュー
                </button>
              </div>
            </div>

            {/* 画像アップロード */}
            {previewMode === 'edit' && (
              <div className="mb-4">
                <ImageUpload onImageUploaded={handleImageUploaded} />
              </div>
            )}
            
            {previewMode === 'edit' ? (
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="記事の本文を入力してください..."
                className="textarea textarea-bordered w-full font-serif"
                rows={15}
                required
                style={{ minHeight: '400px' }}
              />
            ) : (
              <div 
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                style={{ minHeight: '400px' }}
              >
                {formData.content.trim() ? (
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900">{children}</h1>,
                        h2: ({children}) => <h2 className="text-3xl font-bold mt-6 mb-3 text-gray-900">{children}</h2>,
                        h3: ({children}) => <h3 className="text-2xl font-bold mt-4 mb-2 text-gray-900">{children}</h3>,
                        p: ({children}) => <p className="mb-4 leading-relaxed text-gray-800">{children}</p>,
                        ul: ({children}) => <ul className="list-disc list-inside mb-4 ml-4">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-4 ml-4">{children}</ol>,
                        li: ({children}) => <li className="mb-1">{children}</li>,
                        blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700 my-4">{children}</blockquote>,
                        code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                        pre: ({children}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">{children}</pre>,
                        strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                        em: ({children}) => <em className="italic">{children}</em>,
                      }}
                    >
                      {formData.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-gray-400 italic flex items-center justify-center h-full">
                    本文を入力するとプレビューが表示されます
                  </div>
                )}
              </div>
            )}
            
            <label className="label">
              <span className="label-text-alt">マークダウン形式で入力できます</span>
            </label>
          </div>

          {/* 公開設定 */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text font-semibold">公開設定</span>
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="checkbox checkbox-primary"
              />
            </label>
            <label className="label">
              <span className="label-text-alt">
                {formData.isPublished ? '公開' : '下書き'}として保存されます
              </span>
            </label>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={handleDeleteWithAuth}
              disabled={saving}
              className="btn btn-error"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  削除中...
                </>
              ) : (
                '🗑️ 記事を削除'
              )}
            </button>

            <div className="flex space-x-4">
              <Link 
                href={`/articles/${slug}`}
                className="btn btn-outline"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    保存中...
                  </>
                ) : (
                  '💾 変更を保存'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* 記事情報 */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-lg">📊 記事情報</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">作成日:</span>
                <span className="ml-2">
                  {new Date(article.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <div>
                <span className="font-semibold">更新日:</span>
                <span className="ml-2">
                  {new Date(article.updatedAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <div>
                <span className="font-semibold">公開日:</span>
                <span className="ml-2">
                  {new Date(article.pubDate).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <div>
                <span className="font-semibold">スラッグ:</span>
                <span className="ml-2 font-mono text-xs">{article.slug}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
