# バックエンドテストガイド

このディレクトリには、TODOアプリバックエンドのテストコードが含まれています。テストは単体テストと統合テストの2種類に分かれています。

## テストの種類

### 単体テスト

単体テストは、アプリケーションの個々のコンポーネントが独立して正しく動作することを確認するためのテストです。外部依存関係はモック化されます。

- `services/`: サービス層のビジネスロジックをテスト
- `routes/`: ルート処理のテスト（コントローラーとルートの連携）

### 統合テスト

統合テストは、複数のコンポーネントが連携して正しく動作することを確認するためのテストです。実際のデータベースに接続して行われます。

- `integration/`: エンドツーエンドのAPI動作をテスト

## テスト実行方法

### すべてのテストを実行

```bash
npm test
```

### 単体テストのみ実行

```bash
npm run test:unit
```

### 統合テストのみ実行

```bash
npm run test:integration
```

### 特定のテストファイルを実行

```bash
npm test -- tests/services/authService.test.ts
```

### 監視モードでテストを実行（変更を検知して自動実行）

```bash
npm run test:watch
```

### カバレッジレポートを生成

```bash
npm run test:coverage
```

## テスト環境セットアップ

テストを実行する前に、テスト用の環境を正しく設定する必要があります。

### テスト用環境変数

テスト用の環境変数は `.env.test` ファイルに定義されています。このファイルには以下の設定が含まれています：

```
# テスト用環境変数
NODE_ENV=test
PORT=5001

# テスト用データベース
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todoapp_test

# JWT設定
JWT_SECRET=test-secret-key
```

### テスト用データベース

統合テストを実行するには、テスト用のデータベースが必要です。

```bash
# テスト用データベースの作成
npx prisma db push --schema=prisma/schema.prisma --env-file=.env.test

# 必要に応じてテストデータのシード
npx ts-node prisma/seed.ts
```

## テスト作成のガイドライン

### 単体テスト

1. 各モジュールごとにテストファイルを作成してください。
2. 外部依存関係（Prisma、JWT、bcryptなど）は常にモック化してください。
3. 各テストケースは独立して実行できるようにしてください。
4. 境界条件とエラーケースを必ずテストしてください。

### 統合テスト

1. テストの前後でデータベースをクリーンアップしてください。
2. 実際のHTTPリクエストとレスポンスを使用してテストしてください。
3. 認証が必要なエンドポイントには有効なJWTトークンを使用してください。
4. テスト間で影響し合わないように、一意のテストデータを使用してください。

## モック化の例

```typescript
// Prismaクライアントのモック
jest.mock('../../src/utils/prismaClient', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

// JWT検証のモック
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ id: 'test-user-id' }),
  sign: jest.fn().mockReturnValue('test-token'),
}));

// bcryptのモック
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
}));
```

## トラブルシューティング

### よくある問題と解決策

1. **テストデータベース接続エラー**
   - `.env.test` の `DATABASE_URL` が正しく設定されているか確認してください。
   - テストデータベースが実行中か確認してください。

2. **認証エラー**
   - JWT検証がモック化されているか確認してください。
   - 統合テストでは有効なトークンが使用されているか確認してください。

3. **テストの競合**
   - 並行して実行されるテスト間でデータの競合が発生していないか確認してください。
   - 各テストで一意のテストデータを使用してください。

4. **テスト実行が遅い**
   - 統合テストが多すぎないか確認してください。
   - 各テストがデータベースをリセットしているか確認してください。

5. **モックが機能しない**
   - モックが正しい場所に配置されているか確認してください。
   - Jest設定が正しいか確認してください。