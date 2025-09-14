'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-30"
        onClick={onClose}
      />
      
      {/* サイドバー（モバイル時は左からスライドイン） */}
      <div className="fixed top-0 left-0 h-full w-80 bg-base-200 z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        <div className="h-full">
          {/* 閉じるボタン */}
          <div className="sticky top-0 bg-base-200 p-4 border-b border-base-300">
            <button
              onClick={onClose}
              className="ml-auto flex p-2 hover:bg-base-300 rounded-full transition-colors"
              aria-label="メニューを閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* サイドバーコンテンツ */}
          <div className="p-4">
            <Sidebar onNavigate={onClose} />
          </div>
        </div>
      </div>
    </>
  )
}