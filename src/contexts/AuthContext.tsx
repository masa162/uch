'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'

interface User {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  username?: string
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

  // パスワード認証状態をlocalStorageから確認
  useEffect(() => {
    const isValidated = localStorage.getItem('uchi_password_validated')
    setIsPasswordValidated(isValidated === 'true')
  }, [])

  // 開発環境では認証スキップ時にダミーユーザーを設定
  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    username: session.user.username
  } : (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') ? {
    id: 'dev-user',
    email: 'dev@example.com',
    name: '開発ユーザー',
    image: null,
    username: 'devuser'
  } : null

  const loading = status === 'loading'

  const setPasswordValidated = (validated: boolean) => {
    setIsPasswordValidated(validated)
    if (validated) {
      localStorage.setItem('uchi_password_validated', 'true')
    } else {
      localStorage.removeItem('uchi_password_validated')
    }
  }

  const signOut = () => {
    // パスワード認証状態もリセット
    localStorage.removeItem('uchi_password_validated')
    setIsPasswordValidated(false)
    // NextAuth.jsのサインアウト
    nextAuthSignOut()
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