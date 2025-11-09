# 04_database_design.md  
## データベース設計・履歴保存（ver.2）

---

## 🧩 1. 使用技術
- データベース：**PostgreSQL**（Docker上）  
- マイグレーション管理：`golang-migrate` または `goose`  
- ORM：使用しない（sqlx等の軽量ラッパを採用予定）  
- スキーマ定義ファイル：`db/schema.sql` に記述  
- 環境変数管理：`.env` ファイル（Git除外）

---

## 🗂️ 2. データモデル概要

このアプリでは、**路線（便情報）**と**価格履歴**を別テーブルとして管理する。  
出発日・購入日（記録日）を軸に、価格変化を時系列で追跡できる。

```

+---------------+       +-----------------+
| flight_route  | 1  → n | price_history  |
+---------------+       +-----------------+
| id (PK)       |       | id (PK)         |
| departure     |       | route_id (FK)   |
| arrival       |       | record_date     | ← 購入日（観測日）
| airline       |       | price           |
| flight_code   |       | source_site     |
| departure_date|       | created_at      |
| transit       |       +-----------------+
| memo          |
| created_at    |
+---------------+

````

---

## 🧱 3. テーブル定義

### flight_route（路線情報）
| カラム名 | 型 | 説明 |
|-----------|----|------|
| id | SERIAL PRIMARY KEY | 一意ID |
| departure | VARCHAR(10) | 出発地コード（IATA） |
| arrival | VARCHAR(10) | 到着地コード（IATA） |
| airline | VARCHAR(50) | 航空会社名（任意） |
| flight_code | VARCHAR(20) | 便名（任意） |
| departure_date | DATE | 出発日 |
| transit | VARCHAR(100) | 経由地（任意） |
| memo | TEXT | 備考・コメント |
| created_at | TIMESTAMP | 登録日時 |

**制約**
- `(departure, arrival, departure_date, airline)` の組み合わせを一意にする  
- 便重複登録防止のためUNIQUE制約を設定

---

### price_history（日次価格履歴）
| カラム名 | 型 | 説明 |
|-----------|----|------|
| id | SERIAL PRIMARY KEY | 一意ID |
| route_id | INTEGER | flight_route.id への外部キー |
| record_date | DATE | 記録日（観測した日） |
| price | INTEGER | その日の販売価格 |
| source_site | VARCHAR(100) | 取得元サイト（例：Skyscanner） |
| created_at | TIMESTAMP | 登録日時 |

**制約**
- `(route_id, record_date)` をUNIQUE制約に設定（同日二重登録防止）

---

## 📊 4. データ登録の流れ

1. ユーザーが路線情報を登録（`flight_route` に保存）  
2. 毎日、その路線の当日価格を記録（`price_history` に追加）  
3. 同一日・同一路線のデータは `UPDATE`、新規日は `INSERT`  
4. データ保持期間：原則90日間（削除スクリプトで自動整理）

---

## 🔁 5. データ更新ポリシー

| 操作 | 動作 |
|------|------|
| 新規登録 | `INSERT INTO flight_route ...` |
| 同一便再登録 | 既存便を検索→存在すればスキップまたは上書き |
| 日次記録 | `INSERT INTO price_history`（重複時UPDATE） |
| データ削除 | 任意（出発日経過後 or 明示削除） |

---

## 🗓️ 6. 想定クエリ例

#### 路線ごとの最新価格を取得
```sql
SELECT r.id, r.departure, r.arrival, r.departure_date, h.price, h.record_date
FROM flight_route r
JOIN price_history h ON r.id = h.route_id
WHERE h.record_date = (SELECT MAX(record_date) FROM price_history WHERE route_id = r.id);
````

#### 特定便の価格推移を取得

```sql
SELECT record_date, price
FROM price_history
WHERE route_id = $1
ORDER BY record_date ASC;
```

---

## ☁️ 7. クラウド移行方針

| 項目       | 方針                              |
| -------- | ------------------------------- |
| 移行先      | Supabase (PostgreSQL互換)         |
| 移行手順     | `pg_dump` → `psql` によるデータ移行     |
| 環境設定     | `.env` に `DATABASE_URL` を切り替え記述 |
| マイグレーション | ローカルとクラウド両方で同一スキーマ適用可能          |

---

## 🔒 8. データ保護・永続化

* ローカルDBは Docker volume で永続化
* クラウドDBは Supabase 自動バックアップ機能に依存
* 機密情報（APIキー・接続情報）は `.env` 管理
* 削除操作はソフトデリート（削除フラグ）にも対応予定

---

## 🔮 9. 将来的な拡張案

| 拡張項目                     | 内容                     |
| ------------------------ | ---------------------- |
| `price_history` に変動率列を追加 | 前日比％を保存してグラフ化          |
| `flight_route` に複数出発日対応  | 同一路線の別出発日登録            |
| `price_stats` テーブル追加     | 平均・最安・最高など統計値キャッシュ     |
| Supabase Realtime 連携     | 新価格登録時に自動通知（WebSocket） |

---

次のファイル：
➡ **05_data_flow.md（データ取得・更新の流れ）**
