import { authService } from '../../src/services/authService';
import prisma from '../../src/utils/prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { BadRequestError, UnauthorizedError } from '../../src/middlewares/errorHandler';

// モックの設定
jest.mock('../../src/utils/prismaClient', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('AuthService', () => {
  // 各テストの前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('すでに存在するメールアドレスでユーザー登録を行うとエラーを返す', async () => {
      // モックの設定
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user-id',
        email: 'existing@example.com',
      });

      // テスト対象の関数を呼び出し、例外が発生することを確認
      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'Password123',
          name: 'Test User',
        })
      ).rejects.toThrow(BadRequestError);

      // モックが正しく呼び出されたことを確認
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
      });
    });

    it('新規ユーザーを正常に登録できる', async () => {
      // モックの設定
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new-user-id',
        email: 'new@example.com',
        name: 'New User',
        password: 'hashed-password',
      });
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      // テスト対象の関数を呼び出し
      const result = await authService.register({
        email: 'new@example.com',
        password: 'Password123',
        name: 'New User',
      });

      // 期待される結果と一致するか確認
      expect(result).toEqual({
        id: 'new-user-id',
        email: 'new@example.com',
        name: 'New User',
        token: 'test-token',
      });

      // モックが正しく呼び出されたことを確認
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          password: 'hashed-password',
          name: 'New User',
        },
      });
      expect(jwt.sign).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('存在しないメールアドレスでログインを試みるとエラーを返す', async () => {
      // モックの設定
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // テスト対象の関数を呼び出し、例外が発生することを確認
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow(UnauthorizedError);

      // モックが正しく呼び出されたことを確認
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('誤ったパスワードでログインを試みるとエラーを返す', async () => {
      // モックの設定
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // テスト対象の関数を呼び出し、例外が発生することを確認
      await expect(
        authService.login({
          email: 'user@example.com',
          password: 'WrongPassword',
        })
      ).rejects.toThrow(UnauthorizedError);

      // モックが正しく呼び出されたことを確認
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('WrongPassword', 'hashed-password');
    });

    it('正しい認証情報で正常にログインできる', async () => {
      // モックの設定
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        name: 'Test User',
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      // テスト対象の関数を呼び出し
      const result = await authService.login({
        email: 'user@example.com',
        password: 'Password123',
      });

      // 期待される結果と一致するか確認
      expect(result).toEqual({
        id: 'user-id',
        email: 'user@example.com',
        name: 'Test User',
        token: 'test-token',
      });

      // モックが正しく呼び出されたことを確認
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123', 'hashed-password');
      expect(jwt.sign).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('存在するユーザーIDでユーザー情報を取得できる', async () => {
      // モックの設定
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        name: 'Test User',
        createdAt: new Date(),
      });

      // テスト対象の関数を呼び出し
      const result = await authService.getUserById('user-id');

      // 期待される結果と一致するか確認
      expect(result.id).toBe('user-id');
      expect(result.email).toBe('user@example.com');
      expect(result.name).toBe('Test User');

      // モックが正しく呼び出されたことを確認
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
    });

    it('存在しないユーザーIDでエラーを返す', async () => {
      // モックの設定
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // テスト対象の関数を呼び出し、例外が発生することを確認
      await expect(authService.getUserById('nonexistent-id')).rejects.toThrow(BadRequestError);

      // モックが正しく呼び出されたことを確認
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
        select: expect.any(Object),
      });
    });
  });
});