# TSK-068: 本番環境OAuth認証エラー調査指示書

## 🏠 作業の目的

本番環境 (https://uchinokiroku.com/) でのLINE/Googleログインエラーを解決し、ご家族みなさまが「おかえりなさい 🏠」と温かく迎えられる環境を復旧します。

---

## 📋 調査手順（段階的実行）

### 【段階1】ブラウザでの基本調査

#### 1-1. デベロッパーツールでの詳細ログ確認
```bash
# 作業手順:
# 1. Chrome/Edgeで本番サイト https://uchinokiroku.com/auth/signin にアクセス
# 2. F12でデベロッパーツールを開き、Networkタブを選択
# 3. 「LINEでログイン」ボタンをクリックし、リクエスト/レスポンスを記録
# 4. エラーが発生した箇所のHTTPステータスコード、エラーメッセージを記録
# 5. 同様にGoogleログインでも実行
```

#### 1-2. コンソールエラーの確認
```bash
# 作業手順:
# 1. デベロッパーツールのConsoleタブを確認
# 2. JavaScript エラーや NextAuth 関連の警告メッセージを記録
# 3. 特に以下のキーワードに注目:
#    - "callback", "redirect_uri", "client_id", "nextauth"
```

### 【段階2】NextAuth.js設定の検証

#### 2-1. 環境変数の確認（本番環境）
```bash
# 確認が必要な環境変数リスト:
# - NEXTAUTH_URL (https://uchinokiroku.com である必要)
# - NEXTAUTH_SECRET (適切な値が設定されているか)
# - GOOGLE_CLIENT_ID (Google Cloud Console設定と一致)
# - GOOGLE_CLIENT_SECRET (Google Cloud Console設定と一致)
# - LINE_CLIENT_ID (LINE Developers Console設定と一致)
# - LINE_CLIENT_SECRET (LINE Developers Console設定と一致)

# 注意: 実際の値は記録せず、設定有無のみを確認
```

#### 2-2. コールバックURL設定の確認
本番環境で期待されるコールバックURL:
```
Google: https://uchinokiroku.com/api/auth/callback/google
LINE: https://uchinokiroku.com/api/auth/callback/line
```

### 【段階3】OAuthプロバイダー設定の確認

#### 3-1. Google Cloud Console設定確認
```bash
# 確認項目:
# 1. Google Cloud Console → APIs & Services → Credentials
# 2. OAuth 2.0 Client IDs の設定で以下を確認:
#    - Authorized JavaScript origins: https://uchinokiroku.com
#    - Authorized redirect URIs: https://uchinokiroku.com/api/auth/callback/google
# 3. プロジェクトのステータス（公開済みか）を確認
```

#### 3-2. LINE Developers Console設定確認
```bash
# 確認項目:
# 1. LINE Developers Console → Channel設定
# 2. Channel ID と Channel Secret が環境変数と一致するか
# 3. Callback URL: https://uchinokiroku.com/api/auth/callback/line が設定されているか
# 4. Channel の公開設定状態を確認
```

### 【段階4】サーバーサイドログの確認

#### 4-1. Vercel/デプロイ環境のログ確認
```bash
# Vercelの場合:
# 1. Vercel Dashboard → Project → Functions タブ
# 2. 最近のログでNextAuth関連のエラーを検索
# 3. 特に `/api/auth/` 関連のエラーログを確認

# その他環境の場合:
# アプリケーションログでNextAuth関連エラーを検索
```

### 【段階5】本番環境固有設定の確認

#### 5-1. NextAuth.js本番環境設定確認
現在の設定状況:
- ✅ 本番環境でのみ Google/LINEプロバイダーが有効
- ✅ 開発環境では認証スキップが適用
- ⚠️ 本番環境の`NEXTAUTH_URL`が正しく設定されているか要確認

#### 5-2. ドメイン設定とHTTPS確認
```bash
# 確認項目:
# 1. https://uchinokiroku.com が正しくSSL証明書で保護されているか
# 2. HTTP → HTTPS リダイレクトが正常に機能しているか
# 3. サブドメインの設定に問題がないか
```

---

## 🔍 想定される問題パターンと対処法

### パターン1: 環境変数設定ミス
**症状**: "Client not found" または "Invalid client" エラー
**対処**: 本番環境の環境変数がOAuthプロバイダーの設定と一致するよう修正

### パターン2: コールバックURL不一致
**症状**: "redirect_uri_mismatch" エラー
**対処**: OAuthプロバイダー側のコールバックURL設定を本番ドメインに修正

### パターン3: NextAuth.js設定問題
**症状**: 認証フロー途中での500エラー
**対処**: `src/lib/auth.ts` の本番環境設定を見直し

### パターン4: HTTPS/証明書問題
**症状**: "Insecure connection" 警告
**対処**: SSL証明書の設定確認、強制HTTPS設定

---

## 📝 調査結果記録フォーマット

```markdown
## TSK-068 調査結果

### 実行日時: YYYY-MM-DD HH:MM

### 【段階1】ブラウザ調査結果
- LINEログイン時のエラー: [具体的なエラーメッセージ]
- Googleログイン時のエラー: [具体的なエラーメッセージ]
- コンソールエラー: [JavaScriptエラーの詳細]

### 【段階2】環境変数確認結果
- NEXTAUTH_URL: [設定されているか、値は適切か]
- OAuth関連変数: [設定状況]

### 【段階3】プロバイダー設定確認結果
- Google Console: [設定状況と問題点]
- LINE Developers: [設定状況と問題点]

### 【段階4】サーバーログ確認結果
- 発見されたエラー: [ログの詳細]

### 【段階5】本番環境設定確認結果
- 特定された問題: [問題の詳細]

### 📋 次に実行すべき修正作業
1. [修正項目1]
2. [修正項目2]
```

---

## ⚠️ 重要な注意事項

1. **機密情報の保護**: OAuth の Client ID/Secret は記録に含めず、設定有無のみを確認
2. **段階的実行**: 必ず段階1から順番に実行し、問題箇所を特定してから次へ
3. **設計思想の遵守**: エラーメッセージは「あれれ？うまくログインできませんでした 😊」という温かい表現で表示されているか確認
4. **変更の最小化**: 調査段階では設定変更を行わず、問題特定に専念

---

## 🏠 完了後の確認ポイント

✅ LINEログインで「おかえりなさい 🏠」メッセージが表示される  
✅ Googleログインで正常にユーザー情報が取得できる  
✅ 認証後に適切なページにリダイレクトされる  
✅ エラー時も温かいメッセージが表示される

---

**この調査により、ご家族みなさまが再び温かく迎えられる「うちのきろく」を取り戻しましょう 💝**