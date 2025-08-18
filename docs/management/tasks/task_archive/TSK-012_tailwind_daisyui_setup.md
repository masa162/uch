# タスク詳細: TSK-012

**ID**: `TSK-012`
**タイトル**: Tailwind CSSとDaisyUIの設定
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

旧プロジェクトで利用されていたTailwind CSSのカスタム設定とDaisyUIを新プロジェクトに導入し、UIの基盤を確立する。

## 2. 手順

### 2.1. ライブラリのインストール

プロジェクトのルートディレクトリで以下のコマンドを実行し、必要なライブラリをインストールしてください。

```bash
npm install -D daisyui @tailwindcss/typography
```

### 2.2. `tailwind.config.js` の設定

`/Users/nakayamamasayuki/Documents/GitHub/uch/tailwind.config.js` ファイルを以下の内容で**完全に上書き**してください。

```javascript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#d6eadd',   // 明るい若草色
          DEFAULT: '#7cbf8c', // ベースグリーン
          dark: '#4b8158',    // 深みのある緑
        },
        accent: {
          yellow: '#f3eac2',  // 柔らかな黄色（光）
          brown: '#9d856a',   // 木の幹や土の色（アクセント）
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Shippori Mincho B1"', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        uchinokiroku: {
          "primary": "#7cbf8c",
          "secondary": "#f3eac2", 
          "accent": "#9d856a",
          "neutral": "#2a2e37",
          "base-100": "#ffffff",
          "base-200": "#f7f8fa",
          "base-300": "#d6eadd",
          "info": "#3abff8",
          "success": "#7cbf8c",
          "warning": "#fbbd23",
          "error": "#f87272",
        }
      },
      {
        dark: {
          "primary": "#7cbf8c",
          "secondary": "#f3eac2", 
          "accent": "#9d856a",
          "neutral": "#1f2937",
          "base-100": "#111827",
          "base-200": "#1f2937",
          "base-300": "#374151",
          "info": "#3abff8",
          "success": "#7cbf8c",
          "warning": "#fbbd23",
          "error": "#f87272",
        }
      }
    ],
    base: true,
    styled: true,
    utils: true,
  },
}
export default config
```

### 2.3. `globals.css` の設定

`/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/globals.css` ファイルを以下の内容で**完全に上書き**してください。

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: #f9fafb;
  color: #1f2937;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

/* Typography for prose content */
.prose {
  max-width: none;
}

.prose img {
  margin: 1rem auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Fix line-clamp utilities if needed */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
```

## 3. 完了の定義

*   必要なライブラリがインストールされていること。
*   `tailwind.config.js` が上記内容で更新されていること。
*   `src/app/globals.css` が上記内容で更新されていること。

## 4. 検証方法

PMがファイル内容を読み取り、意図通りに更新されていることを確認する。
