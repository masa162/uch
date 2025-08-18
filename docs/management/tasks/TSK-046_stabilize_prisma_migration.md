# TSK-046: 本番環境でのPrismaマイグレーション安定化

## 1. タスク概要

TSK-043のデプロイ作業において、`start-with-env.sh` スクリプトによるデータベースの自動初期化（`npx prisma db push`）が失敗し、手動でのテーブル作成（`CREATE TABLE`）という暫定対応を取った。
このままでは将来のスキーマ変更時に手作業が必要となり、運用上のリスクとなる。本タスクでは、この問題を根本的に解決し、デプロイ時にPrismaによるデータベーススキーマの適用が自動で安定して行われるようにすることを目的とする。

## 2. 背景

- **関連タスク**: TSK-043_vps_initial_deployment.md
- **問題**: `app`コンテナの起動スクリプト内で実行される`npx prisma db push`が、DB接続エラー等で失敗する。
- **暫定対応**: `docker compose exec db psql` を使って手動でテーブルを作成した。
- **リスク**: スキーマの変更追従が手動となり、デプロイの自動化が阻害され、ヒューマンエラーの温床となる。

## 3. 作業内容

1.  **問題の再現と詳細なログ分析**:
    -   まず、現在のデータベースボリュームをバックアップまたは削除し、クリーンな状態で問題を再現できる環境を整える。
        ```bash
        # VPSにSSH接続後
        cd /root/uch
        docker compose down -v # -vオプションでボリュームも削除
        ```
    -   再度コンテナを起動し、`app`コンテナのログを詳細に監視して、`prisma db push`が失敗する際の正確なエラーメッセージを捕捉する。
        ```bash
        docker compose up --build -d app
        docker compose logs -f app
        ```

2.  **原因の調査**:
    -   エラーメッセージに基づき、根本原因を特定する。考えられる主な原因は以下の通り。
        -   **DBの起動遅延**: `app`コンテナがDBコンテナより先に起動し、DBが接続を受け付ける準備が整う前にPrismaコマンドが実行されてしまう。
        -   **環境変数の解決不全**: `app`コンテナ内で`DATABASE_URL`が正しく解決できていない。
        -   **ネットワークの問題**: Dockerの内部ネットワークで、`app`から`db`への名前解決ができていない。

3.  **対策の実施**:
    -   原因に応じて、以下の対策を単独または組み合わせて実施する。
    -   **対策A: `docker-compose.yml`の起動順序制御の強化**:
        -   `app`サービスの`depends_on`に、`db`サービスの`healthcheck`が正常になるまで待機する条件を追加する。これにより、DBが完全に利用可能になってから`app`コンテナが起動するようになる。
            ```yaml
            # docker-compose.yml の app サービス内
            depends_on:
              db:
                condition: service_healthy
            ```
    -   **対策B: 起動スクリプトの堅牢化**:
        -   `start-with-env.sh`に、DB接続のリトライロジックを組み込む。例えば、接続に失敗した場合に数秒待ってから再試行するループ処理を追加する。
            ```sh
            # start-with-env.sh の例
            echo "Waiting for database to be ready..."
            # ここにDB接続を試みるループ処理を実装

            echo "Syncing database schema..."
            npx prisma db push --skip-generate
            ```

4.  **検証**:
    -   対策を適用後、再度クリーンな状態（`docker compose down -v`）からデプロイを実行する。
    -   `docker compose up --build -d`を実行するだけで、`app`コンテナがエラーなく起動し、`prisma db push`が成功裏に完了することを確認する。
    -   `docker compose exec db psql`でDBに接続し、テーブルが正しく作成されていることを確認する。

## 4. 完了条件

-   `docker-compose.yml`または起動スクリプトが修正され、Prismaのマイグレーションが安定して自動実行されること。
-   `docker compose down -v` 後に `docker compose up --build` を実行するだけで、データベーススキーマが自動的に適用され、アプリケーションが正常に起動すること。
