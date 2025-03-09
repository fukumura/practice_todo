import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * APIエラーの基本クラス
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * リソースが見つからない場合のエラー
 */
export class NotFoundError extends ApiError {
  constructor(message = 'リソースが見つかりません') {
    super(message, 404);
  }
}

/**
 * 認証が必要な場合のエラー
 */
export class UnauthorizedError extends ApiError {
  constructor(message = '認証が必要です') {
    super(message, 401);
  }
}

/**
 * 権限がない場合のエラー
 */
export class ForbiddenError extends ApiError {
  constructor(message = '権限がありません') {
    super(message, 403);
  }
}

/**
 * 不正なリクエストの場合のエラー
 */
export class BadRequestError extends ApiError {
  constructor(message = '不正なリクエストです') {
    super(message, 400);
  }
}

/**
 * グローバルエラーハンドラー
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  console.error('Error:', err);

  // Zodバリデーションエラーの処理
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      status: 'error',
      message: 'バリデーションエラー',
      errors,
    });
  }

  // Prismaエラーの処理
  if (err instanceof PrismaClientKnownRequestError) {
    // ユニーク制約違反
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || ['不明なフィールド'];
      return res.status(409).json({
        status: 'error',
        message: `${target.join(', ')}は既に使用されています`,
      });
    }

    // 外部キー制約違反
    if (err.code === 'P2003') {
      return res.status(400).json({
        status: 'error',
        message: '関連するリソースが存在しません',
      });
    }

    // レコードが見つからない
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'リソースが見つかりません',
      });
    }
  }

  // APIエラーの処理
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // その他の予期しないエラー
  return res.status(500).json({
    status: 'error',
    message: '内部サーバーエラー',
  });
};