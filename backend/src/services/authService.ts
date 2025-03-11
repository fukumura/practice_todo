import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prismaClient';
import { BadRequestError, UnauthorizedError } from '../middlewares/errorHandler';

/**
 * ユーザー登録のDTO
 */
export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
}

/**
 * ログインのDTO
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * 認証サービス
 * ユーザー登録、ログイン、認証に関する機能を提供する
 */
export class AuthService {
  /**
   * ユーザーを新規登録する
   * @param userData - 登録するユーザー情報
   * @returns 認証情報を含むユーザー情報
   */
  async register(userData: RegisterUserDto) {
    // メールアドレスが既に使用されているか確認
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new BadRequestError('このメールアドレスは既に使用されています');
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
      },
    });

    // JWTトークンの生成
    const token = this.generateToken(user.id, user.email);

    // パスワードを除外した結果を返す
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      token,
    };
  }

  /**
   * ユーザーをログインさせる
   * @param loginData - ログイン情報
   * @returns 認証情報を含むユーザー情報
   */
  async login(loginData: LoginUserDto) {
    // メールアドレスからユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません');
    }

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('メールアドレスまたはパスワードが正しくありません');
    }

    // JWTトークンの生成
    const token = this.generateToken(user.id, user.email);

    // パスワードを除外した結果を返す
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      token,
    };
  }

  /**
   * ユーザーIDからユーザー情報を取得する
   * @param userId - ユーザーID
   * @returns ユーザー情報
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new BadRequestError('ユーザーが見つかりません');
    }

    return user;
  }

  /**
   * JWTトークンを生成する
   * @param userId - ユーザーID
   * @param email - メールアドレス
   * @returns 署名付きJWTトークン
   */
  private generateToken(userId: string, email: string): string {
    const secret = process.env.JWT_SECRET || 'default-secret';
    return jwt.sign(
      {
        id: userId,
        email,
      },
      secret,
      { expiresIn: '24h' }
    );
  }
}

// シングルトンインスタンスとしてエクスポート
export const authService = new AuthService();
