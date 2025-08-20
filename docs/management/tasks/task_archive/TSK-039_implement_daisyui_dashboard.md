# 作業指示書: TSK-039

**件名:** daisyUIテーマの導入と認証後ダッシュボードUIの再現

## 1. タスク概要

- **タスクID:** TSK-039
- **担当者:** Claude Code
- **優先度:** 最高
- **関連ドキュメント:**
    - `docs/仕様書/レイアウト関連仕様書.md` (最重要・正典)
    - `docs/継承用資料/UIUX/参考スクショ/` (完成イメージ)

## 2. 背景・目的

現在、ローカル環境で `daisyUI` ベースのレイアウトが正しく適用されていない問題を解決し、`レイアウト関連仕様書.md` および参考スクリーンショットで示された、美しく機能的な認証後ダッシュボードUIを完全に再現することを目的とする。

このタスクは、プロジェクトのUI/UXの根幹をなすため、最優先で取り組むこと。

## 3. 作業手順 (チェックリスト)

以下の手順を上から順に、正確に実行してください。設定ファイルは、**`レイアウト関連仕様書.md` に記載されているコードをそのままコピー＆ペーストすること**を推奨します。

### ☐ Step 1: 依存関係の確認

1.  プロジェクトのルートで `package.json` ファイルを開く。
2.  `devDependencies` の中に `"daisyui": "^..."` の記述があるか確認する。
3.  もし存在しない場合は、以下のコマンドを実行してインストールする。
    ```bash
    npm install -D daisyui
    ```

### ☐ Step 2: `tailwind.config.ts` の設定

1.  `tailwind.config.ts` を開く。
2.  ファイルの内容を、`レイアウト関連仕様書.md` の「TailwindCSS設定」セクションに記載されているコードで完全に置き換える。
    - **確認ポイント:** `plugins` に `require('daisyui')` があるか。`daisyui.themes` にカスタムテーマ `uchinokiroku` が定義されているか。

### ☐ Step 3: `postcss.config.js` の設定

1.  `postcss.config.js` を開く。
2.  ファイルの内容を、`レイアウト関連仕様書.md` の「PostCSS設定」セクションに記載されているコードで完全に置き換える。
    - **確認ポイント:** `plugins` が `{'@tailwindcss/postcss': {}}` となっているか。

### ☐ Step 4: `globals.css` の設定

1.  `src/app/globals.css` を開く。
2.  ファイルの内容を、`レイアウト関連仕様書.md` の「Next.js Layout実装」セクションに記載されている `globals.css` のコードで完全に置き換える。
    - **確認ポイント:** `@tailwind` ディレクティブが正しく記述されているか。

### ☐ Step 5: `layout.tsx` の設定

1.  `src/app/layout.tsx` を開く。
2.  ファイルの内容を、`レイアウト関連仕様書.md` の「Next.js Layout実装」セクションに記載されている `layout.tsx` のコードで完全に置き換える。
    - **確認ポイント:** `<html>` タグに `data-theme="uchinokiroku"` が設定されているか。

### ☐ Step 6: 認証後レイアウトの構築

1.  `src/components/AuthenticatedLayout.tsx` を開く（なければ新規作成）。
2.  ファイルの内容を、`レイアウト関連仕様書.md` の「AuthenticatedLayout コンポーネント」および「Sidebar コンポーネント」の仕様を参考に、以下のように構築する。

    ```tsx
    import Sidebar from './Sidebar';

    type AuthenticatedLayoutProps = {
      children: React.ReactNode;
    };

    export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
      return (
        <div className="min-h-screen bg-base-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              <aside className="w-full md:w-1/4">
                <Sidebar />
              </aside>
              <main className="w-full md:w-3/4">
                {children}
              </main>
            </div>
          </div>
        </div>
      );
    }
    ```

### ☐ Step 7: サイドバーの構築

1.  `src/components/Sidebar.tsx` を開く（なければ新規作成）。
2.  参考スクリーンショットと仕様書を元に、ナビゲーション項目を実装する。

    ```tsx
    // 仮実装の例
    export default function Sidebar() {
      return (
        <div className="card bg-base-100 shadow-xl p-6 space-y-4">
          <div className="form-control">
            <input type="text" placeholder="記事を検索..." className="input input-bordered" />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold">発見とメモ</h3>
            <ul className="menu">
              <li><a>タグ一覧</a></li>
              <li><a>月別アーカイブ</a></li>
              <li><a>エッセイ</a></li>
            </ul>
          </div>
        </div>
      );
    }
    ```

### ☐ Step 8: トップページ(`page.tsx`)の再構築

1.  `src/app/page.tsx` を開く。
2.  ファイルの内容を、参考スクリーンショットのメインコンテンツ部分を再現するように、以下のように書き換える。

    ```tsx
    import AuthenticatedLayout from '@/components/AuthenticatedLayout';

    export default function HomePage() {
      return (
        <AuthenticatedLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">おかえりなさい 🏠</h1>
              <p className="text-gray-600">今日も家族の大切な思い出を、やさしく残していきましょう 💝</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 記事一覧カード */}
              <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer">
                <div className="card-body">
                  <h2 className="card-title">📚 記事一覧</h2>
                  <p>みんなの思い出を見る</p>
                </div>
              </div>
              {/* 新しい記事カード */}
              <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer border-2 border-primary">
                <div className="card-body">
                  <h2 className="card-title">✍️ 新しい記事</h2>
                  <p>新しい思い出を書く</p>
                </div>
              </div>
              {/* プロフィールカード */}
              <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer">
                <div className="card-body">
                  <h2 className="card-title">👤 プロフィール</h2>
                  <p>あなたについて教えてください</p>
                </div>
              </div>
            </div>
          </div>
        </AuthenticatedLayout>
      );
    }
    ```

## 4. 検証方法

1.  ローカル開発サーバーを起動 (`npm run dev`) し、`http://localhost:3000` にアクセスする。
2.  表示される画面が、提供された参考スクリーンショットと一致することを確認する。
3.  カードのホバーエフェクト（影が濃くなる、枠線が光るなど）が仕様書通りに動作することを確認する。
4.  ブラウザの開発者ツールでウィンドウ幅を変更し、モバイルサイズ（幅768px未満）でサイドバーがメインコンテンツの下に移動するなど、レスポンシブレイアウトが正しく機能することを確認する。

以上で作業は完了です。不明点があれば、PMまで確認してください。
