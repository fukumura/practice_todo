import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 環境変数の設定
dotenv.config({ path: '.env.test' });

// テスト用のPrismaクライアント
const prisma = new PrismaClient();

// すべてのテストの前に実行
beforeAll(async () => {
  // テストデータベースのセットアップ
  // 必要に応じてテストデータの初期化などを行う
});

// すべてのテストの後に実行
afterAll(async () => {
  // テストデータベースのクリーンアップ
  await prisma.$disconnect();
});
