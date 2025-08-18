'use client'

import { useState, useRef, useCallback } from 'react'

interface ImageUploadProps {
  onImageUploaded: (markdown: string) => void
  className?: string
}

export default function ImageUpload({ onImageUploaded, className = '' }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      uploadImage(imageFile)
    } else {
      setError('画像ファイルのみアップロードできます')
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
  }, [])

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルのみアップロードできます')
      return
    }

    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください')
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'アップロードに失敗しました')
      }

      const result = await response.json()
      
      // マークダウン形式で画像を挿入
      const markdown = `![${file.name}](${result.url})`
      onImageUploaded(markdown)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* エラーメッセージ */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* アップロードエリア */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={isUploading ? undefined : handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600">画像をアップロード中...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl">📷</div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                画像をアップロード
              </p>
              <p className="text-sm text-gray-500">
                クリックしてファイルを選択、またはドラッグ&ドロップ
              </p>
            </div>
            <div className="text-xs text-gray-400">
              対応形式: JPG, PNG, GIF, WebP (最大5MB)
            </div>
          </div>
        )}
      </div>

      {/* ヘルプテキスト */}
      <div className="text-xs text-gray-500 text-center">
        アップロードされた画像は記事の本文に自動挿入されます
      </div>
    </div>
  )
}
