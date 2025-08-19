# TSK-068: 本番環境OAuth認証エラー修正指示書

## 🔍 エラー分析結果

### 確認されたエラー情報
1. **OAuthSigninエラー**: `/api/auth/error?error=OAuthSignin`
2. **Google OAuth正常動作**: GoogleのOAuth認証URLは正しく生成されている
3. **Client ID確認**: `928722754697-albetj2ltu754a5eou52mrailmcsi0p8.apps.googleusercontent.com`
4. **コールバックURL確認**: `https://uchinokiroku.com/api/auth/callback/google`

### 🎯 問題の特定
Google OAuth認証は**正常に開始**されているが、**コールバック処理でエラー**が発生している可能性が高い。

---

## 📋 修正指示（段階的実行）

### 【段階1】Google Cloud Console設定確認

#### 1-1. Google Cloud Console アクセス
```bash
# 作業手順:
# 1. https://console.cloud.google.com/ にアクセス
# 2. 該当プロジェクトを選択
# 3. 「APIs & Services」→「Credentials」に移動
# 4. Client ID: 928722754697-albetj2ltu754a5eou52mrailmcsi0p8 を確認
```

#### 1-2. リダイレクトURI設定確認
```bash
# 確認項目:
# 「Authorized redirect URIs」に以下が設定されているか確認:
# ✅ https://uchinokiroku.com/api/auth/callback/google

# もし設定されていない場合は追加:
# 1. 「編集」ボタンをクリック
# 2. 「Authorized redirect URIs」セクションに追加
# 3. 「保存」をクリック
```

#### 1-3. JavaScript origins設定確認
```bash
# 確認項目:
# 「Authorized JavaScript origins」に以下が設定されているか確認:
# ✅ https://uchinokiroku.com

# もし設定されていない場合は追加して保存
```

### 【段階2】LINE Developers Console設定確認

#### 2-1. LINE Developers Console アクセス
```bash
# 作業手順:
# 1. https://developers.line.biz/console/ にアクセス
# 2. 該当のチャンネルを選択
# 3. 「LINE Login」タブを確認
```

#### 2-2. Callback URL設定確認
```bash
# 確認項目:
# 「Callback URL」に以下が設定されているか確認:
# ✅ https://uchinokiroku.com/api/auth/callback/line

# もし設定されていない場合は追加して保存
```

### 【段階3】本番環境変数確認・設定

#### 3-1. 現在の環境変数確認
```bash
# Vercelの場合:
# 1. Vercel Dashboard → プロジェクト → Settings → Environment Variables
# 2. 以下の変数が設定されているか確認:

必須環境変数:
NEXTAUTH_URL=https://uchinokiroku.com
NEXTAUTH_SECRET=[32文字以上のランダム文字列]
GOOGLE_CLIENT_ID=928722754697-albetj2ltu754a5eou52mrailmcsi0p8.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=[Google Consoleから取得]
LINE_CLIENT_ID=[LINE Developersから取得]
LINE_CLIENT_SECRET=[LINE Developersから取得]
```

#### 3-2. 環境変数の設定・修正
```bash
# 設定が不足している場合の追加手順:
# 1. 「Add New」ボタンをクリック
# 2. Name欄に変数名を入力
# 3. Value欄に適切な値を入力
# 4. Environment: Production を選択
# 5. 「Save」をクリック

# 修正が必要な場合:
# 1. 該当の変数行の「Edit」をクリック
# 2. Value欄を正しい値に修正
# 3. 「Save」をクリック
```

### 【段階4】NEXTAUTH_SECRET生成（未設定の場合）

#### 4-1. 安全なシークレット生成
```bash
# ローカルで以下コマンドを実行してシークレットを生成:
openssl rand -base64 32

# または、Node.jsで生成:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 生成された値をNEXTAUTH_SECRETに設定
```

### 【段階5】設定反映とテスト

#### 5-1. デプロイメント実行
```bash
# Vercelの場合:
# 1. 環境変数設定後、自動的に再デプロイされる場合が多い
# 2. 手動の場合: Deployments タブから「Redeploy」

# その他環境:
# デプロイメントプロセスに従って再デプロイを実行
```

#### 5-2. 動作確認
```bash
# テスト手順:
# 1. https://uchinokiroku.com/auth/signin にアクセス
# 2. 「Googleでログイン」をクリック
# 3. Google認証を完了
# 4. 正常にログインできることを確認

# 成功の確認ポイント:
# ✅ OAuthSigninエラーが発生しない
# ✅ ログイン後にユーザー情報が表示される
# ✅ 「おかえりなさい 🏠」メッセージが表示される
```

---

## 🚨 特に注意すべき点

### 1. Client Secret の取り扱い
```bash
# Google Cloud Console:
# - Client Secretは「Download JSON」または「View」から確認
# - 新しいSecretの生成が必要な場合は「Reset Secret」

# LINE Developers:
# - Channel Secretは「Basic settings」タブで確認可能
```

### 2. 大文字小文字・スペースの確認
```bash
# よくある間違い:
# ❌ NEXTAUTH_url (小文字)
# ✅ NEXTAUTH_URL (大文字)

# ❌ Client IDにスペースが混入
# ✅ スペース除去した正確な値
```

### 3. HTTPSの確認
```bash
# 必須条件:
# - 本番環境は必ずHTTPS（SSL証明書が有効）
# - Google/LINEはHTTPSでない環境では動作しない
```

---

## 📊 予想される修正パターン

### パターン1: Google設定のみ修正が必要
- Google Cloud ConsoleのリダイレクトURI追加のみ
- 所要時間: 5-10分

### パターン2: 環境変数未設定
- 本番環境にOAuth関連環境変数を新規設定
- 所要時間: 15-20分

### パターン3: Client Secret不正
- Google/LINEのClient Secretを取得し直して設定
- 所要時間: 20-30分

---

## ✅ 完了確認チェックリスト

### Google OAuth
- [ ] Google Cloud Consoleでリダイレクト URI設定済み
- [ ] JavaScript origins設定済み
- [ ] GOOGLE_CLIENT_ID環境変数設定済み
- [ ] GOOGLE_CLIENT_SECRET環境変数設定済み

### LINE OAuth  
- [ ] LINE DevelopersでCallback URL設定済み
- [ ] LINE_CLIENT_ID環境変数設定済み
- [ ] LINE_CLIENT_SECRET環境変数設定済み

### NextAuth設定
- [ ] NEXTAUTH_URL=https://uchinokiroku.com設定済み
- [ ] NEXTAUTH_SECRET設定済み（32文字以上）

### 動作確認
- [ ] Googleログインが正常動作
- [ ] LINEログインが正常動作
- [ ] エラーページが表示されない
- [ ] 「おかえりなさい 🏠」メッセージ表示

---

## 🏠 修正完了後のメッセージ

修正が完了すると、ご家族みなさまに以下の温かいメッセージをお届けできます：

```
🏠 おかえりなさい！

ご家族のみなさま、お待ちしておりました 💝
今日も「うちのきろく」で温かい思い出を
残していきましょうね 😊
```

---

**この手順により、ご家族みなさまが再び温かく迎えられる「うちのきろく」を取り戻しましょう 🌸**