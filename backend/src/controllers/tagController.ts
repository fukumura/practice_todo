import { Request, Response } from 'express';
import { z } from 'zod';
import { tagService } from '../services/tagService';
import { BadRequestError } from '../middlewares/errorHandler';

// タグ作成のバリデーションスキーマ
const createTagSchema = z.object({
  name: z.string().min(1, 'タグ名は必須です').max(50, 'タグ名は50文字以内にしてください'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'カラーコードは#から始まる6桁の16進数である必要があります')
    .optional(),
});

// タグ更新のバリデーションスキーマ
const updateTagSchema = z.object({
  name: z.string().min(1, 'タグ名は必須です').max(50, 'タグ名は50文字以内にしてください').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'カラーコードは#から始まる6桁の16進数である必要があります')
    .optional(),
});

/**
 * タグコントローラー
 * タグ関連のリクエスト処理を行う
 */
export class TagController {
  /**
   * ユーザーのタグ一覧を取得
   */
  async getTags(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('認証されていません');
    }

    // タグ一覧の取得
    const tags = await tagService.getTags(userId);

    return res.status(200).json({
      status: 'success',
      data: tags,
    });
  }

  /**
   * 特定のタグを取得
   */
  async getTagById(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('認証されていません');
    }

    const tagId = req.params.id;
    const tag = await tagService.getTagById(tagId, userId);

    return res.status(200).json({
      status: 'success',
      data: tag,
    });
  }

  /**
   * 新しいタグを作成
   */
  async createTag(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('認証されていません');
    }

    // リクエストボディのバリデーション
    const validatedData = createTagSchema.parse(req.body);

    // タグの作成
    const tag = await tagService.createTag(userId, validatedData);

    return res.status(201).json({
      status: 'success',
      data: tag,
    });
  }

  /**
   * タグを更新
   */
  async updateTag(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('認証されていません');
    }

    const tagId = req.params.id;

    // リクエストボディのバリデーション
    const validatedData = updateTagSchema.parse(req.body);

    // タグの更新
    const tag = await tagService.updateTag(tagId, userId, validatedData);

    return res.status(200).json({
      status: 'success',
      data: tag,
    });
  }

  /**
   * タグを削除
   */
  async deleteTag(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('認証されていません');
    }

    const tagId = req.params.id;

    // タグの削除
    const result = await tagService.deleteTag(tagId, userId);

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  }
}

// シングルトンインスタンスとしてエクスポート
export const tagController = new TagController();