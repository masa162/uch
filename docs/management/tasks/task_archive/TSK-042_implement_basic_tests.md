# 作業指示書: TSK-042

**件名:** テスト環境の構築と基本テストの実装

## 1. タスク概要

- **タスクID:** TSK-042
- **担当者:** Claude Code
- **優先度:**  низкой (Low)
- **関連ドキュメント:**
    - `docs/仕様書/テスト戦略仕様書.md`

## 2. 目的と基本方針

`テスト戦略仕様書.md` に基づき、本プロジェクトにテスト実行環境を構築し、最重要機能に対する基本的なテストを実装することで、将来的な品質向上のための足がかりを築く。

**基本方針:**
本タスクは優先度が低いため、機能開発の合間など、リソースに余裕がある場合に実施する。完璧なカバレッジを目指すのではなく、まずはテストを実行できる環境を整え、簡単なサンプルテストを導入することを目標とする。

## 3. 作業手順

### Step 1: テストツールのインストール

単体・結合テスト用に `Jest` と `React Testing Library`、E2Eテスト用に `Playwright` を導入する。
以下のコマンドを実行し、必要な開発依存関係をインストールする。

```bash
npm install -D jest jest-environment-jsdom @types/jest ts-jest @testing-library/react @testing-library/jest-dom @playwright/test
```

### Step 2: 設定ファイルの作成

プロジェクトのルートに、各テストツールの設定ファイルを作成する。

**`jest.config.js`**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

**`jest.setup.js`** (Jestの拡張設定)
```javascript
import '@testing-library/jest-dom';
```

**`playwright.config.ts`**
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 3: `tsconfig.json` の設定

JestがTypeScriptのパスエイリアス (`@/...`) を解決できるよう、`tsconfig.json` に `paths` の設定を追加（または確認）する。

```json
{
  "compilerOptions": {
    // ...
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Step 4: 最初のテストを作成 (サンプル)

テスト環境が正しく構築できたことを確認するため、簡単なサンプルテストを作成する。

#### a. 単体テストのサンプル

- **ファイル:** `src/components/Sidebar.test.tsx` を新規作成
- **内容:**
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';

it('サイドバーが正しく表示されること', () => {
  render(<Sidebar />);
  
  // 「発見とメモ」というテキストが表示されているか確認
  expect(screen.getByText('発見とメモ')).toBeInTheDocument();
});
```

#### b. E2Eテストのサンプル

- **ディレクトリ:** `tests/e2e` を作成
- **ファイル:** `tests/e2e/homepage.spec.ts` を新規作成
- **内容:**
```typescript
import { test, expect } from '@playwright/test';

test('トップページが正常に表示されること', async ({ page }) => {
  await page.goto('/');

  // ページのタイトルに「うちのきろく」が含まれているか確認
  await expect(page).toHaveTitle(/うちのきろく/);

  // 「おかえりなさい」という見出しが表示されているか確認
  await expect(page.getByRole('heading', { name: 'おかえりなさい 🏠' })).toBeVisible();
});
```

### Step 5: テスト実行コマンドの追加

`package.json` の `scripts` に、テスト実行用のコマンドを追加する。

```json
{
  "scripts": {
    // ...
    "test": "jest",
    "test:e2e": "playwright test"
  }
}
```

## 4. 検証方法

1.  `npm run test` を実行し、単体テストが成功することを確認する。
2.  `npm run test:e2e` を実行し、E2Eテストが成功することを確認する。

## 5. 今後の進め方

このタスクが完了すると、プロジェクトにテストの基盤が整います。
今後、新しい機能を追加・修正する際には、可能な範囲で対応するテストコードを追加していくことが推奨されます。
