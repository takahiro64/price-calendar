# README.md  
## Flight Price Tracker（価格変動カレンダー）  

---

### ✈️ プロジェクト概要

「Flight Price Tracker（価格変動カレンダー）」は、  
航空券の**出発日**や**購入日**によってどのように価格が変化するかを  
観察・記録・可視化するための個人用Webアプリです。  

外部サイト（Skyscanner、Google Flightsなど）で調べた便情報を登録し、  
日々の価格を記録していくことで、  
**「いつ買うと安いのか」**を自分のデータとして把握できます。  

---

### 🎯 開発目的

- **価格変動の仕組みを観察**し、データで理解する  
- **データベース設計／時系列データ管理**の学習  
- **Next.js + Go + PostgreSQL** の構成を実践的に学ぶ  
- 将来的に自動化・スクレイピング・通知などへ拡張可能な基盤を作る  

---

### 🧩 構成ファイル一覧（docs_v2/）

| ファイル名 | 内容 |
|-------------|------|
| [01_overview.md](./01_overview.md) | プロジェクト概要と目的 |
| [02_system_architecture.md](./02_system_architecture.md) | システム構成と技術選定 |
| [03_requirements.md](./03_requirements.md) | 機能要件・非機能要件 |
| [04_database_design.md](./04_database_design.md) | データベース設計と履歴保存ルール |
| [05_data_flow.md](./05_data_flow.md) | データ取得・更新・表示の流れ |
| [06_ui_design.md](./06_ui_design.md) | UI設計・比較表示構成 |

---

### ⚙️ 使用技術

| 層 | 技術 |
|----|------|
| フロントエンド | Next.js (React + TypeScript) |
| バックエンド | Go (REST API構成) |
| データベース | PostgreSQL（Docker上） |
| 開発環境 | Docker Compose |
| UI | Tailwind CSS + shadcn/ui |
| グラフ描画 | Recharts or Chart.js |
| クラウド | Supabase（PostgreSQL互換クラウドDB想定） |

---

### 🧭 データの流れ（概要）

1. ユーザーが路線情報を登録（出発地・到着地・出発日など）  
2. 毎日、その便の販売価格を記録（手動 or 自動）  
3. データベースに価格履歴を蓄積  
4. フロントでグラフ・カレンダー表示に変換  
5. 出発日／購入日ごとの価格変化を比較表示  

---

### 🗄️ DBモデル概要

```

flight_route (便情報)
├─ id
├─ departure / arrival
├─ airline / flight_code
└─ departure_date

price_history (価格履歴)
├─ route_id (FK)
├─ record_date
├─ price
├─ source_site
└─ created_at

````

---

### 📊 主な機能

| 機能 | 説明 |
|------|------|
| 路線登録 | 出発地・到着地・出発日などを登録 |
| 日次価格記録 | 毎日の販売価格を手動または自動で保存 |
| グラフ表示 | 出発日ごとの価格推移を折れ線で可視化 |
| ヒートマップ表示 | 出発日×購入日を2次元で比較（拡張予定） |
| CSV出力 | 履歴データを外部分析用に出力 |
| 検索・絞り込み | 出発地・到着地・航空会社で絞り込み |

---

### ☁️ クラウド対応方針

- **Supabase** を利用し、クラウドDBとして移行可能  
- 接続先は `.env` ファイルで切り替え  
- データ移行コマンド例：  
  ```bash
  pg_dump -U user -d price_tracker > dump.sql  
  psql -h db.supabase.co -U user -d postgres < dump.sql
````

---

### 🧱 開発環境構築手順

1. `.env` ファイル作成

   ```bash
   DATABASE_URL=postgres://user:password@db:5432/price_tracker
   ```
2. Docker起動

   ```bash
   docker-compose up -d
   ```
3. 確認

   * Frontend → [http://localhost:3000](http://localhost:3000)
   * Backend → [http://localhost:8080](http://localhost:8080)
   * DB → port 5432

---

### 📈 今後の拡張予定

| カテゴリ  | 内容                     |
| ----- | ---------------------- |
| 自動化   | スクレイピングやAPIによる価格取得     |
| 通知    | 価格が一定以上変動した場合に通知       |
| 分析    | 平均・最安値・変動率のグラフ化        |
| 比較    | 複数便の価格推移を同時表示          |
| アカウント | Supabase Authによるログイン対応 |

---

### 👤 開発者情報

* 開発者：**hokano**
* 目的：学習・研究用プロジェクト
* 使用言語：Go / TypeScript / SQL
* 想定開発期間：2〜3ヶ月
* 公開形態：個人利用（非商用）

---

✅ **要件定義書 ver.2 完成**
