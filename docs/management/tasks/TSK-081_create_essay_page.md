### 作業指示書: TSK-081 エッセイ一覧ページの作成とサイドバーへのリンク追加

**担当:** Claude Code

**概要:**
ユーザーからのフィードバックに基づき、「エッセイ」タグを持つ記事を一覧表示する専用ページを作成し、サイドバーからアクセスできるようにします。

---

#### **タスク1: エッセイ一覧ページの作成**

**目的:**
URL `/essays` でアクセス可能な、エッセイ記事専用の一覧ページを作成する。

**具体的な指示:**

1.  `src/app/essays` ディレクトリを新規に作成してください。
2.  既存のタグ別一覧ページ `src/app/tags/[tag]/page.tsx` の内容をコピーし、新しいファイル `src/app/essays/page.tsx` として保存してください。
3.  `src/app/essays/page.tsx` を以下のように修正してください。
    *   URLパラメータからタグ名を取得している部分を削除します。
        *   `const params = useParams()` と `const tag = params.tag ...` の行を削除します。
    *   代わりに、タグ名を 'エッセイ' にハードコードします。
        *   `const tag = 'エッセイ'` という行を追加します。
    *   `useEffect` の依存配列から `tag` を削除し、コンポーネントのマウント時に一度だけ記事を取得するようにします。
    *   ページのタイトルを `<h1>🏷️ タグ: <span class="text-primary">{tag}</span></h1>` から `<h1>📝 エッセイ一覧</h1>` に変更します。
    *   エラー時の再試行ボタンの処理 (`onClick={() => fetchArticlesByTag(tag)}`) も、引数なしで呼び出せるように修正します。

**変更後 (src/app/essays/page.tsx のイメージ):**
```tsx
'use client'

import { useState, useEffect } from 'react'
// useParamsは不要なので削除
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Link from 'next/link'

// ... (Articleインターフェースはそのまま) ...

export default function EssayPage() { // コンポーネント名を変更
  const tag = 'エッセイ' // タグをハードコード
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // useEffectの依存配列を空にする
    fetchArticlesByTag(tag)
  }, [])

  const fetchArticlesByTag = async (tagName: string) => {
    // ... (既存のfetchロジックはそのまま) ...
  }

  // ... (formatDateはそのまま) ...

  // ... (ローディングとエラー表示はそのまま) ...

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <div>
            {/* タイトルを変更 */}
            <h1 className="text-3xl font-bold">📝 エッセイ一覧</h1>
            <p className="text-gray-600">{articles.length}件のエッセイが見つかりました</p>
          </div>
          <Link 
            href="/articles/new"
            className="btn btn-primary"
          >
            ✍️ 新しい記事を書く
          </Link>
        </div>

        {/* 記事一覧 */}
        {/* ... (記事一覧の表示ロジックはそのまま) ... */}
      </div>
    </AuthenticatedLayout>
  )
}
```

---

#### **タスク2: サイドバーへのリンク追加**

**目的:**
サイドバーに「エッセイ」メニューを追加し、`/essays` ページへリンクする。

**対象ファイル:**
`src/components/Sidebar.tsx`

**具体的な指示:**

1.  `🔍 発見とメモ` セクション内にある `ul` メニューを探します。
2.  現在プレースホルダーとなっている `<li><a>📝 エッセイ</a></li>` の部分を、`/essays` にナビゲートする機能を持つように修正してください。
3.  他のメニュー項目とスタイルを合わせ、`handleNavigation('/essays')` を呼び出す `<button>` 要素に変更するのが望ましいです。

**変更前 (抜粋):**
```tsx
// src/components/Sidebar.tsx

// ... (中略) ...
          <li>
            <a className="hover:bg-primary-light hover:text-primary-dark transition-colors">
              📝 エッセイ
            </a>
          </li>
        </ul>
      </div>
// ... (中略) ...
```

**変更後 (イメージ):**
```tsx
// src/components/Sidebar.tsx

// ... (中略) ...
          <li>
            <button
              onClick={() => handleNavigation('/essays')}
              className="w-full flex items-center text-left hover:bg-primary-light hover:text-primary-dark transition-colors"
            >
              📝 エッセイ
            </button>
          </li>
        </ul>
      </div>
// ... (中略) ...
```
