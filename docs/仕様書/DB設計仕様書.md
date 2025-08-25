# DB設計仕様書

## プロジェクト概要
- **プロジェクト名**: うちのきろく
- **目的**: 家族向けプライベート記録・共有システム
- **対象ユーザー**: 家族メンバー（現在30名、将来100名規模想定）
- **作成日**: 2025-08-24
- **最終更新**: 2025-08-24

## 環境構成

### 本番環境
- **データベース**: PostgreSQL 16
- **ホスト**: ConoHa VPS (160.251.136.92)
- **接続先**: `postgresql://uch_user:uch_password@db:5432/uch_dev?schema=public`
- **Docker Container**: `my-db-container`

### 開発環境 
- **データベース**: PostgreSQL (ローカル)
- **接続先**: `postgresql://postgres:password@localhost:5432/uch_dev?schema=public`
- **セットアップ**: 
  ```bash
  # PostgreSQL起動（Docker使用例）
  docker run --name postgres-dev -e POSTGRES_PASSWORD=password -e POSTGRES_DB=uch_dev -p 5432:5432 -d postgres:16
  
  # 環境変数設定（.env.local）
  DATABASE_URL="postgresql://postgres:password@localhost:5432/uch_dev?schema=public"
  ```

## データベース設計

### 認証・ユーザー管理系

#### users テーブル
| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | TEXT | PRIMARY KEY | ユーザー一意識別子（cuid） |
| name | TEXT | NULL可 | 表示名 |
| email | TEXT | UNIQUE, NULL可 | メールアドレス（OAuth用） |
| emailVerified | TIMESTAMP | NULL可 | メール認証日時 |
| image | TEXT | NULL可 | プロフィール画像URL |
| password | TEXT | NULL可 | ローカル認証用ハッシュ（未使用） |
| username | TEXT | UNIQUE, NULL可 | ユーザー名 |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| role | Role | NOT NULL, DEFAULT 'USER' | ユーザー権限 |

**Role enum**: `USER`, `ADMIN`, `GUEST`
- **ADMIN**: 管理者権限（全記事管理、ユーザー管理）
- **USER**: 一般ユーザー（記事投稿・編集可能）
- **GUEST**: 読み取り専用（投稿不可）

#### accounts テーブル
| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | TEXT | PRIMARY KEY | アカウント識別子 |
| userId | TEXT | NOT NULL, FK to users(id) | ユーザーID |
| type | TEXT | NOT NULL | OAuth2タイプ |
| provider | TEXT | NOT NULL | プロバイダ名（google, line） |
| providerAccountId | TEXT | NOT NULL | プロバイダ側ID |
| refresh_token | TEXT | NULL可 | リフレッシュトークン |
| access_token | TEXT | NULL可 | アクセストークン |
| expires_at | INTEGER | NULL可 | トークン有効期限 |
| token_type | TEXT | NULL可 | トークンタイプ |
| scope | TEXT | NULL可 | スコープ |
| id_token | TEXT | NULL可 | IDトークン |
| session_state | TEXT | NULL可 | セッション状態 |

**制約**: UNIQUE(provider, providerAccountId)

#### sessions テーブル
| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | TEXT | PRIMARY KEY | セッション識別子 |
| sessionToken | TEXT | UNIQUE, NOT NULL | セッショントークン |
| userId | TEXT | NOT NULL, FK to users(id) | ユーザーID |
| expires | TIMESTAMP | NOT NULL | セッション有効期限 |

#### verification_tokens テーブル
| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| identifier | TEXT | NOT NULL | 識別子（メールアドレス等） |
| token | TEXT | UNIQUE, NOT NULL | 認証トークン |
| expires | TIMESTAMP | NOT NULL | トークン有効期限 |

**制約**: UNIQUE(identifier, token)

### コンテンツ管理系

