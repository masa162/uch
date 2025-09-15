'use client'

import { createContext, useContext } from 'react'
import { useCustomAuth } from '@/hooks/useCustomAuth'

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
  checkNameSetup: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useCustomAuth()

  return (
    <AuthContext.Provider value={auth}>
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
