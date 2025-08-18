# Next.js関連 知見集

## 2025年8月18日: VPS初回デプロイ(TSK-043)からの知見

### a. Next.jsビルド関連の問題

- **Google Fontsのタイムアウト**
    - **症状:** `next build` 中にGoogle Fontsのダウンロードでタイムアウトし、ビルドが失敗する。
    - **対策1:** `next.config.js` に `optimizeFonts: false` を追加し、フォント最適化を無効化する。
    - **対策2:** 対策1でも解決しない場合、問題となっている特定のWebフォント(`Shippori_Mincho_B1`など)の読み込みを `src/app/layout.tsx` から削除し、代替のフォントで対応する。

- **動的レンダリングページのビルド時エラー**
    - **症状:** `useSearchParams()` のようなクライアントサイドでのみ利用可能なフックを含むサーバーコンポーネントが、ビルド時に静的生成されようとしてエラーになる。
    - **対策:** 対象となるページのファイル(`src/app/search/page.tsx`など)で、`export const dynamic = 'force-dynamic'` をエクスポートし、常に動的レンダリングされるように指定する。また、`useSearchParams` を使用するコンポーネントを`Suspense`でラップする。

- **ビルド時のAPIルート実行**
    - **症状:** ヘルスチェック用APIルート(`src/app/api/health/route.ts`など)がビルド時に実行され、DB接続エラーなどを引き起こす。
    - **対策:** 対象となるAPIルートのファイルで `export const dynamic = 'force-dynamic'` をエクスポートし、ビルド時の実行を抑制する。

## 2025年8月17日: ビルドエラー修正と環境整備の知見

### 解決した問題と対応策

1.  **TypeScriptパス設定の修正**:
    *   **問題**: `tsconfig.json` の `@/*` パスが "./*" となっており、`@/components/PasswordGate` などのインポートエラーが発生していた。
    *   **対応策**: `@/*` パスを "./src/*" に修正。

2.  **Layout構成の修正**:
    *   **問題**: `src/app/layout.tsx` の構成が不適切で、`useSession` エラーが発生していた。
    *   **対応策**: `src/app/layout.tsx` を `Providers` コンポーネントでラップし、`SessionProvider` を追加。

3.  **NextAuth API設定**:
    *   **問題**: NextAuth の基本APIエンドポイントが未設定。
    *   **対応策**: `src/app/api/auth/[...nextauth]/route.ts` を作成し、NextAuth の基本APIエンドポイントを設定。

## 2025年8月18日: 記事一覧表示の失敗原因調査と修正 (TSK-049) からの知見

### 環境変数 `NODE_ENV` の参照問題
- **問題:** `AuthContext.tsx` 内で `process.env.NODE_ENV` を直接参照した際に、`undefined` となる場合があった。
- **原因:** Next.jsの環境変数は、ビルド時に静的に埋め込まれるため、クライアントサイドのコードで `process.env.NODE_ENV` を直接参照すると `undefined` になることがある。
- **解決策:** クライアントサイドで環境変数にアクセスする必要がある場合は、`next.config.js` や `NEXT_PUBLIC_` プレフィックスを利用して正しく公開する必要がある。今回は `process.env.NEXT_PUBLIC_SKIP_AUTH` の値のみに依存するようにロジックを簡素化した。
- **教訓:** Next.jsアプリケーション内で環境変数を扱う際は、`NEXT_PUBLIC_` プレフィックスの有無や、サーバーサイド/クライアントサイド、ビルド時/実行時のライフサイクルを考慮し、適切な方法で参照する必要がある。

## 2025年8月17日: NextAuth認証システム復旧作業の知見より

### 500 Internal Server Error
*   **症状**: 静的ファイル（JavaScriptチャンク）が見つからない
*   **原因**: `next.config.js` の `output: 'standalone'` 設定が開発環境で問題を引き起こす
*   **対応策**: `next.config.js` の `output: 'standalone'` を開発環境用にコメントアウト。

