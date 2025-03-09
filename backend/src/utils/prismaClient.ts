import { PrismaClient } from '@prisma/client';

/**
 * グローバルなPrismaClientのインスタンス
 * アプリケーション全体で同じインスタンスを使用するためのシングルトンパターン
 */
const prisma = new PrismaClient({
  // 開発環境ではクエリログを有効にする
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;