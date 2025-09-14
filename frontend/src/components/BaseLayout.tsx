'use client'

import { ReactNode } from 'react'

interface BaseLayoutProps {
  children: ReactNode
  className?: string
}

export function BaseLayout({ children, className = '' }: BaseLayoutProps) {
  return (
    <div className={`min-h-screen bg-base-100 ${className}`}>
      <main className="container mx-auto px-4">
        {children}
      </main>
    </div>
  )
}