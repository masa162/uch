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

  // Client-side image compression to keep under API size limits
  async function compressImageIfNeeded(file: File, maxBytes = 900_000): Promise<File> {
    try {
      if (!file.type.startsWith('image/')) return file
      // Skip GIFs and non-drawable formats
      if (/gif$/i.test(file.type)) return file
      if (file.size <= maxBytes) return file

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('failed to read file'))
        reader.readAsDataURL(file)
      })

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = () => reject(new Error('failed to load image'))
        i.src = dataUrl
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return file

      // Scale down if very large (e.g., width > 2400)
      const maxW = 2400
      const maxH = 2400
      let { width, height } = img
      const ratio = Math.min(1, maxW / width, maxH / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      let quality = 0.9
      let blob: Blob | null = null
      for (; quality >= 0.5; quality -= 0.1) {
        blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
        if (blob && blob.size <= maxBytes) break
      }
      if (!blob) return file

      const compressedName = file.name.replace(/\.(png|jpg|jpeg|webp|heic|heif)$/i, '') + '-compressed.jpg'
      return new File([blob], compressedName, { type: 'image/jpeg' })
    } catch {
      return file
    }
  }

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setBusy(true)
    const outcomes: UploadResult[] = []

    for (const orig of Array.from(files)) {
      let outcome: UploadResult = { ok: false, fileName: orig.name }
      try {
        if (orig.type.startsWith('video/')) {
          // Video → Cloudflare Stream
          const signRes = await fetch(`${apiBase}/api/video/sign`, {
            method: 'POST',
            credentials: 'include',
          })
          if (!signRes.ok) throw new Error(`video sign ${signRes.status}`)
          type StreamSignResponse = { uploadURL: string; uid: string }
          const { uploadURL, uid } = (await signRes.json()) as StreamSignResponse
          // Stream の direct upload は multipart/form-data で file パートを要求
          const fdStream = new FormData()
          fdStream.append('file', orig)
          const up = await fetch(uploadURL, {
            method: 'POST',
            body: fdStream,
          })
          if (!up.ok) {
            const t = await up.text().catch(() => '')
            throw new Error(`stream upload ${up.status}: ${t}`)
          }
          // Register in DB
          const reg = await fetch(`${apiBase}/api/media/register-video`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, originalFilename: orig.name, fileSize: orig.size, mimeType: orig.type })
          })
          if (!reg.ok) throw new Error(`video register ${reg.status}`)
          outcome.ok = true
        } else {
          // Image → R2 via Worker endpoint (with optional compression)
          const file = await compressImageIfNeeded(orig)
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

          const formData = new FormData()
          formData.append('file', file)
          formData.append('originalFilename', orig.name)
          if (fields?.key) formData.append('key', fields.key)

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
        }
      } catch (err: any) {
        outcome.error = String(err?.message || err)
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
