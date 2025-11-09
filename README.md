# Flight Price Tracker（価格変動カレンダー）

航空券の価格変動を観察・記録・可視化するWebアプリケーション

## 🎯 概要

このアプリケーションは、航空券の出発日や購入日による価格変動を追跡し、視覚化するためのツールです。

詳細なドキュメントは[docs/](./docs/)フォルダを参照してください。

## 🚀 クイックスタート

### 前提条件

- Docker & Docker Compose
- Node.js 18+ (ローカル開発時)
- Go 1.21+ (ローカル開発時)

### セットアップ

1. リポジトリのクローン

```bash
git clone https://github.com/takahiro64/price-calendar.git
cd price-calendar
```

2. 環境変数の設定

```bash
cp .env.example .env
```

3. Docker Composeで起動

```bash
docker-compose up -d
```

4. アクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8080

## 📁 プロジェクト構造

```
price-calendar/
├── docs/                    # ドキュメント
├── frontend/                # Next.js フロントエンド
├── backend/                 # Go バックエンド
├── db/                      # データベーススキーマ
├── docker-compose.yml       # Docker構成
└── README.md
```

## 🛠️ 技術スタック

- **フロントエンド**: Next.js, React, TypeScript, Tailwind CSS
- **バックエンド**: Go, Gin/Echo
- **データベース**: PostgreSQL
- **開発環境**: Docker Compose

## 📚 ドキュメント

- [概要](./docs/01_overview.md)
- [システム構成](./docs/02_system_architecture.md)
- [機能要件](./docs/03_requirements.md)
- [データベース設計](./docs/04_database_design.md)
- [API仕様](./docs/05_api_spec.md)
- [UI設計](./docs/06_ui_design.md)

## 📝 ライセンス

MIT
