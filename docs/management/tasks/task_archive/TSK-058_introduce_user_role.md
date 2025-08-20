# タスク詳細: TSK-058

**ID**: `TSK-058`
**タイトル**: 【DB】ユーザーモデルへの役割(Role)概念の導入
**ステータス**: 未着手
**優先度**: 最高
**担当者**: Claude Code

## 1. タスクの目的

ゲストログイン機能の実装に向けた第一歩として、データベースの`User`モデルに「役割（Role）」の概念を導入する。これにより、システムがユーザーの種類（一般ユーザー、管理者、ゲストなど）を識別できるようになる。

## 2. 背景

現状の`User`モデルには、ユーザーの種類を区別する仕組みがない。ゲスト機能を安全に実装するためには、データベースレベルで権限の基礎となる役割を定義する必要がある。

## 3. 具体的な作業内容

### 3.1. `prisma/schema.prisma` の編集

以下の2点の変更を `prisma/schema.prisma` ファイルに適用する。

1.  **`Role` enumの追加**: ファイルの末尾に、ユーザーの役割を定義する`enum`を追加する。
    ```prisma
    enum Role {
      USER
      ADMIN
      GUEST
    }
    ```

2.  **`User`モデルへの`role`フィールド追加**: `User`モデル内に、`role`フィールドを追加する。デフォルト値は`USER`とする。
    ```prisma
    model User {
      // ... 既存のフィールド
      createdAt     DateTime  @default(now())
      role          Role      @default(USER) // この行を追記
      accounts      Account[]
      // ... 既存のフィールド
    }
    ```

### 3.2. データベースマイグレーションの実行

スキーマの変更をデータベースに適用するため、プロジェクトのルートディレクトリで以下のコマンドを実行する。

```bash
npx prisma migrate dev --name add_user_role
```

## 4. 完了の定義

*   `prisma/schema.prisma` に `Role` enum と `User.role` フィールドが追加されていること。
*   `npx prisma migrate dev` コマンドが正常に完了し、`prisma/migrations/` ディレクトリ内に `..._add_user_role` という名前の新しいマイグレーションフォルダが作成されていること。
*   開発用データベースの `users` テーブルに `role` カラムが追加されていること。

## 5. 検証方法

PMが`git status`およびデータベースのテーブル構造を確認し、変更が意図通りに適用されていることを検証する。
