# タスク詳細: TSK-013

**ID**: `TSK-013`
**タイトル**: ルートレイアウトの再構築
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

アプリケーション全体の共通レイアウトを旧プロジェクトの構成に合わせて再構築する。これにより、フォント設定、グローバルCSSの適用、認証プロバイダーのラッピングなど、サイト全体の基盤を確立する。

## 2. 手順

`/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/layout.tsx` ファイルを以下の内容で**完全に上書き**してください。

```typescript
import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho_B1 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const shipporiminchoB1 = Shippori_Mincho_B1({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "うちのきろく",
  description: "家族のアーカイブサイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-theme="uchinokiroku">
      <body
        className={`${notoSansJP.variable} ${shipporiminchoB1.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

## 3. 完了の定義

*   `src/app/layout.tsx` が上記内容で更新されていること。

## 4. 検証方法

PMがファイル内容を読み取り、意図通りに更新されていることを確認する。
