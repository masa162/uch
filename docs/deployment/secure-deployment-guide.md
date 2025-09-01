# セキュアデプロイメントガイド

## 重要：環境変数セキュリティ

### 問題の背景
- 過去に`.env.production`ファイルがGitに追跡され、機密情報が漏洩
- ローカル環境の設定が本番環境に反映される問題が繰り返し発生

### 解決策

#### 1. 機密ファイルの管理
```bash
# ✅ 正しい方法
.env.*ファイルは.gitignoreで除外
テンプレートファイル(.env.example)のみコミット

# ❌ 間違った方法
.env.productionをGitにコミット
```

#### 2. デプロイメント時の環境変数確認
```bash
# VPS上で環境変数が正しく設定されているか確認
docker exec my-app-container env | grep NEXTAUTH_URL
# 期待値: NEXTAUTH_URL=https://uchinokiroku.com

# ローカル環境の値が表示される場合は設定ミス
# 期待しない値: NEXTAUTH_URL=http://localhost:3000
```

#### 3. 安全なコンテナ起動手順
```bash
# 環境変数ファイルを明示的に指定
docker run -d --name my-app-container \
  --env-file .env.production \
  --network uch_default \
  -p 3000:3000 \
  --restart unless-stopped \
  ghcr.io/masa162/uch:latest
```

#### 4. デプロイメント前チェックリスト
- [ ] .env.productionファイルがVPS上に存在する
- [ ] NEXTAUTH_URL=https://uchinokiroku.com が設定されている
- [ ] DATABASE_URLが本番DB用に設定されている
- [ ] Google OAuth設定でリダイレクトURIが正しい

#### 5. トラブルシューティング
```bash
# 問題: ローカルのredirect_uriエラー
# 原因: NEXTAUTH_URL=http://localhost:3000

# 解決: 環境変数確認と修正
docker stop my-app-container
docker rm my-app-container
docker run -d --name my-app-container --env-file .env.production ...
```

## Google OAuth設定

### 必須設定
**Google Cloud Console → API & Services → Credentials**

承認済みリダイレクトURI:
- ✅ `https://uchinokiroku.com/api/auth/callback/google`
- ❌ `http://localhost:3000/api/auth/callback/google` (削除)

### 確認方法
1. https://uchinokiroku.com/auth/signin でテスト
2. redirect_uri_mismatchエラーが出ないことを確認
3. 正常にGoogle認証が完了することを確認

## AI Butler復旧手順

```bash
# 1. イメージビルド
cd /root/uch/scripts/ai-butler
docker build -t uch-ai-butler .

# 2. コンテナ起動
docker run -d --name my-ai-butler-container \
  --env-file .env \
  --network uch_default \
  --restart unless-stopped \
  -v butler-temp:/app/temp \
  uch-ai-butler

# 3. 動作確認
docker logs my-ai-butler-container --tail 20
```

## 長期運用のための改善案

1. **CI/CDパイプライン導入**
   - 環境変数の自動検証
   - デプロイメント前の設定チェック

2. **環境変数管理サービス利用**
   - Docker Secrets
   - 外部環境変数管理サービス

3. **監視システム導入**
   - 設定変更の検知
   - 異常値のアラート