# 作業依頼書: WR250816-001

**依頼日**: 2025年8月16日
**依頼者**: Gemini CLI PM
**担当者**: (空欄)
**状態**: Pending

## 依頼タイトル

開発環境の最終セットアップと安定化

## 依頼内容

Dockerコンテナのビルドと起動は成功したが、今後の開発の安定性と再現性を確保するため、以下の2つの仕上げ作業を依頼する。

### タスク1: `package-lock.json`のホストへのコピー

**目的**:
ビルド時にコンテナ内で生成された`package-lock.json`をホストPCにコピーし、バージョン管理に含めることで、開発者全員の環境を統一する。

**手順**:
以下のコマンドをターミナルで実行してください。
```bash
docker cp uch-app:/app/package-lock.json .
```

**期待される結果**:
プロジェクトのルートディレクトリ (`/Users/nakayamamasayuki/Documents/GitHub/uch`) に `package-lock.json` ファイルが作成される。

### タスク2: `Dockerfile`の復元

**目的**:
`package-lock.json`がプロジェクトに導入されたため、`Dockerfile`のインストールコマンドを、より厳格で高速な`npm ci`に戻す。

**手順**:
`/Users/nakayamamasayuki/Documents/GitHub/uch/Dockerfile` ファイル内の以下の記述を修正してください。

**対象箇所 (2箇所):**
```dockerfile
RUN npm install
```

**修正後の内容 (2箇所):**
```dockerfile
RUN npm ci
```

**期待される結果**:
`Dockerfile`内の`npm install`が2箇所とも`npm ci`に修正される。

## 検証方法

1.  `ls -l` コマンドを実行し、`package-lock.json` が存在することを確認する。
2.  `Dockerfile`を開き、`RUN npm ci` になっていることを確認する。
3.  `docker-compose up -d --build` を実行し、エラーなくビルドと起動が完了することを確認する。

---
