'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import UploadWidget from '@/components/UploadWidget'

type MediaItem = {
  id: number
  filename: string
  original_filename: string
  mime_type: string
  file_size: number
  file_url: string
  thumbnail_url: string | null
  created_at: string
}

export default function NewArticlePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([])
  const [showMediaSelector, setShowMediaSelector] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [loading, user, router])

  // メディア一覧を取得
  const fetchMediaItems = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const res = await fetch(`${apiBase}/api/media?limit=50`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json() as MediaItem[]
        setMediaItems(data)
      }
    } catch (error) {
      console.error('メディア取得エラー:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMediaItems()
    }
  }, [user])

  const toggleMediaSelection = (mediaId: number) => {
    setSelectedMediaIds(prev => 
      prev.includes(mediaId)
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    )
  }

  const getMediaThumbnailUrl = (item: MediaItem) => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
    if (item.thumbnail_url) {
      return item.thumbnail_url
    }
    return `${apiBase}/api/media/${item.id}/image`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const body = {
        title,
        description: description || null,
        content,
        heroImageUrl: heroImageUrl || null,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        mediaIds: selectedMediaIds,
      }
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const res = await fetch(`${apiBase}/api/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${text}`)
      }
      const created = (await res.json().catch(() => null)) as unknown
      const slug = (created && typeof created === 'object' && 'slug' in created)
        ? (created as { slug: string }).slug
        : undefined
      if (slug) {
        router.push(`/articles/${slug}`)
      } else {
        router.push('/articles')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '記事の作成に失敗しました'
      setError(`記事の作成に失敗しました: ${msg}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthenticatedLayout>
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">✍️ 新しい記事を書く</h1>

      {error && (
        <div className="alert alert-error mb-6">
          <span>⚠️ {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">タイトル</label>
          <input
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">説明（省略可）</label>
          <input
            className="input input-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="短い説明文"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">本文</label>
          <textarea
            className="textarea textarea-bordered w-full min-h-[200px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">タグ（カンマ区切り、例: 家族, 思い出）</label>
            <input
              className="input input-bordered w-full"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Hero画像URL（省略可）</label>
            <input
              className="input input-bordered w-full"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* メディア選択セクション */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium">添付するメディア</label>
            <div className="flex gap-2">
              <UploadWidget onUploaded={fetchMediaItems} />
              <button
                type="button"
                onClick={() => setShowMediaSelector(!showMediaSelector)}
                className="btn btn-sm btn-outline"
              >
                {showMediaSelector ? 'メディア選択を閉じる' : 'メディアを選択'}
              </button>
            </div>
          </div>

          {/* 選択されたメディアのプレビュー */}
          {selectedMediaIds.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">選択されたメディア ({selectedMediaIds.length}件)</div>
              <div className="flex flex-wrap gap-2">
                {selectedMediaIds.map(mediaId => {
                  const item = mediaItems.find(m => m.id === mediaId)
                  if (!item) return null
                  return (
                    <div key={mediaId} className="relative">
                      <img
                        src={getMediaThumbnailUrl(item)}
                        alt={item.original_filename}
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => toggleMediaSelection(mediaId)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* メディア選択パネル */}
          {showMediaSelector && (
            <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {mediaItems.map(item => (
                  <div
                    key={item.id}
                    className={`relative cursor-pointer border-2 rounded ${
                      selectedMediaIds.includes(item.id) ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    onClick={() => toggleMediaSelection(item.id)}
                  >
                    <img
                      src={getMediaThumbnailUrl(item)}
                      alt={item.original_filename}
                      className="w-full h-16 object-cover rounded"
                    />
                    {selectedMediaIds.includes(item.id) && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {mediaItems.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  メディアがありません。上のボタンからアップロードしてください。
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? '作成中...' : '作成する'}
          </button>
          <button type="button" className="btn" onClick={() => router.push('/articles')}>
            取消して一覧へ
          </button>
        </div>
      </form>
    </div>
    </AuthenticatedLayout>
  )
}
