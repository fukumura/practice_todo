# Dockerを使った開発環境のセットアップ手順

## 概要

このドキュメントでは、Docker Composeを使って認証付きTODOアプリの開発環境をセットアップする手順を説明します。

## 環境構成

Docker Composeで以下のサービスを構築します：

1. **postgres**: PostgreSQLデータベース（データの永続化）
2. **backend**: Node.js/Express APIサーバー（開発モード）
3. **pgadmin**: PostgreSQL管理ツール（オプション）

## 前提条件

以下のソフトウェアがインストールされていることを確認してください：

- Docker
- Docker Compose
- Git

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/todo-app.git
cd todo-app
```

### 2. 環境変数の設定

プロジェクトのルートディレクトリに `.env` ファイルを作成します（すでに提供されています）。
必要に応じてパスワードなどの値を変更してください。

### 3. バックエンドのディレクトリ構造を作成

```bash
mkdir -p backend/src/controllers backend/src/middlewares backend/src/routes backend/src/services backend/src/utils backend/prisma backend/tests
```

### 4. Prismaスキーマの配置

`backend/prisma/schema.prisma` ファイルに、提供されたPrismaスキーマを配置します。

### 5. Dockerコンテナの起動

プロジェクトのルートディレクトリで以下のコマンドを実行します：

```bash
docker-compose up -d
```

これにより、PostgreSQLデータベース、バックエンドアプリケーション、pgAdminが起動します。

### 6. 確認

以下のURLにアクセスして、各サービスが正常に動作していることを確認します：

- バックエンドAPI: http://localhost:5000
- pgAdmin: http://localhost:5050
  - Email: admin@example.com
  - Password: admin（.envファイルで設定した値）

### 7. Prismaマイグレーションの実行

コンテナが起動したら、以下のコマンドでPrismaマイグレーションを実行します：

```bash
docker-compose exec backend npx prisma migrate dev --name init
```

これにより、データベーススキーマが作成されます。

### 8. 開発

これで開発環境のセットアップが完了しました。バックエンドのコードを編集すると、
ts-node-devによって自動的に再起動されます。

## コンテナの操作

### コンテナの停止

```bash
docker-compose stop
```

### コンテナの削除（データベースボリュームは保持）

```bash
docker-compose down
```

### コンテナとボリュームの削除（すべてのデータが失われます）

```bash
docker-compose down -v
```

### コンテナ内でのコマンド実行

```bash
# バックエンドコンテナでコマンドを実行
docker-compose exec backend npm run lint

# PostgreSQLコンテナでコマンドを実行
docker-compose exec postgres psql -U postgres -d todoapp
```

## トラブルシューティング

### コンテナが起動しない場合

ログを確認して問題を特定します：

```bash
docker-compose logs
```

特定のサービスのログのみを確認する場合：

```bash
docker-compose logs backend
```

### ポートの競合

すでに使用されているポートがある場合は、`.env`ファイルで別のポート番号を指定してください。

### データベース接続の問題

バックエンドからデータベースに接続できない場合は、`DATABASE_URL`環境変数が正しく設定されていることを確認してください。

## 次のステップ

1. バックエンドのAPIエンドポイントを実装
2. フロントエンドの開発環境をセットアップ
