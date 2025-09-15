'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  username?: string
  role?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  isPasswordValidated: boolean
}

export function useCustomAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isPasswordValidated: false
  })
  const router = useRouter()

  // セッション確認のためのAPI呼び出し
  const checkSession = useCallback(async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uch-api.belong2jazz.workers.dev'
      const response = await fetch(`${apiBase}/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json() as {
          id: string
          email?: string
          name?: string
          picture?: string
        }
        setAuthState(prev => ({
          ...prev,
          user: {
            id: userData.id || '',
            email: userData.email,
            name: userData.name,
            image: userData.picture,
            username: userData.name?.toLowerCase().replace(/\s+/g, '') || '',
            role: 'USER'
          },
          loading: false
        }))
      } else {
        setAuthState(prev => ({
          ...prev,
          user: null,
          loading: false
        }))
      }
    } catch (error) {
      console.error('Session check error:', error)
      setAuthState(prev => ({
        ...prev,
        user: null,
        loading: false
      }))
    }
  }, [])

  // パスワード認証状態の確認
  const checkPasswordValidation = useCallback(() => {
    if (typeof window !== 'undefined') {
      const isValidated = localStorage.getItem('uchi_password_validated')
      setAuthState(prev => ({
        ...prev,
        isPasswordValidated: isValidated === 'true'
      }))
    }
  }, [])

  // サインアウト
  const signOut = useCallback(async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://uch-api.belong2jazz.workers.dev'
      await fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      // ローカル状態をリセット
      setAuthState({
        user: null,
        loading: false,
        isPasswordValidated: false
      })
      
      // ローカルストレージをクリア
      if (typeof window !== 'undefined') {
        localStorage.removeItem('uchi_password_validated')
      }
      
      // サインインページにリダイレクト
      router.push('/signin')
    }
  }, [router])

  // パスワード認証状態の設定
  const setPasswordValidated = useCallback((validated: boolean) => {
    setAuthState(prev => ({
      ...prev,
      isPasswordValidated: validated
    }))
    
    if (typeof window !== 'undefined') {
      if (validated) {
        localStorage.setItem('uchi_password_validated', 'true')
      } else {
        localStorage.removeItem('uchi_password_validated')
      }
    }
  }, [])

  // 初回ロード時の処理
  useEffect(() => {
    checkSession()
    checkPasswordValidation()
  }, [checkSession, checkPasswordValidation])

  // URLパラメータで認証成功を検知
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('auth') === 'success') {
        // 認証成功時はセッションを再確認
        checkSession()
        // URLからクエリパラメータを削除
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('auth')
        window.history.replaceState({}, '', newUrl.toString())
      }
    }
  }, [checkSession])

  return {
    user: authState.user,
    loading: authState.loading,
    isPasswordValidated: authState.isPasswordValidated,
    setPasswordValidated,
    signOut,
    checkSession
  }
}
