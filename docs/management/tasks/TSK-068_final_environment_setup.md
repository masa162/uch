# TSK-068: 本番環境変数設定完了指示書

## 🎯 認証情報取得完了！

すべての必要な認証情報が揃いました。

### ✅ 取得済み認証情報

```bash
NEXTAUTH_URL=https://uchinokiroku.com
NEXTAUTH_SECRET=[設定済み]

# Google OAuth
GOOGLE_CLIENT_ID=928722754697-albetj2ltu754a5eou52mrailmcsi0p8.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# LINE OAuth (チャネル情報をクライアント情報として使用)
LINE_CLIENT_ID=2007898798
LINE_CLIENT_SECRET=51b66feb55b7c3e1ab99c5e046957f59
```

---

## 🚨 【最終ステップ】本番環境への設定

### 本番環境で更新が必要な環境変数

以下の **3つの環境変数** を実際の値に更新してください：

```bash
# 現在のテンプレート値 → 実際の値に更新

1. GOOGLE_CLIENT_SECRET=[Google Consoleから取得した実際の値]
   ↓ 以下に変更
   GOOGLE_CLIENT_SECRET=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

2. LINE_CLIENT_ID=[LINE Developersから取得した実際の値]
   ↓ 以下に変更  
   LINE_CLIENT_ID=2007898798

3. LINE_CLIENT_SECRET=[LINE Developersから取得した実際の値]
   ↓ 以下に変更
   LINE_CLIENT_SECRET=51b66feb55b7c3e1ab99c5e046957f59
```

---

## 📋 **Vercelでの設定手順（今すぐ実行）**

### Step 1: Vercel Dashboard アクセス
```bash
# 1. Vercel Dashboard にログイン
# 2. uchinokiroku プロジェクトを選択
# 3. Settings → Environment Variables に移動
```

### Step 2: 環境変数の更新
```bash
# 以下の3つの環境変数を順次更新:

1. GOOGLE_CLIENT_SECRET を見つけて「Edit」クリック
   Value: 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
   Environment: Production
   「Save」クリック

2. LINE_CLIENT_ID を見つけて「Edit」クリック  
   Value: 2007898798
   Environment: Production
   「Save」クリック

3. LINE_CLIENT_SECRET を見つけて「Edit」クリック
   Value: 51b66feb55b7c3e1ab99c5e046957f59
   Environment: Production
   「Save」クリック
```

### Step 3: 再デプロイの実行
```bash
# Vercelの場合:
# 1. 環境変数更新後、自動で再デプロイが開始される
# 2. 「Deployments」タブで進行状況を確認
# 3. 完了するまで2-3分程度待機
```

---

## 🧪 **動作確認テスト（必須）**

再デプロイ完了後、以下のテストを実行してください：

### テスト1: Googleログイン
```bash
# 1. https://uchinokiroku.com/auth/signin にアクセス
# 2. 「Googleでログイン」をクリック
# 3. Google認証を完了
# 4. 正常にログインできることを確認
# 5. 「おかえりなさい 🏠」メッセージが表示されることを確認
```

### テスト2: LINEログイン  
```bash
# 1. 一度ログアウト
# 2. 再び https://uchinokiroku.com/auth/signin にアクセス
# 3. 「LINEでログイン」をクリック
# 4. LINE認証を完了
# 5. 正常にログインできることを確認
```

---

## ✅ **成功確認のチェックポイント**

以下がすべて確認できれば修正完了です：

```bash
✅ OAuthSigninエラーが発生しない
✅ GoogleログインでExchangeエラーが発生しない
✅ LINEログインが正常に動作する
✅ ログイン後にユーザー情報が正しく表示される  
✅ 「おかえりなさい 🏠」の温かいメッセージが表示される
✅ 「うちのきろく」の機能が正常に利用可能
```

---

## 🏠 **完了後のメッセージ**

修正が成功すると、ご家族みなさまに以下の体験をお届けできます：

```
🏠 おかえりなさい！

ご家族のみなさま、お待ちしておりました 💝

✨ LINEアカウントで簡単ログイン
✨ Googleアカウントで安心ログイン
✨ 今日も「うちのきろく」で温かい思い出を残しましょう

家族みんなの大切な居場所が戻ってまいりました 😊
```

---

## ⚠️ **重要な注意事項**

### セキュリティ
- 設定した認証情報は絶対に公開しないでください
- 作業完了後、ブラウザの履歴をクリアすることを推奨します

### トラブルシューティング
- 設定後もエラーが続く場合は、ブラウザのキャッシュをクリアしてください
- 再デプロイに5-10分かかる場合があります

---

## 📋 **作業完了チェックリスト**

- [ ] GOOGLE_CLIENT_SECRET 更新完了
- [ ] LINE_CLIENT_ID 更新完了
- [ ] LINE_CLIENT_SECRET 更新完了  
- [ ] 再デプロイ実行完了
- [ ] Googleログインテスト完了
- [ ] LINEログインテスト完了
- [ ] エラーが発生しないことを確認完了

**今すぐ本番環境の設定を更新して、ご家族みなさまをお迎えしましょう！** 🌸