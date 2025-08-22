'use client'

import { useState } from 'react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import ImageUploader from '@/components/ImageUploader'

interface UploadedFile {
  id: string
  originalFilename: string
  storageKey: string
  status: string
  createdAt: string
}

export default function TestUploadPage() {
  const [uploads, setUploads] = useState<UploadedFile[]>([])

  const handleUploadComplete = (files: UploadedFile[]) => {
    console.log('アップロード完了:', files)
    setUploads(prev => [...prev, ...files])
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">メディアアップロードテスト</h1>
          <p className="text-base-content/70">
            画像・動画ファイルのアップロード機能をテストします
          </p>
        </div>

        {/* アップローダー */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">ファイルアップロード</h2>
            <ImageUploader 
              onUploadComplete={handleUploadComplete}
              maxFiles={5}
            />
          </div>
        </div>

        {/* アップロード履歴 */}
        {uploads.length > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">アップロード履歴</h2>
              <div className="space-y-3">
                {uploads.map((file) => (
                  <div key={file.id} className="p-4 border border-base-300 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{file.originalFilename}</h3>
                        <p className="text-sm text-base-content/70">ID: {file.id}</p>
                        <p className="text-sm text-base-content/70">Storage Key: {file.storageKey}</p>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${
                          file.status === 'PENDING' ? 'badge-warning' :
                          file.status === 'PROCESSING' ? 'badge-info' :
                          file.status === 'OPTIMIZED' ? 'badge-success' :
                          'badge-error'
                        }`}>
                          {file.status}
                        </span>
                        <p className="text-xs text-base-content/50 mt-1">
                          {new Date(file.createdAt).toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 説明 */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-lg">動作確認ポイント</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>ファイル選択とアップロードが正常に動作するか</li>
              <li>Cloudflare R2への直接アップロードが成功するか</li>
              <li>DBにメディア情報が正しく記録されるか</li>
              <li>ステータスが「PENDING」で記録されるか</li>
              <li>エラーハンドリングが適切に動作するか</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}