#### articles テーブル
| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | TEXT | PRIMARY KEY | 記事識別子（cuid） |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |
| title | TEXT | NOT NULL | 記事タイトル |
| slug | TEXT | UNIQUE, NOT NULL | URL用スラッグ |
| description | TEXT | NULL可 | 記事概要 |
| content | TEXT | NOT NULL | 記事本文（Markdown） |
| pubDate | TIMESTAMP | NOT NULL | 公開日時 |
| authorId | TEXT | NOT NULL, FK to users(id) | 投稿者ID |
| heroImageUrl | TEXT | NULL可 | ヒーロー画像URL |
| tags | TEXT[] | NULL可, DEFAULT {} | タグ配列 |
| isPublished | BOOLEAN | NOT NULL, DEFAULT true | 公開状態 |

**想定データ量**: 月30件 × 12ヶ月 = 年間360件程度

#### comments テーブル
| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | TEXT | PRIMARY KEY | コメント識別子 |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |
| content | TEXT | NOT NULL | コメント内容 |
| articleId | TEXT | NOT NULL, FK to articles(id) | 記事ID |
| userId | TEXT | NOT NULL, FK to users(id) | コメント投稿者ID |

#### likes テーブル
| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | TEXT | PRIMARY KEY | いいね識別子 |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| articleId | TEXT | NOT NULL, FK to articles(id) | 記事ID |
| userId | TEXT | NOT NULL, FK to users(id) | いいね投稿者ID |

**制約**: UNIQUE(articleId, userId) - 1ユーザー1記事1回まで

### メディア管理系

#### media_files テーブル
| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | TEXT | PRIMARY KEY | ファイル識別子 |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | アップロード日時 |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |
| fileName | TEXT | UNIQUE, NOT NULL | ファイル名 |
| originalName | TEXT | NOT NULL | 元ファイル名 |
| fileType | TEXT | NOT NULL | MIMEタイプ |
| fileSize | INTEGER | NOT NULL | ファイルサイズ（バイト） |
| publicUrl | TEXT | NOT NULL | 公開URL（Cloudflare R2） |
| r2Key | TEXT | UNIQUE, NOT NULL | R2ストレージキー |
| userId | TEXT | NOT NULL, FK to users(id) | アップロード者ID |
| metadata | JSONB | NULL可 | 追加メタデータ |

#### media テーブル
| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | TEXT | PRIMARY KEY | メディア識別子 |
| uploaderId | TEXT | NOT NULL, FK to users(id) | アップロード者ID |
| originalFilename | TEXT | NOT NULL | 元ファイル名 |
| storageKey | TEXT | UNIQUE, NOT NULL | ストレージキー |
| mimeType | TEXT | NOT NULL | MIMEタイプ |
| fileSize | INTEGER | NULL可 | ファイルサイズ |
| status | MediaStatus | NOT NULL, DEFAULT 'PENDING' | 処理状況 |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**MediaStatus enum**: `PENDING`, `PROCESSING`, `OPTIMIZED`, `ERROR`

#### media_optimized テーブル
| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | TEXT | PRIMARY KEY | 最適化ファイル識別子 |
| mediaId | TEXT | NOT NULL, FK to media(id) | 元メディアID |
| storageKey | TEXT | UNIQUE, NOT NULL | 最適化ファイルキー |
| mimeType | TEXT | NOT NULL | MIMEタイプ |
| width | INTEGER | NULL可 | 幅（画像の場合） |
| height | INTEGER | NULL可 | 高さ（画像の場合） |
| fileSize | INTEGER | NULL可 | ファイルサイズ |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

#### media_tags テーブル
| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | TEXT | PRIMARY KEY | タグ識別子 |
| mediaId | TEXT | NOT NULL, FK to media(id) | メディアID |
| tag | TEXT | NOT NULL | タグ名 |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |

**制約**: UNIQUE(mediaId, tag) - 1メディア1タグ1回まで

## セキュリティ設計

### 認証方式
- **OAuth2.0**: Google, LINE認証対応
- **サイトパスワード**: 家族向けカジュアル認証（`NEXT_PUBLIC_SITE_PASSWORD="きぼう"`）
- **JWT**: NextAuth.jsによるセッション管理

