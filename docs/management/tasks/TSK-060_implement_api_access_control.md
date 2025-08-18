# タスク詳細: TSK-060

**ID**: `TSK-060`
**タイトル**: 【Backend】APIアクセス制御の実装
**ステータス**: 未着手
**優先度**: 最高
**担当者**: Claude Code
**関連タスク**: TSK-059

## 1. タスクの目的

ゲストユーザーが、閲覧以外の操作（記事の作成・更新・削除、コメント投稿、いいねなど）を実行できないように、すべての書き込み系APIエンドポイントに厳格なアクセス制御を実装する。これにより、システムのセキュリティとデータの整合性を確保する。

## 2. 背景

`TSK-059`でゲストとしてログインできるようになったが、現状ではAPIレベルでの権限チェックが存在しないため、ゲストユーザーが不正なデータ書き込みを行えてしまう可能性がある。これを防ぐため、サーバーサイドで確実なアクセス制御を行う必要がある。

## 3. 具体的な作業内容

### 3.1. 書き込み系APIの特定

以下の（ただしこれらに限定されない）データ作成・更新・削除を行うAPIエンドポイントをすべて特定する。

*   `POST /api/articles` (記事作成)
*   `PUT /api/articles/[slug]` (記事更新)
*   `DELETE /api/articles/[slug]` (記事削除)
*   `POST /api/articles/[slug]/comments` (コメント投稿)
*   `POST /api/articles/[slug]/like` (いいね登録)
*   `DELETE /api/articles/[slug]/like` (いいね削除)
*   `POST /api/upload` (画像アップロード)

### 3.2. アクセス制御ロジックの実装

特定したすべてのAPIファイルの処理の冒頭で、以下の権限チェックロジックを追加する。

```typescript
// 各APIファイルの冒頭部分
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';

// ...関数定義の中
const session = await getServerSession(authOptions);

// 権限チェック
if (!session || session.user.role === Role.GUEST) {
  return new Response(JSON.stringify({ message: '権限がありません' }), {
    status: 403, // Forbidden
    headers: { 'Content-Type': 'application/json' },
  });
}

// ログインはしているが、ゲストではない場合でも、
// 自分以外のリソースを操作できないように所有者チェックも必要
// (これは既存のロジックでカバーされているはずだが、改めて確認すること)

// ...以降、本来のAPI処理
```

**注意**: `!session` のチェックは既存のAPIにもあるはずだが、`session.user.role === Role.GUEST` の条件を追加することが本タスクの主目的である。

## 4. 完了の定義

*   すべての書き込み系APIに、`GUEST`ロールを弾くための権限チェックロジックが追加されていること。

## 5. 検証方法

PMがコードレビューを行い、すべての対象APIに変更が適用されていることを確認する。また、開発ツール（Postmanやcurlなど）を使い、ゲストとして取得した認証トークンを用いて書き込み系APIを直接呼び出し、403 Forbiddenエラーが返ってくることを確認する。
