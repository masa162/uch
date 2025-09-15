'use client'

import { useState } from 'react'

type UploadResult = {
  ok: boolean
  fileName: string
  error?: string
}

export default function UploadWidget({ onUploaded }: { onUploaded?: () => void }) {
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState<UploadResult[]>([])

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uch-api.belong2jazz.workers.dev'

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setBusy(true)
    const outcomes: UploadResult[] = []

    for (const file of Array.from(files)) {
      const outcome: UploadResult = { ok: false, fileName: file.name }
      try {
        // 1) ask API for presigned URL
        const pres = await fetch(`${apiBase}/api/media/generate-upload-url`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileType: file.type || 'application/octet-stream' }),
        })
        if (!pres.ok) throw new Error(`presign ${pres.status}`)
        const { url, storageKey } = (await pres.json()) as { url: string; storageKey: string }

        // 2) PUT file to R2
        const put = await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
        if (!put.ok) throw new Error(`upload ${put.status}`)

        // 3) notify API
        const done = await fetch(`${apiBase}/api/media/upload-complete`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            storageKey, 
            originalFilename: file.name, 
            fileType: file.type,
            fileSize: file.size
          }),
        })
        if (!done.ok) throw new Error(`record ${done.status}`)
        outcome.ok = true
      } catch (err: any) {
        // Fallback: upload via API (multipart) when presigned PUT fails (likely CORS)
        try {
          const fd = new FormData()
          fd.append('file', file)
          const up2 = await fetch(`${apiBase}/api/media/upload-direct`, {
            method: 'POST',
            credentials: 'include',
            body: fd,
          })
          if (!up2.ok) throw new Error(`direct ${up2.status}`)
          outcome.ok = true
          outcome.error = undefined
        } catch (e2: any) {
          outcome.error = String(e2?.message || err?.message || err)
        }
      }
      outcomes.push(outcome)
      setResults((prev) => [...prev, outcome])
    }

    setBusy(false)
    if (outcomes.some((o) => o.ok)) onUploaded?.()
    // reset input so same files can be picked again
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      <label className={`btn btn-primary ${busy ? 'btn-disabled' : ''}`}>
        {busy ? 'アップロード中...' : 'メディアを追加'}
        <input type="file" accept="image/*,video/*" multiple hidden onChange={handleSelect} />
      </label>
      {results.length > 0 && (
        <div className="text-sm opacity-70">
          {results.map((r, i) => (
            <div key={i}>
              {r.ok ? '✅' : '⚠️'} {r.fileName} {r.error ? `- ${r.error}` : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
