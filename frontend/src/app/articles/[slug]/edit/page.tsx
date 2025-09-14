'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

type Article = {
  title: string
  description: string | null
  content: string
  heroImageUrl: string | null
  tags: string[]
}

export default function EditArticlePage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const router = useRouter()

  const [form, setForm] = useState<Article>({ title: '', description: '', content: '', heroImageUrl: '', tags: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      try {
        setLoading(true)
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
        const res = await fetch(`${apiBase}/api/articles/${encodeURIComponent(slug)}`, { credentials: 'include' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json().catch(() => null)) as unknown
        const obj = (data && typeof data === 'object') ? (data as Record<string, any>) : {}
        setForm({
          title: (obj.title as string) ?? '',
          description: (obj.description as string | null) ?? '',
          content: (obj.content as string) ?? '',
          heroImageUrl: (obj.heroImageUrl as string | null) ?? '',
          tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : [],
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : '読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      const res = await fetch(`${apiBase}/api/articles/${encodeURIComponent(slug!)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tags: form.tags,
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${text}`)
      }
      router.push(`/articles/${encodeURIComponent(slug!)}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setSaving(false)
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
            <div className="flex gap-3">
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? '保存中...' : '保存する'}</button>
              <button className="btn" type="button" onClick={() => router.push(`/articles/${encodeURIComponent(slug!)}`)}>キャンセル</button>
            </div>
          </form>
        </div>
      )}
    </AuthenticatedLayout>
  )
}
