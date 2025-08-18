# 作業指示書: TSK-043

**件名:** VPS本番環境への初回デプロイ準備と手動デプロイの実施

## 1. タスク概要

- **タスクID:** TSK-043
- **担当者:** Claude Code
- **優先度:** 高
- **関連タスク:** TSK-031 (テスト、デプロイ、新機能開発の計画策定)

## 2. 目的

現在ローカルで開発中のアプリケーションをVPS（Virtual Private Server）上に展開し、インターネット経由でアクセス可能な状態にすることを目的とする。まずは手動でのデプロイを成功させ、今後の自動化（CI/CD）に向けた基盤を築く。

## 3. 開発フェーズ

本タスクは、環境の調査からデプロイの実行まで、以下の4つのフェーズで段階的に進める。

---

### **Phase 1: 本番環境(VPS)の事前調査**

まず、デプロイ先となるVPSの環境を正確に把握する。

1.  SSHでVPSにログインする。
2.  以下のコマンドを実行し、結果を記録・確認する。
    ```bash
    # OS情報とカーネルバージョンの確認
    uname -a
    cat /etc/os-release

    # DockerとDocker Composeのバージョン確認
    docker --version
    docker-compose --version

    # ファイアウォールの設定確認 (ufwの場合)
    sudo ufw status
    ```
3.  Webサーバー（Nginx, Apacheなど）が既に稼働しているか確認する。
    ```bash
    sudo systemctl status nginx
    ```

---

### **Phase 2: 本番用環境変数の設定**

本番環境で使用する機密情報を設定する。

1.  ローカルのプロジェクトルートで `.env.local` をコピーし、`.env.production` という名前で新しいファイルを作成する。
2.  `.env.production` の内容を以下のように本番用に編集する。
    - **`DATABASE_URL`**: `localhost` をDocker Compose内のDBサービス名（例: `db`）に変更する。
      ```
      DATABASE_URL="postgresql://uch_user:uch_password@db:5432/uch_dev?schema=public"
      ```
    - **`NEXTAUTH_URL`**: 本番環境のドメイン（例: `https://uchinokiroku.com`）に変更する。
    - **`NEXTAUTH_SECRET`**: 新しい強固なシークレットキーを生成して設定する。（例: `openssl rand -base64 32` で生成）
    - **`NEXT_PUBLIC_SKIP_AUTH`**: `false` に設定するか、行ごと削除する。
3.  作成した `.env.production` ファイルを、`scp` コマンドなどを用いてVPS上のプロジェクトディレクトリに安全に転送する。

---

### **Phase 3: 本番用Docker Composeの設定**

`docker-compose.yml` を本番環境で安全かつ安定して動作するように調整する。

1.  **データベースの永続化:** `db` サービスの `volumes` を設定し、コンテナが再起動してもデータが消えないようにする。
    ```yaml
    services:
      db:
        # ...
        volumes:
          - postgres_data:/var/lib/postgresql/data
    volumes:
      postgres_data:
    ```
2.  **環境変数の読み込み:** `app` (Next.js) サービスが、Phase 2で作成した本番用環境変数ファイルを読み込むように設定する。
    ```yaml
    services:
      app:
        # ...
        env_file:
          - .env.production
    ```
3.  **ポートマッピング:** `app` サービスの `ports` を確認する。もしVPSの80番ポートでNginxなどが稼働していない場合は、`"80:3000"` と設定することで、直接Webアクセスが可能になる。

---

### **Phase 4: デプロイ手順の確立と実行**

VPS上で、アプリケーションを起動するための一連のコマンドを実行する。

1.  **ソースコードの取得:**
    ```bash
    # 初回の場合
    git clone <リポジトリURL> uch
    cd uch

    # 2回目以降の場合
    cd uch
    git pull origin main
    ```
2.  **環境変数ファイルの配置:** Phase 2で転送した `.env.production` がプロジェクトルートにあることを確認する。
3.  **Dockerイメージのビルド:**
    ```bash
    docker-compose build
    ```
4.  **コンテナの起動:**
    ```bash
    # -d はバックグラウンドで起動するオプション
    docker-compose up -d
    ```
5.  **起動ログの確認:**
    ```bash
    # ログを確認し、エラーが出ていないか監視する (Ctrl+Cで終了)
    docker-compose logs -f app
    ```

## 4. 検証方法

1.  ブラウザでVPSのIPアドレス、または設定したドメインにアクセスする。
2.  アプリケーションが正しく表示されることを確認する。
3.  ログイン、記事の一覧表示、新規作成、編集、削除が一通り問題なく動作することを確認する。

## 5. 今後のステップ

手動デプロイが成功した後は、この一連のプロセスをGitHub Actionsなどで自動化し、CI/CDパイプラインを構築することを次の目標とする。

以上で作業は完了です。不明点があれば、PMまで確認してください。
