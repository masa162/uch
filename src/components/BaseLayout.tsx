'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import MobileMenu from './MobileMenu'

interface BaseLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function BaseLayout({ 
  children, 
  showSidebar = true 
}: BaseLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Mobile hamburger button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-base-100 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          aria-label="メニューを開く"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Desktop layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row gap-8">
          {/* Desktop sidebar */}
          <Sidebar />
          
          {/* Main content */}
          <main className="w-full lg:w-3/4 pt-16 lg:pt-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}