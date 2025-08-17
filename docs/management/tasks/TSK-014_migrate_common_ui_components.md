# タスク詳細: TSK-014

**ID**: `TSK-014`
**タイトル**: 共通UIコンポーネントの移植
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

認証フローや共通レイアウトに必要な主要UIコンポーネントを旧プロジェクトから移植し、アプリケーションの基本的なユーザーインターフェースを構築する。

## 2. 手順

以下のファイルを、`/Users/nakayamamasayuki/Documents/GitHub/uch/src/components/` ディレクトリに新規作成し、それぞれ指定された内容をコピー＆ペーストしてください。

*注意: `src/components/` ディレクトリが存在しない場合は、作成してください。*

### 2.1. `src/components/Providers.tsx`

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
```

### 2.2. `src/components/AuthenticatedLayout.tsx`

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return <>{children}</>;
  }

  return null; // Should not reach here
}
```

### 2.3. `src/components/AuthForm.tsx`

```typescript
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
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setError('ログインに失敗しました。メールアドレスまたはパスワードが間違っています。');
    } else {
      router.push('/');
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  const handleLineSignIn = async () => {
    await signIn('line', { callbackUrl: '/' });
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
        </div>
      </div>
      <div className="text-center mt-4">
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-sm text-primary hover:text-primary-dark"
        >
          {isRegistering ? 'すでにアカウントをお持ちですか？' : 'アカウントをお持ちでないですか？'}
        </button>
      </div>
    </div>
  );
}
```

### 2.4. `src/components/PasswordGate.tsx`

```typescript
'use client';

import { useState } from 'react';

interface PasswordGateProps {
  onSuccess: () => void;
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const response = await fetch('/api/check-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      onSuccess();
    } else {
      setError(data.message || 'パスワードが間違っています。');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg z-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            あいことばを入力してください 💝
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            家族だけが知っている秘密の言葉です
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">あいことば</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="あいことば"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              入室する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

## 3. 完了の定義

*   `src/components/` ディレクトリ内に上記4つのファイルが作成されていること。

## 4. 検証方法

PMがファイル内容を読み取り、意図通りに作成されていることを確認する。
