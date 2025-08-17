# Claude Code 開発環境情報

## 🚨 最重要: 必須読み込みファイル


---

## 🔑 SSH接続情報

### ConoHa VPS
- **IPアドレス**: `160.251.136.92`
- **ユーザー**: `root`
- **SSH設定名**: `conoha-vps`

### 🖥️ 環境別SSH設定

#### Mac環境
- **SSH鍵**: `/Users/nakayamamasayuki/.ssh/id_ed25519_sinvps_macbook`
- **設定ファイル**: `/Users/nakayamamasayuki/.ssh/config`

#### Windows環境
- **SSH鍵**: `D:\github\uchi\docs\関連資料\conohaVPS\[鍵ファイル名]`
- **設定ファイル**: `~/.ssh/config` (WSL) または `%USERPROFILE%\.ssh\config`

### SSH設定ファイル (共通)
```bash
Host conoha-vps
  HostName 160.251.136.92
  User root
  IdentityFile [環境に応じてパス調整]
  IdentitiesOnly yes
```

### 🔧 接続コマンド
```bash
# 直接接続（環境問わず）
ssh root@160.251.136.92 -i [鍵ファイルパス]

# 設定済み接続
ssh conoha-vps
```

### VPS基本情報
- **サーバー名**: ConoHa-vps-2025-06-24
- **スペック**: メモリ2GB/CPU 3Core/SSD 100GB
- **ドメイン**: uchinokiroku.com
