'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export const useAuthAction = () => {
  const { user } = useAuth()
  const router = useRouter()

  const runAuthAction = (action: () => void, requireFullAuth: boolean = true) => {
    // ユーザーが存在しない、またはゲストユーザーの場合
    if (!user || (requireFullAuth && user.role === 'GUEST')) {
      // daisyUIのモーダルIDでモーダルを表示
      const modal = document.getElementById('auth_required_modal') as HTMLDialogElement
      if (modal) {
        modal.showModal()
      } else {
        // フォールバック：アラートを表示
        if (confirm('この機能の利用にはユーザー登録が必要です。ログインページに移動しますか？')) {
          router.push('/auth/signin')
        }
      }
      return
    }

    // 権限がある場合は実際の処理を実行
    action()
  }

  const isActionAllowed = (requireFullAuth: boolean = true) => {
    return user && (!requireFullAuth || user.role !== 'GUEST')
  }

  return { runAuthAction, isActionAllowed }
}