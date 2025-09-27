'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

type Article = {
  title: string
  description: string | null
  content: string
  heroImageUrl: string | null
  tags: string[]
  media?: MediaItem[]
}

export default function EditArticleContent() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()

  const [form, setForm] = useState<Article>({ title: '', description: '', content: '', heroImageUrl: '', tags: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([])
  const [showMediaSelector, setShowMediaSelector] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        setLoading(true)
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
        const res = await fetch(`${apiBase}/api/articles/${id}`, { credentials: 'include' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json().catch(() => null)) as unknown
        const obj = (data && typeof data === 'object') ? (data as Record<string, any>) : {}
        const article = {
          title: (obj.title as string) ?? '',
          description: (obj.description as string | null) ?? '',
          content: (obj.content as string) ?? '',
          heroImageUrl: (obj.heroImageUrl as string | null) ?? '',
          tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : [],
          media: Array.isArray(obj.media) ? (obj.media as MediaItem[]) : [],
        }
        setForm(article)

        // 既存の関連メディアIDを設定
        if (article.media && article.media.length > 0) {
          setSelectedMediaIds(article.media.map(m => m.id))
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

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
    fetchMediaItems()
  }, [])

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const res = await fetch(`${apiBase}/api/articles/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags,
          mediaIds: selectedMediaIds,
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${text}`)
      }
      router.push(`/articles/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('この記事を削除しますか？ この操作は取り消せません。')) return
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const res = await fetch(`${apiBase}/api/articles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok && res.status !== 204) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${text}`)
      }
      router.push('/articles')
    } catch (e) {
      alert(e instanceof Error ? e.message : '削除に失敗しました')
    }
  }

  return (
    <AuthenticatedLayout>
      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="container mx-auto max-w-3xl py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">🛠 記事を編集</h1>
          {error && (
            <div className="alert alert-error mb-6">
              <span>⚠️ {error}</span>
            </div>
          )}
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">タイトル</label>
              <input className="input input-bordered w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">説明（省略可）</label>
              <input className="input input-bordered w-full" value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">本文</label>
              <textarea className="textarea textarea-bordered w-full min-h-[200px]" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">タグ（カンマ区切り）</label>
                <input className="input input-bordered w-full" value={form.tags.join(', ')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hero画像URL（省略可）</label>
                <input className="input input-bordered w-full" value={form.heroImageUrl ?? ''} onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })} />
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
                      const item = mediaItems.find(m => m.id === mediaId) || form.media?.find(m => m.id === mediaId)
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
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? '保存中...' : '保存する'}</button>
              <button className="btn" type="button" onClick={() => router.push(`/articles/${id}`)}>キャンセル</button>
              <button className="btn btn-error ml-auto" type="button" onClick={handleDelete}>記事を削除</button>
            </div>
          </form>
        </div>
      )}
    </AuthenticatedLayout>
  )
}