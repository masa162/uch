'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

interface MarkdownPreviewProps {
  content: string
  title?: string
  description?: string
  className?: string
}

export default function MarkdownPreview({ 
  content, 
  title, 
  description, 
  className = "" 
}: MarkdownPreviewProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  return (
    <div className={`${className}`}>
      {/* プレビュー切り替えボタン */}
      <div className="flex justify-between items-center mb-4 p-3 bg-gray-100 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700">📋 プレビュー</h3>
        <button
          type="button"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            isPreviewMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isPreviewMode ? '📝 編集モード' : '👁️ プレビューモード'}
        </button>
      </div>

      {/* プレビュー表示 */}
      {isPreviewMode && (
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white">
          {/* タイトル表示 */}
          {title && (
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
          )}
          
          {/* 概要表示 */}
          {description && (
            <p className="text-gray-600 mb-6 pb-4 border-b border-gray-200">
              {description}
            </p>
          )}
          
          {/* 本文プレビュー */}
          <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                // カスタムスタイリング
                h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">{children}</h1>,
                h2: ({children}) => <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">{children}</h2>,
                h3: ({children}) => <h3 className="text-lg font-semibold text-gray-800 mt-5 mb-2">{children}</h3>,
                p: ({children}) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">{children}</ol>,
                li: ({children}) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">
                    {children}
                  </blockquote>
                ),
                code: ({children, className}) => {
                  const isInline = !className
                  return isInline ? (
                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      {children}
                    </code>
                  )
                },
                strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                em: ({children}) => <em className="italic text-gray-800">{children}</em>,
                a: ({children, href}) => (
                  <a 
                    href={href} 
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                img: ({src, alt}) => (
                  <img 
                    src={src} 
                    alt={alt} 
                    className="max-w-full h-auto rounded-lg shadow-md my-4"
                  />
                )
              }}
            >
              {content || '*内容を入力してプレビューを確認してください*'}
            </ReactMarkdown>
          </div>

          {/* プレビュー情報 */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>📝 このプレビューは実際の投稿ページでの表示に近い形になります</p>
          </div>
        </div>
      )}

      {/* プレビューモードでない時の簡易説明 */}
      {!isPreviewMode && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">👁️</div>
          <p className="text-sm">プレビューモードで記事の表示を確認できます</p>
        </div>
      )}
    </div>
  )
}