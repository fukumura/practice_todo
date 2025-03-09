import prisma from '../utils/prismaClient';
import { ForbiddenError, NotFoundError } from '../middlewares/errorHandler';

/**
 * タグ作成のDTO
 */
export interface CreateTagDto {
  name: string;
  color?: string;
}

/**
 * タグ更新のDTO
 */
export interface UpdateTagDto {
  name?: string;
  color?: string;
}

/**
 * タグサービス
 * タグの作成、取得、更新、削除に関する機能を提供する
 */
export class TagService {
  /**
   * ユーザーのタグ一覧を取得する
   * @param userId - ユーザーID
   * @returns タグ一覧
   */
  async getTags(userId: string) {
    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    return tags;
  }

  /**
   * 特定のタグを取得する
   * @param tagId - タグID
   * @param userId - ユーザーID
   * @returns タグ情報
   */
  async getTagById(tagId: string, userId: string) {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundError('タグが見つかりません');
    }

    // タグの所有者を確認
    if (tag.userId !== userId) {
      throw new ForbiddenError('このタグにアクセスする権限がありません');
    }

    return tag;
  }

  /**
   * 新しいタグを作成する
   * @param userId - ユーザーID
   * @param tagData - タグデータ
   * @returns 作成されたタグ
   */
  async createTag(userId: string, tagData: CreateTagDto) {
    try {
      // タグの作成
      const tag = await prisma.tag.create({
        data: {
          name: tagData.name,
          color: tagData.color || '#CCCCCC',
          userId,
        },
      });

      return tag;
    } catch (error) {
      // ユニーク制約違反の場合（同じ名前のタグが既に存在する場合）
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ForbiddenError('このタグ名は既に使用されています');
      }
      throw error;
    }
  }

  /**
   * タグを更新する
   * @param tagId - タグID
   * @param userId - ユーザーID
   * @param tagData - 更新するタグデータ
   * @returns 更新されたタグ
   */
  async updateTag(tagId: string, userId: string, tagData: UpdateTagDto) {
    // タグの存在確認と所有者確認
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!existingTag) {
      throw new NotFoundError('タグが見つかりません');
    }

    if (existingTag.userId !== userId) {
      throw new ForbiddenError('このタグを更新する権限がありません');
    }

    try {
      // 更新するデータを準備
      const updateData: any = {};
      if (tagData.name !== undefined) updateData.name = tagData.name;
      if (tagData.color !== undefined) updateData.color = tagData.color;

      // タグの更新
      const updatedTag = await prisma.tag.update({
        where: { id: tagId },
        data: updateData,
      });

      return updatedTag;
    } catch (error) {
      // ユニーク制約違反の場合（同じ名前のタグが既に存在する場合）
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ForbiddenError('このタグ名は既に使用されています');
      }
      throw error;
    }
  }

  /**
   * タグを削除する
   * @param tagId - タグID
   * @param userId - ユーザーID
   * @returns 削除されたタグのID
   */
  async deleteTag(tagId: string, userId: string) {
    // タグの存在確認と所有者確認
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!existingTag) {
      throw new NotFoundError('タグが見つかりません');
    }

    if (existingTag.userId !== userId) {
      throw new ForbiddenError('このタグを削除する権限がありません');
    }

    // タグとタスクの関連を削除
    await prisma.taskTag.deleteMany({
      where: { tagId },
    });

    // タグの削除
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return { id: tagId };
  }
}

// シングルトンインスタンスとしてエクスポート
export const tagService = new TagService();