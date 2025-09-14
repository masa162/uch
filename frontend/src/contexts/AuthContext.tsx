'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

interface User {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  username?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isPasswordValidated: boolean
  setPasswordValidated: (validated: boolean) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isPasswordValidated, setIsPasswordValidated] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true)
    const isValidated = localStorage.getItem('uchi_password_validated')
    setIsPasswordValidated(isValidated === 'true')
  }, [])

  // NextAuth.jsのセッションからユーザー情報を取得
  const user = session?.user ? {
    id: session.user.id || '',
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    username: session.user.name?.toLowerCase().replace(/\s+/g, '') || '',
    role: 'USER'
  } : null

  const loading = status === 'loading'

  const setPasswordValidated = (validated: boolean) => {
    setIsPasswordValidated(validated)
    if (typeof window !== 'undefined') {
      if (validated) {
        localStorage.setItem('uchi_password_validated', 'true')
      } else {
        localStorage.removeItem('uchi_password_validated')
      }
    }
  }

  const signOut = async () => {
    // パスワード認証状態もリセット
    if (typeof window !== 'undefined') {
      localStorage.removeItem('uchi_password_validated')
    }
    setIsPasswordValidated(false)
    
    // NextAuth.jsのサインアウトを実行
    await nextAuthSignOut({ callbackUrl: '/signin' })
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isPasswordValidated,
      setPasswordValidated,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
