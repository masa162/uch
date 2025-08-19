# TSK-068: 本番環境変数設定指示書

## 🎯 問題確認完了

本番環境の環境変数が **テンプレート値のまま** になっていることが判明しました。

### 現在の設定状況
- ✅ **NEXTAUTH_URL**: `https://uchinokiroku.com` (正しく設定済み)
- ✅ **NEXTAUTH_SECRET**: 設定済み
- ✅ **GOOGLE_CLIENT_ID**: `928722754697-albetj2ltu754a5eou52mrailmcsi0p8.apps.googleusercontent.com` (正しく設定済み)
- ❌ **GOOGLE_CLIENT_SECRET**: `[Google Consoleから取得した実際の値]` (テンプレートのまま)
- ❌ **LINE_CLIENT_ID**: `[LINE Developersから取得した実際の値]` (テンプレートのまま)
- ❌ **LINE_CLIENT_SECRET**: `[LINE Developersから取得した実際の値]` (テンプレートのまま)

---

## 🚨 【緊急修正】実際の値の取得と設定

### 【手順1】Google Client Secret の取得

#### 1-1. Google Cloud Console アクセス
```bash
# 作業手順:
# 1. https://console.cloud.google.com/ にアクセス
# 2. 該当プロジェクトを選択
# 3. 「APIs & Services」→「Credentials」に移動
# 4. Client ID: 928722754697-albetj2ltu754a5eou52mrailmcsi0p8 をクリック
```

#### 1-2. Client Secret の確認
```bash
# Google Cloud Console で:
# 1. 「Client secret」欄を確認
# 2. 値が表示されていない場合は「Reset secret」をクリック
# 3. 新しく生成されたClient Secretをコピー

# 注意: Client Secretは以下のような形式です:
# 例: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 【手順2】LINE Channel ID・Secret の取得

#### 2-1. LINE Developers Console アクセス
```bash
# 作業手順:
# 1. https://developers.line.biz/console/ にアクセス
# 2. 該当チャンネルを選択
# 3. 「Basic settings」タブをクリック
```

#### 2-2. Channel ID・Secret の確認
```bash
# LINE Developers Console で:
# 1. 「Channel ID」をコピー (数字の文字列)
# 2. 「Channel secret」をコピー (英数字の混合文字列)

# 形式例:
# Channel ID: 1234567890
# Channel Secret: abcdef1234567890abcdef1234567890
```

### 【手順3】本番環境への設定

#### 3-1. 環境変数の更新
本番環境（Vercel等）で以下の3つの環境変数を更新：

```bash
# 更新が必要な環境変数:
GOOGLE_CLIENT_SECRET=[手順1で取得した実際の値]
LINE_CLIENT_ID=[手順2で取得した実際のChannel ID]
LINE_CLIENT_SECRET=[手順2で取得した実際のChannel Secret]
```

#### 3-2. Vercelでの設定方法
```bash
# Vercelの場合:
# 1. Vercel Dashboard → プロジェクト → Settings → Environment Variables
# 2. 該当の環境変数を「Edit」
# 3. Value欄に実際の値を入力
# 4. Environment: Production を選択
# 5. 「Save」をクリック
# 6. 3つの変数すべてを更新
```

#### 3-3. 設定後の再デプロイ
```bash
# Vercelの場合:
# 1. 環境変数更新後、自動で再デプロイが開始される
# 2. 手動の場合: Deployments → 「Redeploy」

# 他の環境の場合:
# 該当環境のデプロイプロセスに従って再デプロイ
```

---

## ✅ 設定値の確認方法

### Google Client Secret の確認
- Google Cloud Console → Credentials で確認
- `GOCSPX-` で始まる文字列

### LINE設定値の確認  
- LINE Developers Console → Basic settings で確認
- Channel ID: 数字のみ（例: 1234567890）
- Channel Secret: 英数字混合（例: abc123def456...）

---

## 🧪 動作テスト手順

### テスト1: 環境変数設定確認
```bash
# 再デプロイ完了後、以下を確認:
# 1. 本番環境の環境変数がすべて実際の値に更新されているか
# 2. テンプレート値 "[...]" が残っていないか
```

### テスト2: OAuth認証テスト
```bash
# 本番環境でのログインテスト:
# 1. https://uchinokiroku.com/auth/signin にアクセス
# 2. 「Googleでログイン」をクリック → 正常にログインできるか確認
# 3. 一度ログアウトして「LINEでログイン」をクリック → 正常にログインできるか確認
```

### 成功の確認ポイント
```bash
# 以下が確認できれば修正完了:
# ✅ OAuthSigninエラーが発生しない
# ✅ Google/LINEログインが両方とも動作する  
# ✅ ログイン後にユーザー情報が正しく表示される
# ✅ 「おかえりなさい 🏠」メッセージが表示される
```

---

## ⚠️ 重要な注意事項

### セキュリティ
- **Client Secret は絶対に公開しない**
- コピー時にスペースや改行が入らないよう注意
- 設定後はブラウザの履歴をクリア推奨

### 設定値の形式
```bash
# 正しい設定例:
GOOGLE_CLIENT_SECRET=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45
LINE_CLIENT_ID=1234567890
LINE_CLIENT_SECRET=abcdef1234567890abcdef1234567890abcdef12

# 間違った設定例（これらは削除）:
GOOGLE_CLIENT_SECRET=[Google Consoleから取得した実際の値]
LINE_CLIENT_ID=[LINE Developersから取得した実際の値]  
LINE_CLIENT_SECRET=[LINE Developersから取得した実際の値]
```

---

## 🏠 完了後の確認

修正完了後、ご家族みなさまが以下の体験をできることを確認：

```
🏠 おかえりなさい！

✅ LINEアカウントでスムーズにログイン
✅ Googleアカウントでスムーズにログイン
✅ ログイン後に温かいメッセージが表示
✅ 「うちのきろく」の機能が正常に利用可能
```

---

**この設定により、ご家族みなさまが再び温かく迎えられる「うちのきろく」が完全復旧します 💝**

## 📋 作業進行チェックリスト

- [ ] Google Client Secret 取得完了
- [ ] LINE Channel ID/Secret 取得完了  
- [ ] 本番環境の3つの環境変数更新完了
- [ ] 再デプロイ実行完了
- [ ] Google ログイン動作確認完了
- [ ] LINE ログイン動作確認完了
- [ ] エラーが発生しないことを確認完了

上記のチェックリストに従って作業を進めてください！