# 認証付きTODOアプリ 設計書

## 1. 要件定義書

### 1.1 プロジェクト概要
認証機能付きのTODOアプリケーションを開発する。ユーザーはアカウント登録後、自分専用のタスクを作成・編集・削除できる。
バックエンドはNode.js (Express) + Prisma + PostgreSQL、フロントエンドはReact (Vite) + Zustand + React Queryを使用する。

### 1.2 機能要件

#### 1.2.1 認証機能
- ユーザー登録（サインアップ）
  - メールアドレス、パスワード、名前を入力
  - パスワードはbcryptでハッシュ化して保存
  - バリデーション（Zod）によるデータ検証
- ユーザーログイン
  - メールアドレスとパスワードによるログイン
  - JWT発行によるセッション管理
  - トークンをlocalStorageに保存
- 認証状態の維持
  - 画面リロード時も認証状態を維持
  - トークン有効期限切れの処理
- ログアウト機能
  - localStorageからトークンを削除

#### 1.2.2 タスク管理機能
- タスクのCRUD操作
  - タスク作成：タイトル、説明、優先度、期限の設定
  - タスク一覧表示：ユーザーに紐づくタスクの一覧表示
  - タスク詳細表示：タスクの詳細情報の表示
  - タスク更新：タスク情報の編集
  - タスク削除：タスクの削除
- タスクの完了状態管理
  - タスクの完了/未完了の切り替え
- タスクのフィルタリング
  - すべて/未完了/完了済みの切り替え
  - タイトルによる検索
- タスクの並べ替え
  - 作成日、期限、優先度による並べ替え
- 優先度設定
  - 高/中/低の優先度設定
- 期限設定
  - 期限日の設定と表示

### 1.3 非機能要件
- レスポンシブデザイン対応
  - モバイル、タブレット、デスクトップでの表示最適化
- パフォーマンス
  - タスク一覧の高速表示（ページネーションまたは無限スクロール）
  - APIレスポンスの最適化
- セキュリティ
  - JWTによる安全な認証
  - パスワードの適切なハッシュ化
  - 入力データのバリデーション
  - CORS設定による安全なAPI通信
- コード品質
  - TypeScriptの厳格な型チェック
  - ESLint/Prettierによるコード品質の維持
  - 単体テスト・統合テストによる品質保証

## 2. アーキテクチャ設計

### 2.1 全体構成
```
todo-app/
├── backend/                # バックエンドアプリケーション
├── frontend/               # フロントエンドアプリケーション
├── docker-compose.yml      # Docker Compose 設定
├── .github/                # GitHub Actions 設定
└── docs/                   # ドキュメント
```

### 2.2 バックエンド構成
#### 2.2.1 技術スタック
- ランタイム: Node.js (Express.js)
- 言語: TypeScript
- データベース: PostgreSQL
- ORM: Prisma
- 認証: JWT (jsonwebtoken)
- パスワードハッシュ: bcrypt
- バリデーション: Zod
- テスト: Jest

#### 2.2.2 ディレクトリ構成
```
backend/
├── src/
│   ├── controllers/    # リクエストハンドラ
│   ├── middlewares/    # ミドルウェア (認証など)
│   ├── routes/         # APIルート定義
│   ├── services/       # ビジネスロジック
│   ├── utils/          # ユーティリティ関数
│   ├── app.ts          # Express アプリケーション
│   └── server.ts       # サーバー起動ファイル
├── prisma/             # Prisma スキーマと移行
├── tests/              # テストファイル
├── package.json
└── tsconfig.json
```

#### 2.2.3 アーキテクチャパターン
- レイヤードアーキテクチャを採用
  - コントローラー層：HTTPリクエスト・レスポンス処理
  - サービス層：ビジネスロジック
  - データアクセス層：Prismaを使用したデータベースアクセス

### 2.3 フロントエンド構成
#### 2.3.1 技術スタック
- フレームワーク: React
- ビルドツール: Vite
- 言語: TypeScript
- 状態管理: Zustand
- APIクライアント: React Query + Axios
- UIコンポーネント: shadcn/ui
- テスト: Vitest + React Testing Library

#### 2.3.2 ディレクトリ構成
```
frontend/
├── src/
│   ├── components/     # Reactコンポーネント
│   │   ├── auth/       # 認証関連コンポーネント
│   │   ├── tasks/      # タスク関連コンポーネント
│   │   ├── layout/     # レイアウトコンポーネント
│   │   └── ui/         # 共通UIコンポーネント
│   ├── hooks/          # カスタムフック
│   ├── pages/          # ページコンポーネント
│   ├── store/          # Zustand ストア
│   ├── services/       # API通信関連
│   ├── types/          # TypeScript型定義
│   ├── utils/          # ユーティリティ関数
│   ├── App.tsx
│   └── main.tsx
├── tests/              # テストファイル
├── package.json
└── tsconfig.json
```

## 3. データモデル設計

### 3.1 データベースモデル

#### 3.1.1 User (ユーザー)
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
}
```

#### 3.1.2 Task (タスク)
```prisma
model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  completed   Boolean    @default(false)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

### 3.2 APIインターフェース

#### 3.2.1 認証API
- `POST /api/auth/register` - ユーザー登録
  - リクエスト: `{ email: string, password: string, name: string }`
  - レスポンス: `{ id: string, email: string, name: string, token: string }`

- `POST /api/auth/login` - ログイン
  - リクエスト: `{ email: string, password: string }`
  - レスポンス: `{ id: string, email: string, name: string, token: string }`

- `GET /api/auth/me` - 現在のユーザー情報取得
  - ヘッダー: `{ Authorization: Bearer <token> }`
  - レスポンス: `{ id: string, email: string, name: string }`