### アクセス制御
- **公開範囲**: 家族のみ（約30名、将来100名規模）
- **権限管理**: Role-Based Access Control (RBAC)
  - ADMIN: 全管理権限
  - USER: 記事投稿・編集権限
  - GUEST: 閲覧のみ

### データ保護
- **個人情報**: emailは必須でない（OAuth時のみ）
- **ファイル保存**: Cloudflare R2（外部ストレージ）
- **パスワード**: bcryptハッシュ化（未使用）

## パフォーマンス設計

### インデックス戦略
```sql
-- 既存の主要インデックス
CREATE UNIQUE INDEX users_email_key ON users(email);
CREATE UNIQUE INDEX users_username_key ON users(username);
CREATE UNIQUE INDEX articles_slug_key ON articles(slug);
CREATE UNIQUE INDEX sessions_sessionToken_key ON sessions(sessionToken);

-- 推奨追加インデックス
CREATE INDEX articles_authorId_idx ON articles(authorId);
CREATE INDEX articles_pubDate_idx ON articles(pubDate DESC);
CREATE INDEX comments_articleId_idx ON comments(articleId);
CREATE INDEX media_uploaderId_idx ON media(uploaderId);
CREATE INDEX media_status_idx ON media(status);
```

### データ容量見積もり
- **記事**: 月30件 × 5KB = 月150KB、年間1.8MB
- **ユーザー**: 100人 × 1KB = 100KB
- **メディアメタデータ**: 月30件 × 2KB = 月60KB
- **実ファイル**: Cloudflare R2（外部）

**5年後想定**: 約10MB（メタデータのみ）

## バックアップ・復旧戦略

### バックアップ計画
- **頻度**: 週次（毎週日曜日 3:00AM）
- **保存期間**: 4週間分
- **対象**: PostgreSQLデータベース全体
- **除外**: 実メディアファイル（R2で管理）

### バックアップ手順（TODO）
```bash
# VPS上でのバックアップ例
docker exec my-db-container pg_dump -U uch_user -d uch_dev > backup_$(date +%Y%m%d).sql

# 復旧例
docker exec -i my-db-container psql -U uch_user -d uch_dev < backup_YYYYMMDD.sql
```

### 障害時復旧手順
1. VPSコンソールからDB状況確認
2. 最新バックアップから復旧
3. アプリケーションコンテナ再起動
4. 動作確認・データ整合性チェック

## 運用・保守

### 定期メンテナンス
- **月次**: ディスク使用量確認
- **四半期**: インデックス効果測定
- **年次**: データアーカイブ検討

### 監視項目
- データベース接続数
- 応答時間（目標: 1秒以内）
- ディスク使用量
- エラーログ

### スケーリング戦略
- **100名規模まで**: 現行構成で対応可能
- **それ以上**: Read Replica検討
- **メディア**: Cloudflare R2で自動スケーリング

## 将来拡張計画

### 短期計画（1年以内）
- [ ] 自動バックアップスクリプト実装
- [ ] 検索機能強化（全文検索）
- [ ] メディア自動最適化

### 中期計画（1-3年）
- [ ] AI執事機能統合
- [ ] 通知システム
- [ ] モバイルアプリ対応

### 長期計画（3年以上）
- [ ] マルチテナント対応
- [ ] API公開機能
- [ ] 分析・レポート機能

## 技術的制約・前提

### 技術スタック
- **ORM**: Prisma
- **DB**: PostgreSQL 16
- **認証**: NextAuth.js
- **ストレージ**: Cloudflare R2
- **デプロイ**: Docker + ConoHa VPS

### 制約事項
- ファイルサイズ制限: TODO
- アップロード形式制限: TODO
- 同時接続数制限: TODO

### 依存関係
- Cloudflare R2サービス稼働状況
- Google OAuth APIサービス状況
- LINE OAuth APIサービス状況

## 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|------------|----------|--------|
| 2025-08-24 | v1.0 | 初版作成・DB復旧後の現状記録 | Claude Code |

---

**注意**: この仕様書は2025年8月24日のデータベース復旧作業後の状態を基準として作成されています。今後の機能追加・変更時は本仕様書の更新をお忘れなく。