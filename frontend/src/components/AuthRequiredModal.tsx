
'use client'

import { useRouter } from 'next/navigation'

export default function AuthRequiredModal() {
  const router = useRouter()

  const handleGoToSignin = () => {
    const modal = document.getElementById('auth_required_modal') as HTMLDialogElement
    if (modal) {
      modal.close()
    }
    // 自前のサインインページへ誘導（そこでGoogle/LINEを選択）
    router.push('/signin')
  }

  const handleClose = () => {
    const modal = document.getElementById('auth_required_modal') as HTMLDialogElement
    if (modal) {
      modal.close()
    }
  }

  return (
    <dialog id="auth_required_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">ログインが必要です</h3>
        <p className="py-4">
          この機能を利用するには、ユーザー登録またはログインが必要です。<br />
          ゲストアカウントでは閲覧のみが可能です。
        </p>
        <div className="modal-action">
          <button 
            className="btn btn-primary" 
            onClick={handleGoToSignin}
          >
            ログイン・新規登録
          </button>
          <button 
            className="btn btn-ghost" 
            onClick={handleClose}
          >
            キャンセル
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}
