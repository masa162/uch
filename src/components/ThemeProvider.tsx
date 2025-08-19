'use client'

import { useEffect, useState } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'uchinokiroku' | 'dark'>('uchinokiroku')

  useEffect(() => {
    // システムのダークモード設定を確認
    const checkTheme = () => {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        setTheme('uchinokiroku')
        document.documentElement.setAttribute('data-theme', 'uchinokiroku')
      }
    }

    // 初期設定
    checkTheme()

    // システム設定の変更を監視
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setTheme('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        setTheme('uchinokiroku')
        document.documentElement.setAttribute('data-theme', 'uchinokiroku')
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return <>{children}</>
}