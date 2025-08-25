# TSK-086: OAuth認証エラー調査・対応

## 発生日時
2025-08-24

## 問題の概要
- GitHub Actionsのデプロイは成功するが、本番環境でOAuth認証エラーが発生
- Google OAuth認証時にリダイレクトURIの不一致エラーが発生
- VPSへのSSH接続が不可能な状態

## エラー詳細
```
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.
If you're the app developer, register the redirect URI in the Google Cloud Console.
redirect_uri: http://localhost:3001/api/auth/callback/google
```

## 調査結果

### 1. OAuth設定状況
- ✅ Google Cloud Console: `https://uchinokiroku.com/api/auth/callback/google` 設定済み
- ✅ 環境変数: `NEXTAUTH_URL=https://uchinokiroku.com` 正しく設定
- ✅ NextAuth設定: 問題なし

### 2. VPS接続状況
- ❌ SSH接続: 全ポート（22, 2222, 2200, 10022）で接続拒否
- ✅ Web応答: `https://uchinokiroku.com` 正常稼働
- ⚠️ 古い設定: レスポンス内にlocalhost参照が残存

### 3. IPアドレス変更確認
- 正しいIP: `160.251.136.92` → SSH・Web応答あり（正常）
- 廃棄IP: `160.251.19.83` → 使用停止、設定から削除必要

### 4. 既知の問題との関連
- TSK-085で同様の問題（VPS上の古いコンテナ残存）が発生していた
- VPS上のファイルとGitHubリポジトリの乖離問題

## 根本原因の特定
1. **VPS上に古いコンテナが残存**している
2. **新しいデプロイが反映されていない**
3. **SSH管理アクセスが不可能**な状態

## 次のアクション項目

### 即座に実行すべき項目
1. ConoHa VPSコンソールからの直接アクセス
2. SSH設定・ファイアウォール設定の確認・復旧
3. 古いDockerコンテナの停止・削除
4. 新しいコンテナでの環境変数確認

### 技術的解決手順
1. VPSコンソール経由でのシステム確認
2. `docker ps -a` で全コンテナ状況確認
3. `docker-compose down` で既存コンテナ停止
4. `docker system prune -f` でクリーンアップ
5. `docker-compose up -d` で新規コンテナ起動
6. 環境変数の正常性確認

### 予防策
- SSH接続の冗長化設定
- デプロイ後の自動ヘルスチェック実装
- コンテナ状況の監視強化

## ステータス
- 調査完了: ✅
- 実作業: ✅ 完了
- データベース設定: ✅ 修正完了
- OAuth認証: ✅ 正常動作確認

## 最終修正 (2025-08-24 14:10)
**追加で発見された問題:**
1. PostgreSQLデータベーステーブル未作成
2. NextAuth必須テーブル（users, accounts, sessions）不存在

**修正作業:**
1. 手動SQLでNextAuthテーブル作成
2. アプリケーション再起動
3. OAuth providers API正常応答確認

## 関連タスク
- TSK-085: VPS本番環境最適化
- 過去の類似問題記録

## 備考
GitHub Actionsが成功してもVPS上の実際のサービスに反映されない問題は、デプロイプロセス自体ではなく、VPS上での古いコンテナ管理の問題である。