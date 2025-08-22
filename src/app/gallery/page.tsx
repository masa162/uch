'use client'

import { useState } from 'react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import MediaGallery from '@/components/MediaGallery'
import ImageUploader from '@/components/ImageUploader'
import MediaProcessingStatus from '@/components/MediaProcessingStatus'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface UploadedFile {
  id: string
  originalFilename: string
  storageKey: string
  status: string
  createdAt: string
}

export default function GalleryPage() {
  const { user } = useAuth()
  const [showUploader, setShowUploader] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [statusRefreshKey, setStatusRefreshKey] = useState(0)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleUploadComplete = (files: UploadedFile[]) => {
    console.log('新しいファイルがアップロードされました:', files)
    setShowUploader(false)
    setShowSuccessMessage(true)
    
    // 処理状況を即座に更新
    setStatusRefreshKey(prev => prev + 1)
    
    // 成功メッセージを5秒後に隠す
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 5000)
  }

  const handleProcessingComplete = () => {
    console.log('AI執事による処理が完了しました')
    // ギャラリーを更新
    setRefreshKey(prev => prev + 1)
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* ヘッダー */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">📷 メディアギャラリー</h1>
            <p className="text-base-content/70">
              アップロードされた写真・動画を閲覧できます
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="btn btn-primary"
            >
              {showUploader ? '📂 ギャラリーを表示' : '📤 ファイルをアップロード'}
            </button>
            
            <Link href="/test-upload" className="btn btn-outline">
              🧪 テストページ
            </Link>
          </div>
        </div>

        {/* 成功メッセージ */}
        {showSuccessMessage && (
          <div className="alert alert-success shadow-lg">
            <div>
              <svg className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">アップロード完了！</h3>
                <div className="text-xs">AI執事がファイルを処理中です。下記の処理状況をご確認ください。</div>
              </div>
            </div>
            <div className="flex-none">
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => setShowSuccessMessage(false)}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* AI執事処理状況 */}
        <MediaProcessingStatus 
          refreshTrigger={statusRefreshKey}
          onProcessingComplete={handleProcessingComplete}
        />

        {/* アップローダー表示 */}
        {showUploader && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">ファイルアップロード</h2>
                <button
                  onClick={() => setShowUploader(false)}
                  className="btn btn-sm btn-circle btn-ghost"
                >
                  ✕
                </button>
              </div>
              <ImageUploader 
                onUploadComplete={handleUploadComplete}
                maxFiles={10}
              />
              
              <div className="alert alert-info mt-4">
                <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-medium">自動最適化について</div>
                  <div className="text-xs mt-1">
                    アップロードされたファイルはAI執事により自動的に最適化されます。<br/>
                    💡 <strong>処理中は他のページに移動しても大丈夫です。</strong>バックグラウンドで処理が続行されます。<br/>
                    処理完了後（通常数分以内）にギャラリーに表示されます。
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ギャラリー */}
        {!showUploader && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-6">
                <h2 className="card-title">最適化済みメディア</h2>
                <div className="flex gap-2">
                  <div className="badge badge-info">AI執事により自動最適化</div>
                  <div className="badge badge-success">複数品質対応</div>
                </div>
              </div>
              
              <MediaGallery 
                key={refreshKey}
                limit={24}
                showUploader={true}
                className="min-h-96"
              />
            </div>
          </div>
        )}

        {/* 説明セクション */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">🤖 AI執事の機能</h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>自動画像最適化（WebP変換）</li>
                <li>複数品質生成（高・中・サムネイル）</li>
                <li>ファイルサイズ大幅削減</li>
                <li>自動メタデータ管理</li>
                <li>将来的なAI自動タグ付け対応</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">📋 対応ファイル形式</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>画像:</strong> JPEG, PNG, WebP, GIF
                </div>
                <div>
                  <strong>動画:</strong> MP4, MOV, AVI
                </div>
                <div>
                  <strong>最大サイズ:</strong> 100MB
                </div>
                <div>
                  <strong>最適化後:</strong> WebP (画像), MP4 (動画)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        {user && user.role !== 'GUEST' && (
          <div className="card bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="card-body">
              <h3 className="card-title">📊 あなたのメディア統計</h3>
              <p className="text-sm text-base-content/70 mb-4">
                ユーザー別の統計情報は今後実装予定です
              </p>
              <Link href="/profile" className="btn btn-outline btn-sm w-fit">
                プロフィールページ
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}