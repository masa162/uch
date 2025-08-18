'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const router = useRouter()
  
  useEffect(() => {
    // 新しいサインインページにリダイレクト
    router.push('/auth/signin')
  }, [router])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <p>ログインページに移動中...</p>
      </div>
    </div>
  )
}