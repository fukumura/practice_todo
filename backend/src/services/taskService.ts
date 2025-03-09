import { Priority } from '@prisma/client';
import prisma from '../utils/prismaClient';
import { ForbiddenError, NotFoundError } from '../middlewares/errorHandler';

/**
 * タスク作成のDTO
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  tagIds?: string[];
}

/**
 * タスク更新のDTO
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: Priority;
  dueDate?: Date | null;
  tagIds?: string[];
}

/**
 * タスクのフィルタリングオプション
 */
export interface TaskFilterOptions {
  status?: 'all' | 'completed' | 'incomplete';
  search?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
  tagIds?: string[];
}

/**
 * タスクサービス
 * タスクの作成、取得、更新、削除に関する機能を提供する
 */
export class TaskService {
  /**
   * ユーザーのタスク一覧を取得する
   * @param userId - ユーザーID
   * @param options - フィルタリングオプション
   * @returns タスク一覧とタスクの総数
   */
  async getTasks(userId: string, options: TaskFilterOptions = {}) {
    // フィルター条件の構築
    const filter: any = {
      userId,
    };

    // 完了状態によるフィルタリング
    if (options.status === 'completed') {
      filter.completed = true;
    } else if (options.status === 'incomplete') {
      filter.completed = false;
    }

    // タイトルによる検索
    if (options.search) {
      filter.title = {
        contains: options.search,
        mode: 'insensitive',
      };
    }

    // タグによるフィルタリング
    if (options.tagIds && options.tagIds.length > 0) {
      filter.tags = {
        some: {
          tagId: {
            in: options.tagIds,
          },
        },
      };
    }

    // 並び替え設定
    const orderBy: any = {};
    if (options.sortBy) {
      orderBy[options.sortBy] = options.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // タスクの取得
    const tasks = await prisma.task.findMany({
      where: filter,
      orderBy,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // タスクの総数を取得
    const total = await prisma.task.count({
      where: filter,
    });

    // タグ情報を整形して返す
    const formattedTasks = tasks.map((task) => ({
      ...task,
      tags: task.tags.map((taskTag) => taskTag.tag),
    }));

    return {
      tasks: formattedTasks,
      total,
    };
  }

  /**
   * 特定のタスクを取得する
   * @param taskId - タスクID
   * @param userId - ユーザーID
   * @returns タスク情報
   */
  async getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('タスクが見つかりません');
    }

    // タスクの所有者を確認
    if (task.userId !== userId) {
      throw new ForbiddenError('このタスクにアクセスする権限がありません');
    }

    // タグ情報を整形して返す
    return {
      ...task,
      tags: task.tags.map((taskTag) => taskTag.tag),
    };
  }

  /**
   * 新しいタスクを作成する
   * @param userId - ユーザーID
   * @param taskData - タスクデータ
   * @returns 作成されたタスク
   */
  async createTask(userId: string, taskData: CreateTaskDto) {
    // タスクの作成
    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'MEDIUM',
        dueDate: taskData.dueDate,
        userId,
      },
    });

    // タグの関連付け
    if (taskData.tagIds && taskData.tagIds.length > 0) {
      // タグの存在確認と所有者確認
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: taskData.tagIds },
          userId,
        },
      });

      // 存在するタグのIDのみを使用
      const validTagIds = tags.map((tag) => tag.id);

      // タスクとタグを関連付ける
      if (validTagIds.length > 0) {
        await prisma.taskTag.createMany({
          data: validTagIds.map((tagId) => ({
            taskId: task.id,
            tagId,
          })),
        });
      }
    }

    // 作成したタスクを取得して返す
    return this.getTaskById(task.id, userId);
  }

  /**
   * タスクを更新する
   * @param taskId - タスクID
   * @param userId - ユーザーID
   * @param taskData - 更新するタスクデータ
   * @returns 更新されたタスク
   */
  async updateTask(taskId: string, userId: string, taskData: UpdateTaskDto) {
    // タスクの存在確認と所有者確認
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw new NotFoundError('タスクが見つかりません');
    }

    if (existingTask.userId !== userId) {
      throw new ForbiddenError('このタスクを更新する権限がありません');
    }

    // タスクの更新データを準備
    const updateData: any = {};
    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description;
    if (taskData.completed !== undefined) updateData.completed = taskData.completed;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;
    if (taskData.dueDate !== undefined) updateData.dueDate = taskData.dueDate;

    // タスクの更新
    await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    // タグの更新（指定された場合）
    if (taskData.tagIds !== undefined) {
      // 既存のタグ関連を削除
      await prisma.taskTag.deleteMany({
        where: { taskId },
      });

      // 新しいタグ関連を作成
      if (taskData.tagIds.length > 0) {
        // タグの存在確認と所有者確認
        const tags = await prisma.tag.findMany({
          where: {
            id: { in: taskData.tagIds },
            userId,
          },
        });

        // 存在するタグのIDのみを使用
        const validTagIds = tags.map((tag) => tag.id);

        // タスクとタグを関連付ける
        if (validTagIds.length > 0) {
          await prisma.taskTag.createMany({
            data: validTagIds.map((tagId) => ({
              taskId,
              tagId,
            })),
          });
        }
      }
    }

    // 更新したタスクを取得して返す
    return this.getTaskById(taskId, userId);
  }

  /**
   * タスクを削除する
   * @param taskId - タスクID
   * @param userId - ユーザーID
   * @returns 削除されたタスクのID
   */
  async deleteTask(taskId: string, userId: string) {
    // タスクの存在確認と所有者確認
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw new NotFoundError('タスクが見つかりません');
    }

    if (existingTask.userId !== userId) {
      throw new ForbiddenError('このタスクを削除する権限がありません');
    }

    // 関連するタグ関連を削除
    await prisma.taskTag.deleteMany({
      where: { taskId },
    });

    // タスクの削除
    await prisma.task.delete({
      where: { id: taskId },
    });

    return { id: taskId };
  }

  /**
   * タスクの完了状態を切り替える
   * @param taskId - タスクID
   * @param userId - ユーザーID
   * @returns 更新されたタスク
   */
  async toggleTaskCompletion(taskId: string, userId: string) {
    // タスクの存在確認と所有者確認
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw new NotFoundError('タスクが見つかりません');
    }

    if (existingTask.userId !== userId) {
      throw new ForbiddenError('このタスクを更新する権限がありません');
    }

    // タスクの完了状態を反転
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed: !existingTask.completed,
      },
    });

    return this.getTaskById(updatedTask.id, userId);
  }
}

// シングルトンインスタンスとしてエクスポート
export const taskService = new TaskService();