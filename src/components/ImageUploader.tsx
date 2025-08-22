'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface UploadedFile {
  id: string
  originalFilename: string
  storageKey: string
  status: string
  createdAt: string
}

interface ImageUploaderProps {
  onUploadComplete?: (files: UploadedFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  className?: string
}

export default function ImageUploader({ 
  onUploadComplete,
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mov'],
  className = ''
}: ImageUploaderProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // ファイル数制限チェック
    if (files.length > maxFiles) {
      setError(`最大${maxFiles}ファイルまでアップロードできます`)
      return
    }

    // ファイルタイプチェック
    const invalidFiles = files.filter(file => !acceptedTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      setError(`サポートされていないファイル形式です: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    setError(null)
    setUploading(true)
    
    try {
      const uploadResults = await Promise.all(
        files.map(file => uploadFile(file))
      )
      
      const successfulUploads = uploadResults.filter(Boolean) as UploadedFile[]
      setUploadedFiles(prev => [...prev, ...successfulUploads])
      onUploadComplete?.(successfulUploads)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setUploading(false)
      setUploadProgress({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    try {
      // 1. 署名付きURL取得
      const uploadUrlResponse = await fetch('/api/media/generate-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        })
      })

      if (!uploadUrlResponse.ok) {
        throw new Error('アップロードURL取得に失敗しました')
      }

      const { uploadUrl, storageKey } = await uploadUrlResponse.json()

      // 2. R2への直接アップロード
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('ファイルアップロードに失敗しました')
      }

      // 3. アップロード完了をDBに記録
      const completeResponse = await fetch('/api/media/upload-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storageKey,
          originalFilename: file.name,
          mimeType: file.type,
          fileSize: file.size
        })
      })

      if (!completeResponse.ok) {
        throw new Error('アップロード記録に失敗しました')
      }

      return await completeResponse.json()
      
    } catch (error) {
      console.error('Upload failed for file:', file.name, error)
      return null
    }
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (!user) {
    return (
      <div className="text-center p-6 bg-base-200 rounded-lg">
        <p className="text-base-content/70">ファイルをアップロードするにはログインが必要です</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* アップロードエリア */}
      <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-primary">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-primary">
                {uploading ? 'アップロード中...' : 'ファイルを選択してアップロード'}
              </p>
              <p className="text-sm text-base-content/70">
                画像・動画ファイル（最大{maxFiles}ファイル）
              </p>
              <p className="text-xs text-base-content/50 mt-1">
                対応形式: JPEG, PNG, WebP, MP4, MOV
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="alert alert-error">
          <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* アップロード済みファイル一覧 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-base-content flex items-center gap-2">
            アップロード完了
            <div className="badge badge-success badge-sm">{uploadedFiles.length}件</div>
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-xs text-success font-medium">✓</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{file.originalFilename}</span>
                    <span className="text-xs text-base-content/70 flex items-center gap-1">
                      <span className="badge badge-warning badge-xs">{file.status}</span>
                      <span>AI執事が処理準備中...</span>
                    </span>
                  </div>
                </div>
                <span className="text-xs text-base-content/50">
                  {new Date(file.createdAt).toLocaleString('ja-JP')}
                </span>
              </div>
            ))}
          </div>
          
          {/* 次のステップ案内 */}
          <div className="alert alert-info mt-4">
            <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-bold">次の処理について</h4>
              <div className="text-xs">
                アップロードしたファイルは自動的にAI執事により最適化されます。<br/>
                処理状況は下記の「AI執事処理状況」で確認できます。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* アップロード進行状況 */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="loading loading-spinner loading-sm"></span>
            <span className="text-sm">ファイルをアップロード中...</span>
          </div>
        </div>
      )}
    </div>
  )
}