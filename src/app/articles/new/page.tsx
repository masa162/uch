'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

const articleSchema = z.object({
  title: z.string().min(1, '記事のタイトルを入力してください'),
  content: z.string().min(1, '記事の内容を入力してください'),
  tags: z.string().optional(),
  heroImage: z.string().optional(),
  isPublished: z.boolean().optional(),
})

type ArticleFormData = z.infer<typeof articleSchema>

export default function NewArticlePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      isPublished: true,
    }
  })

  const heroImageValue = watch('heroImage')

  const onSubmit = async (data: ArticleFormData) => {
    if (!session) return

    setIsSubmitting(true)
    try {
      // タグの処理
      const tags = data.tags 
        ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []

      const payload = {
        title: data.title,
        content: data.content,
        tags,
        heroImage: data.heroImage || undefined,
        isPublished: isDraft ? false : (data.isPublished ?? true),
      }

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '記事の投稿に失敗しました')
      }

      const result = await response.json()
      
      if (isDraft) {
        alert('下書きとして保存しました！')
        router.push('/articles')
      } else {
        alert('記事を投稿しました！')
        router.push(`/articles/${result.slug}`)
      }
    } catch (error) {
      console.error('Article submission error:', error)
      alert(error instanceof Error ? error.message : '記事の投稿に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('画像のアップロードに失敗しました')
      }

      const result = await response.json()
      setValue('heroImage', result.url)
    } catch (error) {
      console.error('Image upload error:', error)
      alert('画像のアップロードに失敗しました')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSimplePost = async () => {
    const title = (document.getElementById('simple-title') as HTMLInputElement)?.value
    const content = (document.getElementById('simple-content') as HTMLTextAreaElement)?.value

    if (!title || !content) {
      alert('タイトルと内容を入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/articles/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '簡易投稿に失敗しました')
      }

      const result = await response.json()
      alert('投稿しました！')
      router.push(`/articles/${result.slug}`)
    } catch (error) {
      console.error('Simple post error:', error)
      alert(error instanceof Error ? error.message : '簡易投稿に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>ログインが必要です</p>
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">新しい記事を書く</h1>
          
          {/* タブ切り替え */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                onClick={() => document.getElementById('detailed-form')?.scrollIntoView()}
              >
                詳細フォーム
              </button>
              <button
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                onClick={() => document.getElementById('simple-form')?.scrollIntoView()}
              >
                簡易投稿
              </button>
            </nav>
          </div>
        </div>

        {/* 簡易投稿フォーム */}
        <div id="simple-form" className="mb-12 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📝 簡易投稿</h2>
          <p className="text-gray-600 mb-4">タイトルと内容だけで手軽に投稿できます</p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="simple-title" className="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                id="simple-title"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="今日の出来事..."
              />
            </div>
            
            <div>
              <label htmlFor="simple-content" className="block text-sm font-medium text-gray-700 mb-1">
                内容
              </label>
              <textarea
                id="simple-content"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="今日はこんなことがありました..."
              />
            </div>
            
            <button
              onClick={handleSimplePost}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? '投稿中...' : '今すぐ投稿'}
            </button>
          </div>
        </div>

        {/* 詳細フォーム */}
        <div id="detailed-form">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">📖 詳細フォーム</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                タイトル *
              </label>
              <input
                id="title"
                type="text"
                {...register('title')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="記事のタイトルを入力してください"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* ヒーロー画像 */}
            <div>
              <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700 mb-1">
                ヒーロー画像
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadingImage && <p className="text-sm text-gray-600">アップロード中...</p>}
                {heroImageValue && (
                  <div className="mt-2">
                    <img src={heroImageValue} alt="Hero" className="w-full max-w-md h-48 object-cover rounded-md" />
                  </div>
                )}
              </div>
            </div>

            {/* 内容 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                内容 *
              </label>
              <textarea
                id="content"
                rows={12}
                {...register('content')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="記事の内容を入力してください..."
              />
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
            </div>

            {/* タグ */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                タグ
              </label>
              <input
                id="tags"
                type="text"
                {...register('tags')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="タグをカンマ区切りで入力（例: 家族, 旅行, 思い出）"
              />
            </div>

            {/* 投稿オプション */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isPublished')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">すぐに公開する</span>
              </label>
            </div>

            {/* 送信ボタン */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? '投稿中...' : '投稿する'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsDraft(true)
                  handleSubmit(onSubmit)()
                }}
                disabled={isSubmitting}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                下書き保存
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/articles')}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}