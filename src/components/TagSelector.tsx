'use client'

import { useState, useEffect } from 'react'

// プライマリタグ（元カテゴリ）の定義
const PRIMARY_TAGS = [
  { value: '家族', label: '👨‍👩‍👧‍👦 家族', color: 'blue' },
  { value: '旅行', label: '✈️ 旅行', color: 'green' },
  { value: '料理', label: '🍳 料理', color: 'orange' },
  { value: '子育て', label: '👶 子育て', color: 'pink' },
  { value: 'イベント', label: '🎉 イベント', color: 'purple' },
  { value: '日記', label: '📝 日記', color: 'gray' },
  { value: '健康', label: '💪 健康', color: 'red' },
  { value: '趣味', label: '🎨 趣味', color: 'indigo' },
  { value: 'その他', label: '📂 その他', color: 'slate' }
]

// セカンダリタグのサジェスト
const SUGGESTED_TAGS = [
  '思い出', '成長', '記念日', 'お祝い', '誕生日',
  '夏休み', '春', '夏', '秋', '冬', '週末', 
  'おでかけ', '散歩', '公園', '海', '山', 'キャンプ',
  'おやつ', '手作り', 'レシピ', '美味しい',
  '学校', '習い事', 'スポーツ', '読書', 'ゲーム',
  '感謝', '嬉しい', '楽しい', 'がんばり', '初めて'
]

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  usedTags?: string[]
  className?: string
}

export default function TagSelector({ 
  selectedTags, 
  onTagsChange, 
  usedTags = [], 
  className = "" 
}: TagSelectorProps) {
  const [tagInput, setTagInput] = useState('')

  // タグ入力文字列を配列に変換
  useEffect(() => {
    const tagsArray = tagInput.split(',').map(tag => tag.trim()).filter(Boolean)
    if (JSON.stringify(tagsArray) !== JSON.stringify(selectedTags)) {
      onTagsChange(tagsArray)
    }
  }, [tagInput, selectedTags, onTagsChange])

  // 選択済みタグから文字列を生成
  useEffect(() => {
    const tagString = selectedTags.join(', ')
    if (tagString !== tagInput) {
      setTagInput(tagString)
    }
  }, [selectedTags]) // tagInputを依存配列から除外して無限ループを防ぐ

  // タグを追加
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag]
      onTagsChange(newTags)
    }
  }

  // タグを削除
  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove)
    onTagsChange(newTags)
  }

  // プライマリタグかチェック
  const isPrimaryTag = (tag: string) => {
    return PRIMARY_TAGS.some(primaryTag => primaryTag.value === tag)
  }

  // タグの色を取得
  const getTagColor = (tag: string) => {
    const primaryTag = PRIMARY_TAGS.find(pt => pt.value === tag)
    if (primaryTag) {
      return primaryTag.color
    }
    return 'gray'
  }

  // 色のクラス名を取得
  const getColorClasses = (color: string, selected: boolean = false) => {
    const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-800', hover: 'hover:bg-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-800', hover: 'hover:bg-green-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-800', hover: 'hover:bg-orange-200' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-800', hover: 'hover:bg-pink-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800', hover: 'hover:bg-purple-200' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-800', hover: 'hover:bg-gray-200' },
      red: { bg: 'bg-red-100', text: 'text-red-800', hover: 'hover:bg-red-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', hover: 'hover:bg-indigo-200' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-800', hover: 'hover:bg-slate-200' }
    }
    
    const colors = colorMap[color] || colorMap.gray
    return selected 
      ? `${colors.bg} ${colors.text} opacity-50 cursor-not-allowed`
      : `${colors.bg} ${colors.text} ${colors.hover} cursor-pointer`
  }

  return (
    <div className={className}>
      {/* タグ入力フィールド */}
      <div className="mb-4">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          タグ
        </label>
        <input
          type="text"
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="block w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base touch-manipulation"
          placeholder="カンマ区切りで入力（例：家族,思い出,2025）"
        />
        <p className="mt-1 text-xs text-gray-500">
          プライマリタグ（元カテゴリ）とセカンダリタグを組み合わせて使用できます
        </p>
      </div>

      {/* 選択されたタグの表示 */}
      {selectedTags.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">選択中のタグ</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag, index) => {
              const color = getTagColor(tag)
              const isSelected = true
              return (
                <span
                  key={index}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getColorClasses(color, isSelected)}`}
                >
                  {isPrimaryTag(tag) ? (
                    <span className="flex items-center">
                      <span className="mr-1">
                        {PRIMARY_TAGS.find(pt => pt.value === tag)?.label.split(' ')[0]}
                      </span>
                      {tag}
                    </span>
                  ) : (
                    `#${tag}`
                  )}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-current hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* プライマリタグ選択 */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          💡 プライマリタグ（メインカテゴリ）
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRIMARY_TAGS.map((primaryTag) => {
            const isSelected = selectedTags.includes(primaryTag.value)
            return (
              <button
                key={primaryTag.value}
                type="button"
                onClick={() => addTag(primaryTag.value)}
                disabled={isSelected}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors touch-manipulation min-h-[36px] ${getColorClasses(primaryTag.color, isSelected)}`}
              >
                {primaryTag.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* セカンダリタグサジェスト */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          🏷️ よく使われるタグ
        </p>
        <div className="flex flex-wrap gap-2">
          {/* 過去に使用したタグを優先表示 */}
          {usedTags.slice(0, 6).map((tag) => {
            const isSelected = selectedTags.includes(tag)
            const isPrimary = isPrimaryTag(tag)
            if (isPrimary) return null // プライマリタグは上のセクションで表示
            
            return (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                disabled={isSelected}
                className={`px-3 py-1 text-sm rounded-full transition-colors touch-manipulation ${
                  isSelected
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                }`}
              >
                #{tag}
              </button>
            )
          })}
          
          {/* サジェストタグ */}
          {SUGGESTED_TAGS.filter(tag => 
            !usedTags.includes(tag) && !isPrimaryTag(tag)
          ).slice(0, 8).map((tag) => {
            const isSelected = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                disabled={isSelected}
                className={`px-3 py-1 text-sm rounded-full transition-colors touch-manipulation ${
                  isSelected
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                }`}
              >
                #{tag}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}