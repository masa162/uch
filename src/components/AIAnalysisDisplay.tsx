'use client'

import { useMemo } from 'react'

interface MediaTag {
  tag: string
  confidence: number | null
  source: string
}

interface AIAnalysisDisplayProps {
  tags: MediaTag[]
  className?: string
}

export default function AIAnalysisDisplay({ tags, className = '' }: AIAnalysisDisplayProps) {
  // AIタグのみを抽出し、信頼度でソート
  const aiTags = useMemo(() => {
    return tags
      .filter(t => t.source === 'AI')
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
  }, [tags])

  // 手動タグを抽出
  const manualTags = useMemo(() => {
    return tags.filter(t => t.source === 'MANUAL')
  }, [tags])

  // 自然な文章を生成
  const generateAnalysisText = (aiTags: MediaTag[]): string => {
    if (aiTags.length === 0) {
      return 'AI執事がこの写真を分析しましたが、特定のタグは見つかりませんでした。'
    }

    const tagTexts = aiTags.map(tag => `#${tag.tag}`)
    
    // タグの数に応じて文章パターンを変更
    if (aiTags.length === 1) {
      return `AI執事は、この写真に ${tagTexts[0]} を見つけました！`
    } else if (aiTags.length === 2) {
      return `AI執事は、この写真に ${tagTexts[0]} と ${tagTexts[1]} を見つけました！`
    } else if (aiTags.length === 3) {
      return `AI執事は、この写真に ${tagTexts[0]} と ${tagTexts[1]}、そして素敵な ${tagTexts[2]} を見つけました！`
    } else {
      const firstTwo = tagTexts.slice(0, 2).join(' と ')
      const remaining = aiTags.length - 2
      return `AI執事は、この写真に ${firstTwo} をはじめ、全部で${aiTags.length}個の要素を見つけました！`
    }
  }

  // 信頼度に基づいた感想文を生成
  const generateConfidenceComment = (aiTags: MediaTag[]): string => {
    if (aiTags.length === 0) return ''
    
    const avgConfidence = aiTags.reduce((sum, tag) => sum + (tag.confidence || 0), 0) / aiTags.length
    
    if (avgConfidence >= 0.9) {
      return '分析精度がとても高く、AI執事も確信を持っています✨'
    } else if (avgConfidence >= 0.8) {
      return '高い精度で分析できました👍'
    } else if (avgConfidence >= 0.7) {
      return '良好な精度で分析しました'
    } else {
      return 'AI執事なりに頑張って分析しました'
    }
  }

  if (aiTags.length === 0 && manualTags.length === 0) {
    return null
  }

  return (
    <div className={`card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 ${className}`}>
      <div className="card-body p-4">
        {/* AIタグがある場合 */}
        {aiTags.length > 0 && (
          <div className="space-y-3">
            {/* メインメッセージ */}
            <div className="flex items-start gap-3">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  🤖
                </div>
              </div>
              <div className="flex-1">
                <p className="text-base font-medium text-base-content leading-relaxed">
                  {generateAnalysisText(aiTags)}
                </p>
                <p className="text-xs text-base-content/60 mt-1">
                  {generateConfidenceComment(aiTags)}
                </p>
              </div>
            </div>

            {/* AIタグ一覧 */}
            <div>
              <h4 className="text-sm font-semibold text-base-content/80 mb-2 flex items-center gap-1">
                <span>🔍</span>
                AI分析結果
              </h4>
              <div className="flex flex-wrap gap-2">
                {aiTags.map((tag, index) => (
                  <div
                    key={index}
                    className="badge badge-primary gap-1 px-3 py-2 text-xs"
                    title={`信頼度: ${Math.round((tag.confidence || 0) * 100)}%`}
                  >
                    <span>#{tag.tag}</span>
                    <span className="text-primary-content/70">
                      {Math.round((tag.confidence || 0) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 手動タグがある場合 */}
        {manualTags.length > 0 && (
          <div className={aiTags.length > 0 ? 'mt-4 pt-4 border-t border-base-300' : ''}>
            <h4 className="text-sm font-semibold text-base-content/80 mb-2 flex items-center gap-1">
              <span>🏷️</span>
              手動で追加されたタグ
            </h4>
            <div className="flex flex-wrap gap-2">
              {manualTags.map((tag, index) => (
                <div
                  key={index}
                  className="badge badge-outline gap-1 px-3 py-2 text-xs"
                >
                  <span>#{tag.tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* タグがない場合のメッセージ */}
        {aiTags.length === 0 && manualTags.length === 0 && (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🤖</div>
            <p className="text-base-content/60 text-sm">
              この写真にはまだタグが付いていません
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// 文章生成のヘルパー関数をエクスポート（テスト用）
export function generateTagSummary(tags: MediaTag[]): string {
  const aiTags = tags.filter(t => t.source === 'AI')
  if (aiTags.length === 0) return ''
  
  return aiTags.map(tag => tag.tag).join(', ')
}