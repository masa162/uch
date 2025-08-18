# タスク詳細: TSK-061

**ID**: `TSK-061`
**タイトル**: 【Frontend】ゲストログインUIの構築
**ステータス**: 未着手
**優先度**: 高
**担当者**: Claude Code
**関連タスク**: TSK-059

## 1. タスクの目的

ユーザーがゲストとしてアプリケーションを利用開始するためのUI（ボタン）を実装する。また、ログイン後は、自分がゲストであることを認識できるよう、ヘッダー等にその状態を表示する。

## 2. 背景

バックエンドではゲストログインの準備が整ったが、ユーザーがその機能を利用するための入り口がフロントエンドに存在しない。ユーザーをゲストセッションに導くためのUIが必要となる。

## 3. 具体的な作業内容

### 3.1. 「ゲストとして利用する」ボタンの追加

*   **対象ファイル**: ログインフォームが表示されるページ（例: `src/app/auth/signin/page.tsx` や `src/app/page.tsx` 内の認証分岐ロジック）
*   **作業内容**:
    1.  通常のログイン/新規登録ボタンと並列、またはそれに準ずる分かりやすい場所に「ゲストとして利用する」ボタンを追加する。
    2.  そのボタンの`onClick`イベントハンドラに、`TSK-059`で定義したゲスト用プロバイダーを呼び出す処理を実装する。

    ```typescript
    import { signIn } from 'next-auth/react';

    const handleGuestSignIn = async () => {
      await signIn('guest', { callbackUrl: '/' });
    };

    // ... JSXの中
    <button onClick={handleGuestSignIn}>ゲストとして利用する</button>
    ```

### 3.2. ヘッダーでのゲスト表示

*   **対象ファイル**: サイト共通のヘッダーコンポーネント（例: `src/components/Header.tsx` や `src/components/AuthenticatedLayout.tsx`）
*   **作業内容**:
    1.  `useSession`フックからセッション情報を取得する。
    2.  `session.data.user.name` を表示している箇所で、ゲストユーザーの名前（例: 「ゲストさん」）が表示されるようにする。
    3.  （オプション）ゲストユーザーの場合は、「ログアウト」ボタンの代わりに「ログイン/新規登録」ボタンを表示するなど、状態に応じたUIの出し分けを行う。

    ```typescript
    import { useSession, signOut } from 'next-auth/react';
    import Link from 'next/link';

    // ... コンポーネント内
    const { data: session } = useSession();

    // ... JSXの中
    {session ? (
      <div>
        <span>こんにちは、{session.user.name}さん</span>
        {session.user.role === 'GUEST' ? (
          <Link href="/auth/signin">ログイン/新規登録</Link>
        ) : (
          <button onClick={() => signOut()}>ログアウト</button>
        )}
      </div>
    ) : (
      <Link href="/auth/signin">ログイン</Link>
    )}
    ```

## 4. 完了の定義

*   ログインページに「ゲストとして利用する」ボタンが実装され、クリックするとゲストとしてログインできること。
*   ログイン後、ヘッダーなどの共通部分に「ゲストさん」といったユーザー名が表示されること。

## 5. 検証方法

PMがローカル環境でアプリケーションを操作し、以下の点を確認する。
1.  ログインページにゲストボタンが存在すること。
2.  ボタンをクリック後、トップページなどに遷移し、ヘッダーの表示が「ゲストさん」に変わること。
3.  ブラウザの開発者ツールでセッション情報を確認し、`role`が`GUEST`になっていること。
