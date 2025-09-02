
/Users/nakayamamasayuki/Documents/GitHub/mn/documents/server/ConoHa VPS
基本↑に記載しておく、keyの原本もそっちにおいておく方針、代行ツールに依頼するためにいちおう、こっちの階層にもkeyおいてしまってるけど、できれば一元的にのみ管理するほうが望ましい。


⏺ ✅ VPS上での環境変数設定完了

設定した環境変数:

DATABASE_URL: PostgreSQLデータベース接続文字列（Docker Composeサービス参照）
NEXTAUTH_URL: http://160.251.136.92:3001 (VPSのIPアドレス:ポート3001)
NEXTAUTH_SECRET: OpenSSLで生成したセキュアな32バイトキー
NEXT_PUBLIC_SITE_PASSWORD: 家族アクセス用パスワード uchifamily2025
OAuth・Email・Cloudinary: 開発段階のためダミー値（後で実際の値に置き換え可能）
NEXT_PUBLIC_SKIP_AUTH: 本番環境のため false に設定