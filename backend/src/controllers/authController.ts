import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';

// ユーザー登録のバリデーションスキーマ
const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .regex(/[a-z]/, 'パスワードは少なくとも1つの小文字を含む必要があります')
    .regex(/[A-Z]/, 'パスワードは少なくとも1つの大文字を含む必要があります')
    .regex(/[0-9]/, 'パスワードは少なくとも1つの数字を含む必要があります'),
  name: z.string().min(1, '名前は必須です').max(100, '名前は100文字以内である必要があります'),
});

// ログインのバリデーションスキーマ
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードは必須です'),
});

/**
 * 認証コントローラー
 * 認証関連のリクエスト処理を行う
 */
export class AuthController {
  /**
   * ユーザー登録処理
   */
  async register(req: Request, res: Response) {
    // リクエストボディのバリデーション
    const validatedData = registerSchema.parse(req.body);

    // ユーザー登録サービスの呼び出し
    const result = await authService.register(validatedData);

    // 登録成功レスポンスの返却
    return res.status(201).json({
      status: 'success',
      data: result,
    });
  }

  /**
   * ログイン処理
   */
  async login(req: Request, res: Response) {
    // リクエストボディのバリデーション
    const validatedData = loginSchema.parse(req.body);

    // ログインサービスの呼び出し
    const result = await authService.login(validatedData);

    // ログイン成功レスポンスの返却
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  }

  /**
   * 現在のユーザー情報取得処理
   */
  async getCurrentUser(req: Request, res: Response) {
    // 認証済みユーザーIDを取得
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: '認証されていません',
      });
    }

    // ユーザー情報の取得
    const user = await authService.getUserById(userId);

    // ユーザー情報の返却
    return res.status(200).json({
      status: 'success',
      data: user,
    });
  }
}

// シングルトンインスタンスとしてエクスポート
export const authController = new AuthController();