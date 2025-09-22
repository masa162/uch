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
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
      console.log('Checking session with API:', `${apiBase}/auth/me`)
      const response = await fetch(`${apiBase}/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Session check response:', response.status, response.ok)
      if (response.ok) {
        const responseData = await response.json() as {
          ok: boolean
          user?: {
            id: string
            email?: string
            name?: string
            picture?: string
          }
        }
        console.log('Response data received:', responseData)
        
        if (responseData.ok && responseData.user) {
          const userData = responseData.user
          const newUser = {
            id: userData.id || '',
            email: userData.email,
            name: userData.name,
            image: userData.picture,
            username: userData.name?.toLowerCase().replace(/\s+/g, '') || '',
            role: 'USER'
          }
          console.log('Setting user data:', newUser)
          setAuthState(prev => ({
            ...prev,
            user: newUser,
            loading: false
          }))
          console.log('Auth state updated with user data')
        } else {
          console.log('Invalid response format or user data missing')
          setAuthState(prev => ({
            ...prev,
            user: null,
            loading: false
          }))
        }
      } else {
        console.log('Session check failed:', response.status)
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
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com'
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

  // 初回ログイン時の名前設定チェック
  const checkNameSetup = useCallback(async () => {
    if (!authState.user) return false;

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com';
      const response = await fetch(`${apiBase}/api/profile`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const profileData = await response.json() as { name?: string };
        // 名前が設定されていない、または空の場合は名前設定が必要
        return !profileData.name || profileData.name.trim().length === 0;
      }
    } catch (error) {
      console.error('Profile check error:', error);
    }
    
    return false;
  }, [authState.user])

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
        console.log('Auth success parameter detected, checking session...')
        // 認証成功時は複数回セッションを再確認（Cookie設定の遅延を考慮）
        const checkSessionMultiple = async () => {
          for (let i = 0; i < 3; i++) {
            console.log(`Session check attempt ${i + 1}/3`)
            await checkSession()
            await new Promise(resolve => setTimeout(resolve, 2000)) // 2秒待機
          }
        }
        checkSessionMultiple()
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
    authLoading: authState.loading,
    isPasswordValidated: authState.isPasswordValidated,
    setPasswordValidated,
    signOut,
    checkSession,
    checkNameSetup
  }
}
