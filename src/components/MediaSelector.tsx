'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

interface MediaFile {
  id: string
  originalFilename: string
  mimeType: string
  fileSize: number
  status: string
  createdAt: string
  displayUrl: string | null
  thumbnailUrl: string | null
  optimizedFiles: {
    quality: string
    url: string
    width: number | null
    height: number | null
    fileSize: number | null
    mimeType: string
  }[]
}

interface MediaSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (mediaFile: MediaFile, quality?: string) => void
  className?: string
}

export default function MediaSelector({ 
  isOpen, 
  onClose, 
  onSelect,
  className = '' 
}: MediaSelectorProps) {
  const { user } = useAuth()
  const [media, setMedia] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuality, setSelectedQuality] = useState('medium')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen && user) {
      fetchMedia()
    }
  }, [isOpen, user])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: '50',
        sortBy: 'newest',
        quality: selectedQuality,
      })

      const response = await fetch(`/api/media?${params}`)
      
      if (!response.ok) {
        throw new Error('メディアの取得に失敗しました')
      }

      const data = await response.json()
      setMedia(data.media || [])
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleMediaSelect = (mediaFile: MediaFile, quality: string = selectedQuality) => {
    onSelect(mediaFile, quality)
    onClose()
  }

  const generateMarkdown = (mediaFile: MediaFile, quality: string) => {
    const selectedFile = mediaFile.optimizedFiles.find(f => f.quality === quality)
    const url = selectedFile?.url || mediaFile.displayUrl
    const altText = mediaFile.originalFilename.replace(/\.[^/.]+$/, '') // 拡張子を除去
    
    if (mediaFile.mimeType.startsWith('video/')) {
      return `<video controls width="100%">\n  <source src="${url}" type="${mediaFile.mimeType}">\n  お使いのブラウザは動画タグをサポートしていません。\n</video>`
    } else {
      return `![${altText}](${url})`
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('コピーに失敗しました:', err)
    }
  }

  const filteredMedia = media.filter(file =>
    file.originalFilename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl max-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">📷 メディアギャラリーから選択</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* 検索・フィルター */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="ファイル名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered input-sm w-full"
            />
          </div>
          <select 
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="thumbnail">サムネイル</option>
            <option value="medium">中品質</option>
            <option value="high">高品質</option>
          </select>
        </div>

        {/* コンテンツ */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-base-content/70">メディアを読み込み中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="alert alert-error max-w-md mx-auto">
                <span>⚠️ {error}</span>
              </div>
              <button 
                onClick={fetchMedia}
                className="btn btn-primary mt-4"
              >
                再試行
              </button>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <h2 className="text-2xl font-bold mb-2">
                {searchTerm ? '検索結果がありません' : 'メディアがありません'}
              </h2>
              <p className="text-base-content/70">
                {searchTerm ? '別のキーワードで検索してください' : 'まずファイルをアップロードしてください'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((mediaFile) => (
                <div
                  key={mediaFile.id}
                  className="group cursor-pointer bg-base-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 border"
                >
                  {/* 画像プレビュー */}
                  <div className="aspect-square relative bg-base-300">
                    {mediaFile.thumbnailUrl || mediaFile.displayUrl ? (
                      <Image
                        src={mediaFile.thumbnailUrl || mediaFile.displayUrl || ''}
                        alt={mediaFile.originalFilename}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl">
                          {mediaFile.mimeType.startsWith('video/') ? '🎥' : '📄'}
                        </div>
                      </div>
                    )}
                    
                    {/* ホバーオーバーレイ */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMediaSelect(mediaFile)}
                          className="btn btn-primary btn-sm"
                        >
                          選択
                        </button>
                        <button
                          onClick={() => copyToClipboard(generateMarkdown(mediaFile, selectedQuality))}
                          className="btn btn-ghost btn-sm text-white"
                          title="マークダウンをコピー"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* メタ情報 */}
                  <div className="p-3">
                    <p className="text-sm font-medium truncate mb-1" title={mediaFile.originalFilename}>
                      {mediaFile.originalFilename}
                    </p>
                    <div className="flex justify-between items-center text-xs text-base-content/70">
                      <span>{new Date(mediaFile.createdAt).toLocaleDateString('ja-JP')}</span>
                      <span className="capitalize">{selectedQuality}</span>
                    </div>
                    
                    {/* ファイル情報 */}
                    <div className="mt-2 text-xs text-base-content/50">
                      {mediaFile.mimeType.startsWith('video/') && (
                        <span className="badge badge-secondary badge-xs mr-1">動画</span>
                      )}
                      {mediaFile.optimizedFiles.length}品質
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="modal-action">
          <div className="flex justify-between items-center w-full">
            <div className="text-xs text-base-content/70">
              💡 画像をホバーして「選択」ボタンをクリック、または📋でマークダウンをコピー
            </div>
            <button className="btn" onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button>close</button>
      </div>
    </div>
  )
}