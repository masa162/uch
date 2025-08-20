'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ImageUpload from '@/components/ImageUpload'
import R2ImageUploader from '@/components/R2ImageUploader'
import { useAuthAction } from '@/hooks/useAuthAction'

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
  const { runAuthAction } = useAuthAction()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit')
  
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

  const handleImageUploaded = (markdown: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n\n' + markdown
    }))
  }

  const handleR2ImageUploaded = (fileInfo: { fileName: string; publicUrl: string }) => {
    const markdown = `![${fileInfo.fileName}](${fileInfo.publicUrl})`
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
      setLoading(true)
      setError(null)

      // タグを配列に変換
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      console.log('Submitting article:', { ...formData, tags })

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

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error response:', errorData)
        throw new Error(errorData.error || `記事の作成に失敗しました (${response.status})`)
      }

      const result = await response.json()
      console.log('Article created successfully:', result)
      
      // 作成成功後、記事詳細ページにリダイレクト
      router.push(`/articles/${result.article.slug}`)
      
    } catch (err) {
      console.error('Article submission error:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runAuthAction(handleSubmit)
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
            <form onSubmit={handleFormSubmit} className="space-y-6">
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
                <div className="flex justify-between items-center">
                  <label className="label">
                    <span className="label-text font-semibold text-base">本文 *</span>
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
                    <R2ImageUploader 
                      onUploadSuccess={handleR2ImageUploaded}
                      onUploadError={(error) => setError(error)}
                    />
                  </div>
                )}
                
                {previewMode === 'edit' ? (
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