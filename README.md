# Pointail レファレンス ショーケースサイト

日本のECマーケティングプラットフォーム **Pointail** の営業チームが、顧客ミーティングで実績・事例を見せるためのサイトです。

## 機能概要

- **公開ページ** (`/`) — ログイン不要で誰でも閲覧可能なレファレンス一覧
- **管理者ページ** (`/admin`) — チームメンバーがログインしてレファレンスを追加・編集・削除
- **Notion 連携** — Notion データベースからレファレンス情報を同期
- **カテゴリフィルター** — カテゴリ別に絞り込み表示
- **匿名表示対応** — ブランド名を非公開にして事例だけ掲載可能

---

## セットアップ手順

### 1. 前提条件

- Node.js 18 以上（確認: `node -v`）
- Supabase アカウント（https://supabase.com）

### 2. Supabase プロジェクトを作成

1. https://supabase.com にアクセスしてログイン
2. 「New Project」をクリック
3. プロジェクト名・データベースパスワードを設定して作成

### 3. データベーススキーマを設定

1. Supabase ダッシュボード → **SQL Editor** を開く
2. `supabase/schema.sql` の内容を全てコピーして貼り付け
3. 「Run」をクリックして実行

### 4. 環境変数を設定

`.env.local.example` をコピーして `.env.local` を作成：

```bash
cp .env.local.example .env.local
```

Supabase ダッシュボード → **Settings → API** で以下を確認してコピー：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...（anon public）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...（service_role）
```

### 5. チームメンバーのアカウント作成（招待）

> ⚠️ 会員登録ページはありません。Supabase ダッシュボードから招待してください。

1. Supabase ダッシュボード → **Authentication → Users**
2. 「Invite user」をクリック
3. チームメンバーのメールアドレスを入力して送信
4. メンバーがメールのリンクからパスワードを設定

---

## ローカル実行

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

| URL | 内容 |
|-----|------|
| `/` | 公開ショーケースページ（ログイン不要） |
| `/login` | チームメンバーログイン |
| `/admin` | 管理者ダッシュボード |
| `/admin/cards/new` | レファレンス新規追加 |
| `/admin/notion-sync` | Notion 連携設定 |

---

## Notion 連携（オプション）

Notion データベースからレファレンスを自動同期できます。

### Notion 側の設定

1. **Notion インテグレーション作成**
   - https://www.notion.so/my-integrations → 「New integration」
   - 名前を入力（例: Pointail Reference）→ Submit
   - 「Internal Integration Token」をコピー

2. **データベースにインテグレーションを追加**
   - 同期したい Notion データベースを開く
   - 右上「...」→「コネクト」→ 作成したインテグレーションを選択

3. **データベース ID を取得**
   - データベースの URL: `https://www.notion.so/xxx/DATABASE_ID?v=...`
   - `DATABASE_ID` の部分（32文字のハイフン区切りID）をコピー

4. **`.env.local` に追加**
   ```env
   NOTION_API_KEY=secret_xxxxxxxxxxxxx
   NOTION_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

### Notion データベースのプロパティ設定

| プロパティ名 | 型 | 説明 |
|------------|-----|------|
| `ブランド名` | タイトル | ブランド名（メインタイトル） |
| `カテゴリ` | セレクト | 例：뷰티/화장품、패션/의류 など |
| `サマリー` | テキスト | 一行サマリー |
| `説明` | テキスト | 詳細説明 |
| `公開` | チェックボックス | ✅ で同期対象になります |
| `匿名` | チェックボックス | ✅ でブランド名を非公開表示 |
| （任意の数値列） | 数値 | 指標として自動取込み |

### 同期方法

1. `/admin/notion-sync` ページにアクセス
2. 「Notion から同期する」をクリック
3. Notion の内容がレファレンスカードに反映されます

> 既存のカードは `notion_page_id` をキーに上書き更新されます。

---

## Vercel へのデプロイ

### 手順

1. **GitHub にプッシュ**
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/your-org/pointail-reference.git
   git push -u origin main
   ```

2. **Vercel プロジェクト作成**
   - https://vercel.com にアクセス → 「New Project」
   - GitHub リポジトリをインポート
   - Framework: Next.js（自動検出されます）

3. **環境変数を設定**
   - Vercel の「Environment Variables」に以下を追加：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NOTION_API_KEY`（連携する場合）
     - `NOTION_DATABASE_ID`（連携する場合）

4. **Deploy** をクリック → 数分後にデプロイ完了

---

## ディレクトリ構成

```
.
├── app/
│   ├── page.tsx              # 公開ショーケースページ
│   ├── PublicShowcase.tsx    # 公開ページUI
│   ├── login/                # ログインページ
│   └── admin/
│       ├── page.tsx          # 管理者ダッシュボード
│       ├── AdminCardList.tsx # カード一覧・削除
│       ├── cards/
│       │   ├── new/          # 新規追加
│       │   └── [id]/edit/    # 編集
│       └── notion-sync/      # Notion連携
├── components/               # 共通UIコンポーネント
├── lib/
│   ├── supabase/             # Supabaseクライアント
│   └── notion.ts             # Notion連携ロジック
├── supabase/
│   └── schema.sql            # DBスキーマ（Supabase SQL Editorで実行）
└── types/
    └── index.ts              # 型定義
```
