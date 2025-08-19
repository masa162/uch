'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthCallback':
        return {
          title: '認証処理エラー',
          message: '認証処理中にエラーが発生しました。',
          details: 'Google認証の処理中に問題が発生した可能性があります。もう一度お試しください。',
          action: 'サインインページに戻る'
        }
      case 'AccessDenied':
        return {
          title: 'アクセス拒否',
          message: '認証がキャンセルされました。',
          details: '認証プロセスが中断されました。必要に応じて再度お試しください。',
          action: 'サインインページに戻る'
        }
      case 'Configuration':
        return {
          title: '設定エラー',
          message: '認証システムの設定に問題があります。',
          details: 'システム管理者にお問い合わせください。',
          action: 'ホームページに戻る'
        }
      case 'Verification':
        return {
          title: '検証エラー',
          message: '認証情報の検証に失敗しました。',
          details: '入力された情報を確認して、もう一度お試しください。',
          action: 'サインインページに戻る'
        }
      default:
        return {
          title: '認証エラー',
          message: '予期しないエラーが発生しました。',
          details: 'しばらく時間をおいてから再度お試しください。',
          action: 'サインインページに戻る'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {errorInfo.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {errorInfo.message}
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">
            <p className="font-medium">詳細:</p>
            <p className="mt-1">{errorInfo.details}</p>
          </div>
        </div>

        {error === 'OAuthCallback' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="text-sm text-blue-700">
              <p className="font-medium">トラブルシューティング:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>ブラウザのキャッシュとクッキーをクリアしてください</li>
                <li>別のブラウザで試してください</li>
                <li>ネットワーク接続を確認してください</li>
                <li>しばらく時間をおいてから再度お試しください</li>
              </ul>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <Link
            href={error === 'Configuration' ? '/' : '/auth/signin'}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {errorInfo.action}
          </Link>
          
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            ホームページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
