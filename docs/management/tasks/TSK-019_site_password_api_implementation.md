# タスク詳細: TSK-019

**ID**: `TSK-019`
**タイトル**: サイトパスワード認証APIの実装
**ステータス**: 未着手
**優先度**: 高

## 1. タスクの目的

`PasswordGate`コンポーネントが利用するサイト全体のパスワード認証APIを実装する。これにより、家族専用の「あいことば」によるアクセス制限機能を提供する。

## 2. 手順

`/Users/nakayamamasayuki/Documents/GitHub/uch/src/app/api/check-password/route.ts` ファイルを新規作成し、以下の内容をコピー＆ペーストしてください。

*注意: `src/app/api/check-password/` ディレクトリが存在しない場合は、作成してください。*

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // 環境変数からパスワードを取得
    const sitePassword = process.env.NEXT_PUBLIC_SITE_PASSWORD

    if (!sitePassword) {
      console.warn('NEXT_PUBLIC_SITE_PASSWORDが設定されていません。')
      return NextResponse.json({ success: false, message: 'サイトパスワードが設定されていません。' }, { status: 500 })
    }

    if (password === sitePassword) {
      return NextResponse.json({ success: true, message: '認証成功' })
    } else {
      return NextResponse.json({ success: false, message: 'あいことばが違います。' }, { status: 401 })
    }
  } catch (error) {
    console.error('Password check API error:', error)
    return NextResponse.json({ success: false, message: 'サーバーエラーが発生しました。' }, { status: 500 })
  }
}
```

## 3. 完了の定義

*   `src/app/api/check-password/route.ts` が上記内容で作成されていること。

## 4. 検証方法

PMがファイル内容を読み取り、意図通りに作成されていることを確認する。
