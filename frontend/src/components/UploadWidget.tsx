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

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setBusy(true)
    const outcomes: UploadResult[] = []

    for (const file of Array.from(files)) {
      const outcome: UploadResult = { ok: false, fileName: file.name }
      try {
        // 1) ask API for upload URL
        const pres = await fetch(`${apiBase}/api/media/generate-upload-url`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            filename: file.name, 
            mimeType: file.type || 'application/octet-stream',
            fileSize: file.size
          }),
        })
        if (!pres.ok) throw new Error(`presign ${pres.status}`)
        const { uploadUrl, fields } = (await pres.json()) as { uploadUrl: string; fields: any }

        // 2) Upload file directly to API
        const formData = new FormData()
        formData.append('file', file)
        formData.append('originalFilename', file.name)
        
        const upload = await fetch(uploadUrl, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })
        if (!upload.ok) {
          const errText = await upload.text().catch(() => '')
          throw new Error(`upload ${upload.status}: ${errText}`)
        }
        outcome.ok = true
      } catch (err: any) {
        // Fallback: upload via API (multipart) when presigned PUT fails (likely CORS)
        try {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('originalFilename', file.name)
          const up2 = await fetch(`${apiBase}/api/media/upload-direct`, {
            method: 'POST',
            credentials: 'include',
            body: fd,
          })
          if (!up2.ok) {
            const errText2 = await up2.text().catch(() => '')
            throw new Error(`direct ${up2.status}: ${errText2}`)
          }
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
    const hasSuccessfulUploads = outcomes.some((o) => o.ok)
    console.log('Upload results:', outcomes, 'Has successful uploads:', hasSuccessfulUploads)
    if (hasSuccessfulUploads) {
      console.log('Calling onUploaded callback')
      onUploaded?.()
    }
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
