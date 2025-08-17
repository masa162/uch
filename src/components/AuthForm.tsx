'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
  password: z.string().min(6, { message: 'パスワードは6文字以上で入力してください。' }),
});

type FormData = z.infer<typeof formSchema>;

export default function AuthForm() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    
    if (isRegistering) {
      // 新規登録処理
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || '登録に失敗しました。');
          return;
        }

        // 登録成功後、自動的にログイン
        const signInResult = await signIn('credentials', {
          redirect: true,
          callbackUrl: '/',
          email: data.email,
          password: data.password,
        });
      } catch (error) {
        setError('登録に失敗しました。ネットワーク接続を確認してください。');
      }
    } else {
      // ログイン処理 - NextAuth.jsの認証フローに任せる
      await signIn('credentials', {
        redirect: true,
        callbackUrl: '/',
        email: data.email,
        password: data.password,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  const handleLineSignIn = async () => {
    await signIn('line', { callbackUrl: '/' });
  };

  const handleDevLogin = async () => {
    // 開発環境用のダミーログイン
    await signIn('credentials', {
      redirect: true,
      callbackUrl: '/',
      email: 'dev@example.com',
      password: 'password',
    });
  };

  const handleForgotPassword = async () => {
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    if (!email) {
      setError('パスワードリセットにはメールアドレスの入力が必要です。');
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'パスワードリセットに失敗しました。');
        return;
      }

      alert('パスワードリセットのメールを送信しました。メールをご確認ください。');
    } catch (error) {
      setError('パスワードリセットに失敗しました。ネットワーク接続を確認してください。');
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg z-10">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          {isRegistering ? '新規登録' : 'おかえりなさい 🏠'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {isRegistering ? 'アカウントを作成してください' : 'ログインしてください'}
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email" className="sr-only">メールアドレス</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="メールアドレス"
            {...register('email')}
          />
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="sr-only">パスワード</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="パスワード"
            {...register('password')}
          />
          {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {isRegistering ? '登録' : 'ログイン'}
          </button>
        </div>
      </form>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Googleでログイン
          </button>
          <button
            onClick={handleLineSignIn}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            LINEでログイン
          </button>
          <button
            onClick={handleDevLogin}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            開発環境でログイン
          </button>
        </div>
      </div>
      <div className="text-center mt-4 space-y-2">
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-sm text-primary hover:text-primary-dark block w-full"
        >
          {isRegistering ? 'すでにアカウントをお持ちですか？' : 'アカウントをお持ちでないですか？'}
        </button>
        {!isRegistering && (
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-gray-600 hover:text-gray-800 block w-full"
          >
            パスワードを忘れた方はこちら
          </button>
        )}
      </div>
    </div>
  );
}