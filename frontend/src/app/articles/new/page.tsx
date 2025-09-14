'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function NewArticlePage() {
  const router = useRouter()
  const { status } = useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

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
