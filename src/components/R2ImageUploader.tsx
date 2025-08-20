'use client'

import { useState } from 'react'

interface R2ImageUploaderProps {
  onUploadSuccess?: (fileInfo: { fileName: string; publicUrl: string }) => void
  onUploadError?: (error: string) => void
  className?: string
}

export default function R2ImageUploader({ 
  onUploadSuccess, 
  onUploadError, 
  className = '' 
}: R2ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'initial' | 'uploading' | 'success' | 'fail'>('initial')
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // ファイルサイズチェック（5MB）
      if (file.size > 5 * 1024 * 1024) {
        onUploadError?.('ファイルサイズは5MB以下にしてください')
        return
      }

      // ファイル形式チェック
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        onUploadError?.('対応していないファイル形式です')
        return
      }

      setSelectedFile(file)
      setStatus('initial')
      setUploadProgress(0)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setStatus('uploading')
    setUploadProgress(0)

    try {
      // 1. 署名付きURLをリクエスト
      const response = await fetch('/api/r2/generate-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '署名付きURLの取得に失敗しました')
      }

      const { url, fileName, publicUrl } = await response.json()
      console.log('Got signed URL:', url)

      // 2. 署名付きURLにファイルを直接PUTリクエストでアップロード
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type },
      })

      if (!uploadResponse.ok) {
        throw new Error('アップロードに失敗しました')
      }
      
      setStatus('success')
      setUploadProgress(100)
      console.log('Upload successful! File available at:', fileName)
      
      // メディアファイルの情報をデータベースに保存
      try {
        const mediaResponse = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName,
            originalName: selectedFile.name,
            fileType: selectedFile.type,
            fileSize: selectedFile.size,
            publicUrl,
            r2Key: fileName,
            metadata: {
              uploadedAt: new Date().toISOString(),
              contentType: selectedFile.type,
            }
          }),
        })

        if (!mediaResponse.ok) {
          console.warn('Failed to save media file info to database')
        }
      } catch (error) {
        console.warn('Failed to save media file info to database:', error)
      }
      
      // 成功コールバックを呼び出し
      onUploadSuccess?.({
        fileName,
        publicUrl
      })

    } catch (error) {
      console.error('Upload error:', error)
      setStatus('fail')
      onUploadError?.(error instanceof Error ? error.message : 'アップロードに失敗しました')
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setStatus('initial')
    setUploadProgress(0)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ファイル選択 */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">画像ファイルを選択</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full"
          disabled={status === 'uploading'}
        />
        <label className="label">
          <span className="label-text-alt text-gray-500">
            対応形式: JPG, PNG, GIF, WebP (最大5MB)
          </span>
        </label>
      </div>

      {/* 選択されたファイル情報 */}
      {selectedFile && (
        <div className="card bg-base-200">
          <div className="card-body p-4">
            <h3 className="card-title text-sm">選択されたファイル</h3>
            <div className="text-sm space-y-1">
              <p><strong>ファイル名:</strong> {selectedFile.name}</p>
              <p><strong>サイズ:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>形式:</strong> {selectedFile.type}</p>
            </div>
          </div>
        </div>
      )}

      {/* アップロードボタン */}
      <div className="flex space-x-2">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || status === 'uploading'}
          className="btn btn-primary flex-1"
        >
          {status === 'uploading' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              アップロード中...
            </>
          ) : (
            '🚀 アップロード'
          )}
        </button>
        
        {selectedFile && status !== 'uploading' && (
          <button
            onClick={resetUpload}
            className="btn btn-outline"
          >
            リセット
          </button>
        )}
      </div>

      {/* プログレスバー */}
      {status === 'uploading' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* ステータス表示 */}
      {status === 'success' && (
        <div className="alert alert-success">
          <span>✅ アップロードが完了しました！</span>
        </div>
      )}
      
      {status === 'fail' && (
        <div className="alert alert-error">
          <span>❌ アップロードに失敗しました</span>
        </div>
      )}

      {/* アップロード成功後の情報 */}
      {status === 'success' && selectedFile && (
        <div className="card bg-success/10 border-success">
          <div className="card-body p-4">
            <h3 className="card-title text-success text-sm">アップロード完了</h3>
            <div className="text-sm space-y-1">
              <p><strong>ファイル名:</strong> {selectedFile.name}</p>
              <p><strong>Cloudflare R2:</strong> 正常に保存されました</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
