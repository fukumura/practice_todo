import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errorHandler';

/**
 * ユーザー認証情報の型定義
 */
export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Expressリクエストに認証ユーザー情報を追加
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * JWT認証ミドルウェア
 * Authorization: Bearer {token} 形式のヘッダーからユーザーを認証する
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  // ヘッダーから認証トークンを取得
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('認証トークンが必要です');
  }

  // トークンの検証
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedError('無効または期限切れのトークンです');
  }
};