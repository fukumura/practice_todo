# 📝 認証付きTODOアプリ (Full-Stack TypeScript)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.0-61DAFB)
![Express](https://img.shields.io/badge/Express-4.18-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC)

## 🚀 概要
認証機能付きのTODOアプリです。ユーザーはアカウント登録後、タスクを作成・編集・削除できます。  
バックエンドは **Node.js (Express) + Prisma + PostgreSQL**、  
フロントエンドは **React (Vite) + Zustand + React Query** を使用しています。

## 🏗️ 技術スタック
### フロントエンド
- ⚡ Vite + React (TypeScript)
- 🔥 Zustand (状態管理)
- 🔄 React Query (データフェッチ)
- 🎨 shadcn/ui (UIコンポーネント)
- 💅 Tailwind CSS (スタイリング)
- 🌐 Axios (API通信)
- 🏗️ ESLint & Prettier (コードフォーマット)

### バックエンド
- 🚀 Express.js (TypeScript)
- 🗄️ PostgreSQL (データベース)
- 🏗️ Prisma ORM (DB管理)
- 🔑 JWT認証
- 🔒 bcrypt (パスワードハッシュ)
- ✅ Zod (入力バリデーション)
- 🌍 CORS (フロントエンドとの通信)

## 📋 機能
- **🔐 ユーザー認証**
  - サインアップ/ログイン
  - JWTを利用した認証管理
  - パスワードの安全なハッシュ化

- **✅ タスク管理**
  - タスクの作成、読取、更新、削除 (CRUD)
  - タスクの完了状態の切り替え
  - タスクのフィルタリング (すべて/未完了/完了済み)
  - タスクの優先度設定 (高/中/低)
  - 期限の設定と通知

- **🔍 検索と並べ替え**
  - タスクのタイトルによる検索
  - 作成日、期限、優先度による並べ替え

## 📦 セットアップ方法
### 1️⃣ **環境構築**
#### **前提条件**
- Node.js (`v18.x` 以上)
- PostgreSQL (`v14.x` 以上)
- Docker (`v20.x` 以上)

#### **リポジトリのクローン**
```bash
git clone https://github.com/fukumura/todo-app.git
cd todo-app
```

#### **環境変数の設定**
ルートディレクトリに `.env` ファイルを作成し、以下の内容を記入してください。
```ini
# バックエンド環境変数
DATABASE_URL="postgresql://user:password@localhost:5432/todoapp"
JWT_SECRET="your-secret-key"
PORT=5000

# フロントエンド環境変数
VITE_API_URL="http://localhost:5000"
```

### 2️⃣ **Docker を使用した起動**
Docker Compose を使用してバックエンドとデータベースを起動します。

```bash
# Docker Compose でコンテナを起動
docker-compose up -d
```

### 3️⃣ **手動セットアップと起動**
Docker を使わない場合は、以下の手順で手動セットアップが可能です。

#### **バックエンドのセットアップ**
```bash
# バックエンドディレクトリに移動
cd backend

# 依存関係のインストール
npm install

# Prisma モデルをデータベースに反映
npx prisma migrate dev --name init

# 開発サーバーの起動
npm run dev
```

#### **フロントエンドのセットアップ**
```bash
# フロントエンドディレクトリに移動
cd frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 🧪 テスト
```bash
# バックエンドのテスト実行
cd backend
npm test

# フロントエンドのテスト実行
cd frontend
npm test
```

## 📁 プロジェクト構成
```
todo-app/
├── backend/                # バックエンドアプリケーション
│   ├── src/
│   │   ├── controllers/    # リクエストハンドラ
│   │   ├── middlewares/    # ミドルウェア (認証など)
│   │   ├── routes/         # APIルート定義
│   │   ├── services/       # ビジネスロジック
│   │   ├── utils/          # ユーティリティ関数
│   │   ├── app.ts          # Express アプリケーション
│   │   └── server.ts       # サーバー起動ファイル
│   ├── prisma/             # Prisma スキーマと移行
│   ├── tests/              # テストファイル
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── hooks/          # カスタムフック
│   │   ├── pages/          # ページコンポーネント
│   │   ├── store/          # Zustand ストア
│   │   ├── services/       # API通信関連
│   │   ├── types/          # TypeScript型定義
│   │   ├── utils/          # ユーティリティ関数
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/              # テストファイル
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml      # Docker Compose 設定
├── .github/                # GitHub Actions 設定
└── README.md
```

## 🚀 API エンドポイント
バックエンドは以下のエンドポイントを提供します：

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報取得

### タスク
- `GET /api/tasks` - タスク一覧取得
- `GET /api/tasks/:id` - 特定のタスク取得
- `POST /api/tasks` - 新規タスク作成
- `PUT /api/tasks/:id` - タスク更新
- `DELETE /api/tasks/:id` - タスク削除

## 💻 開発
### コード品質
- ESLint と Prettier を使用してコードスタイルを統一
```bash
# コードのリント
npm run lint

# コードのフォーマット
npm run format
```

### CI/CD
GitHub Actions を使用して以下を自動化：
- コードのリント
- テスト実行
- ビルドの検証

## 📝 ライセンス
MIT

## 👥 コントリビューション
1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

