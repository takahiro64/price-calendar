# 02_system_architecture.md  
## システム構成（ver.2）

---

### 🧩 1. 全体構成概要

本アプリは「ユーザー入力した路線データ」をもとに、  
毎日記録される販売価格を蓄積・可視化するシステムである。

```

[ユーザー]
↓
[Next.js フロントエンド]
↓ (REST API)
[Go バックエンド]
↓ (SQL)
[PostgreSQL データベース]

```

---

### ⚙️ 2. 各レイヤーの役割

| レイヤー | 使用技術 | 主な役割 |
|-----------|-----------|----------|
| フロントエンド | Next.js (React + TypeScript) | 入力フォーム、価格履歴表示、グラフ描画 |
| バックエンド | Go (Gin or Echo) | 路線登録、価格履歴管理、集計API提供 |
| データベース | PostgreSQL | 路線・価格履歴データ保存 |
| 開発環境 | Docker Compose | 全体のコンテナ管理 |
| データ収集 | 手動入力 → 自動取得拡張予定 | 将来的にスクレイピング導入 |

---

### 🧱 3. コンポーネント構成

```

/frontend
├─ pages/
│   ├─ index.tsx          # 路線一覧・検索
│   ├─ routes/[id].tsx    # 個別ルートの価格履歴ページ
│   └─ register.tsx       # 路線登録フォーム
├─ components/
│   ├─ RouteCard.tsx
│   ├─ PriceGraph.tsx
│   └─ CalendarView.tsx
└─ utils/
└─ api.ts             # API通信ラッパー

/backend
├─ main.go
├─ controllers/
├─ models/
├─ repositories/
└─ routes/

/db
├─ init.sql
└─ migrations/

````

---

### 🐳 4. Docker構成

```yaml
version: '3.9'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - db

  db:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=price_tracker
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
````

---

### 🔌 5. データの流れ

1. **ユーザー登録**

   * 出発地・到着地・航空会社・出発日などを登録
   * DBに「路線情報」として保存

2. **価格記録**

   * 毎日または手動で、その便の当日価格を登録（または取得）
   * DBに履歴として保存

3. **表示**

   * フロントエンドで折れ線・カレンダー・ヒートマップなどで表示
   * 出発日別・購入日別の比較が可能

---

### ☁️ 6. クラウド移行構想

| 項目     | 方針                          |
| ------ | --------------------------- |
| クラウドDB | Supabase (PostgreSQL互換) を想定 |
| バックアップ | Supabase自動バックアップ機能を利用       |
| 環境変数   | `.env` ファイルで接続設定を管理         |
| API公開  | 将来的に外部アクセス用のPublic API提供も検討 |

---

### 🔒 7. セキュリティ・管理方針

* `.env` に認証情報を保存（Git管理外）
* CORSを適切に設定（Next.jsドメインからのアクセスのみ許可）
* HTTPS前提（将来的なデプロイ時）
* 管理ユーザー（自分のみ）アクセス制御

---

### 🧭 8. 拡張の方向性

* 自動価格取得モジュール（スクレイピング or API化）
* Supabase Authを使ったログイン認証
* 外部データとの比較（平均価格・最安値表示）
* GraphQL対応（複雑な検索クエリ用）

---

次のファイル：
➡ **03_requirements.md（機能要件・非機能要件）**