#### 3.2.2 タスクAPI
- `GET /api/tasks` - タスク一覧取得
  - ヘッダー: `{ Authorization: Bearer <token> }`
  - クエリパラメータ: 
    - `status`: `all|completed|incomplete`
    - `search`: 検索キーワード
    - `sortBy`: `createdAt|dueDate|priority`
    - `sortOrder`: `asc|desc`
  - レスポンス: `{ tasks: Task[], total: number }`

- `GET /api/tasks/:id` - 特定のタスク取得
  - ヘッダー: `{ Authorization: Bearer <token> }`
  - レスポンス: `Task`

- `POST /api/tasks` - 新規タスク作成
  - ヘッダー: `{ Authorization: Bearer <token> }`
  - リクエスト: `{ title: string, description?: string, priority?: Priority, dueDate?: Date }`
  - レスポンス: `Task`

- `PUT /api/tasks/:id` - タスク更新
  - ヘッダー: `{ Authorization: Bearer <token> }`
  - リクエスト: `{ title?: string, description?: string, completed?: boolean, priority?: Priority, dueDate?: Date }`
  - レスポンス: `Task`

- `DELETE /api/tasks/:id` - タスク削除
  - ヘッダー: `{ Authorization: Bearer <token> }`
  - レスポンス: `{ success: true }`

## 4. コンポーネント設計

### 4.1 バックエンドコンポーネント

#### 4.1.1 認証コンポーネント
- AuthController: 認証リクエスト処理
- AuthService: 認証ビジネスロジック
- AuthMiddleware: JWT検証ミドルウェア

#### 4.1.2 タスク管理コンポーネント
- TaskController: タスクAPIリクエスト処理
- TaskService: タスク関連ビジネスロジック

#### 4.1.3 バリデーションコンポーネント
- Zodスキーマによる入力検証
- バリデーションミドルウェア

### 4.2 フロントエンドコンポーネント

#### 4.2.1 ページコンポーネント
- LoginPage: ログインページ
- RegisterPage: ユーザー登録ページ
- TasksPage: タスク一覧・管理ページ

#### 4.2.2 認証コンポーネント
- LoginForm: ログインフォーム
- RegisterForm: 登録フォーム
- AuthProvider: 認証コンテキスト

#### 4.2.3 タスクコンポーネント
- TaskList: タスク一覧表示
- TaskItem: 個別タスク表示
- TaskForm: タスク作成・編集フォーム
- TaskFilter: フィルタリングコンポーネント

#### 4.2.4 共通UIコンポーネント
- Button, Input, Select, Checkbox等の基本UI
- Modal, Toast等のインタラクティブUI
- Loading, ErrorState等の状態表示UI

#### 4.2.5 状態管理
- authStore: 認証状態管理
- taskStore: タスク状態管理
- filterStore: フィルター状態管理

## 5. セキュリティ設計

### 5.1 認証セキュリティ
- パスワードはbcryptで安全にハッシュ化
- JWTに適切な有効期限を設定（24時間）
- セキュアなHTTPヘッダー設定

### 5.2 データセキュリティ
- ユーザーは自分のタスクのみアクセス可能
- すべての入力データにバリデーション実施
- SQL Injectionからの保護（Prisma ORM利用）

### 5.3 通信セキュリティ
- CORS設定による安全なAPI通信
- HTTPS通信の推奨

## 6. 開発手順

### 6.1 フェーズ1: 初期設定・環境構築
- プロジェクト構造の作成
- 開発環境の設定
- Docker Compose設定

### 6.2 フェーズ2: バックエンド開発
- Prismaスキーマ定義とマイグレーション
- 認証API実装
- タスクAPI実装
- テスト実装

### 6.3 フェーズ3: フロントエンド開発
- 基本UIコンポーネント実装
- 認証画面実装
- タスク管理画面実装
- 状態管理とAPI連携
- テスト実装

### 6.4 フェーズ4: 統合・テスト・最適化
- バックエンド・フロントエンド統合
- エンドツーエンドテスト
- パフォーマンス最適化
- バグ修正

### 6.5 フェーズ5: ドキュメント・デプロイ
- ドキュメント作成
- デプロイ設定
- CI/CD設定

## 7. テスト計画

### 7.1 バックエンドテスト
- ユニットテスト: 各サービス、ユーティリティのテスト
- 統合テスト: APIエンドポイントのテスト
- 認証フローのテスト
- データベース操作のテスト

### 7.2 フロントエンドテスト
- コンポーネントテスト: 個別UIコンポーネントのテスト
- 統合テスト: 画面遷移、状態管理のテスト
- 認証フローのテスト
- APIモックを使用した機能テスト

### 7.3 エンドツーエンドテスト
- ユーザー登録からタスク管理までの一連のフロー
- エラーケースのテスト

## 8. 考慮事項・リスク

### 8.1 技術的リスク
- TypeScriptの型定義の複雑さ
- フロントエンド・バックエンド間の型の共有
- 認証状態の適切な管理

### 8.2 対応策
- 共通の型定義ファイルの作成
- 適切なエラーハンドリングの実装
- 段階的な開発とテスト駆動開発の採用

## 9. 将来の拡張性

### 9.1 追加機能候補
- タスクのカテゴリ分け
- サブタスク機能
- ドラッグ&ドロップでのタスク並べ替え
- ユーザー間のタスク共有機能
- タスクの期限通知
- ダークモード対応

### 9.2 アーキテクチャ拡張
- マイクロサービス化の検討
- キャッシュ導入によるパフォーマンス向上
- リアルタイム通知機能の追加
