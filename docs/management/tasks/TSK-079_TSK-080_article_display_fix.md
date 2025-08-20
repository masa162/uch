### 作業指示書: TSK-079 & TSK-080 フロントエンド改修

**担当:** Claude Code

**概要:**
ユーザーからのフィードバックに基づき、トップページと記事一覧ページの表示を改善します。

---

#### **タスク1: TSK-079 トップページに最新記事を3件表示**

**目的:**
トップページに「最近の記事」セクションを設け、最新の記事を3件表示する。

**対象ファイル:**
`src/app/page.tsx`

**具体的な指示:**

1.  現在静的に「まだ記事がありません」と表示されているロジックを、APIから動的に記事を取得して表示するように変更してください。
2.  ファイル下部にコメントアウトされている既存のロジックを参考に、`useState` と `useEffect` を用いて記事データを管理します。
3.  コンポーネントのマウント時に、APIエンドポイント `/api/articles?limit=3` を `fetch` してください。
4.  取得した記事データを `recentArticles` のようなstateに格納します。
5.  取得したデータを元に、記事のリストをレンダリングしてください。各記事はタイトル、著者名、公開日を含むカード形式で表示し、クリックすると記事詳細ページ (`/articles/[slug]`) に遷移するようにします。
6.  以下の3つの状態を考慮したUIを実装してください。
    *   **ローディング中:** スピナーなどを表示します。
    *   **エラー発生時:** エラーメッセージを表示します。
    *   **記事が0件の場合:** 「まだ記事がありません」というメッセージと、「最初の記事を書く」ボタンを表示します。

**変更前 (抜粋):**
```tsx
// src/app/page.tsx

// ... imports ...

export default function HomePage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        // ... (中略) ...
        
        {/* 最近の記事セクション */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">最近の記事</h2>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">まだ記事がありません</p>
            <Link href="/articles/new" className="btn btn-primary">
              最初の記事を書く
            </Link>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

// ... (コメントアウトされたコード) ...
```

**変更後 (イメージ):**
```tsx
// src/app/page.tsx

'use client'

import { useState, useEffect } from 'react'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'

// ... (Articleインターフェース定義) ...

export default function HomePage() {
  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // ... (fetch処理) ...
  }, [])

  // ... (formatDate関数) ...

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        // ... (中略) ...
        
        {/* 最近の記事セクション */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">最近の記事</h2>
          {loading ? (
            // ... ローディングUI ...
          ) : error ? (
            // ... エラーUI ...
          ) : recentArticles.length === 0 ? (
            // ... 記事0件のUI ...
          ) : (
            // ... 記事リストのレンダリング ...
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
```

---

#### **タスク2: TSK-080 記事一覧にアイキャッチ画像を表示 (フォールバック付き)**

**目的:**
記事一覧ページで、各記事にアイキャッチ画像を表示する。記事に画像が設定されていない場合は、デフォルトのOGP画像を代わりに表示する。

**対象ファイル:**
`src/app/articles/page.tsx`

**具体的な指示:**

1.  記事一覧をマッピングしている箇所 (`articles.map(...)`) を見つけます。
2.  `article.heroImageUrl` が存在するかどうかを判定する部分を修正します。
3.  `article.heroImageUrl` が存在する場合はその画像を表示し、存在しない (`null` または `undefined` の) 場合は、デフォルトのOGP画像 `/images/ogp/ogp.png` を表示するようにしてください。

**変更前 (抜粋):**
```tsx
// src/app/articles/page.tsx

// ... (中略) ...
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        // ... (タイトルなど) ...
                      </div>
                      {article.heroImageUrl && (
                        <div className="ml-4">
                          <img 
                            src={article.heroImageUrl} 
                            alt={article.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
// ... (中略) ...
```

**変更後 (イメージ):**
```tsx
// src/app/articles/page.tsx

// ... (中略) ...
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        // ... (タイトルなど) ...
                      </div>
                      <div className="ml-4">
                        <img 
                          src={article.heroImageUrl || '/images/ogp/ogp.png'} 
                          alt={article.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    </div>
// ... (中略) ...
```
