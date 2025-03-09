import { Request, Response } from 'express';
import { z } from 'zod';
import { Priority } from '@prisma/client';
import { TaskService } from '../services/taskService';
import { BadRequestError } from '../middlewares/errorHandler';

// Priority型のZodバリデーション
const prioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

// タスク作成のバリデーションスキーマ
const createTaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(255, 'タイトルは255文字以内にしてください'),
  description: z.string().max(1000, '説明は1000文字以内にしてください').optional(),
  priority: prioritySchema.optional(),
  dueDate: z.string().transform((str) => (str ? new Date(str) : undefined)).optional(),
  tagIds: z.array(z.string().uuid('有効なタグIDではありません')).optional(),
});

// タスク更新のバリデーションスキーマ
const updateTaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(255, 'タイトルは255文字以内にしてください').optional(),
  description: z.string().max(1000, '説明は1000文字以内にしてください').optional().nullable(),
  completed: z.boolean().optional(),
  priority: prioritySchema.optional(),
  dueDate: z
    .string()
    .transform((str) => (str ? new Date(str) : null))
    .optional()
    .nullable(),
  tagIds: z.array(z.string().uuid('有効なタグIDではありません')).optional(),
});

// タスクのフィルタリングオプションのバリデーションスキーマ
const filterOptionsSchema = z.object({
  status: z.enum(['all', 'completed', 'incomplete']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  tagIds: z.array(z.string()).optional(),
});

/**
 * タスクコントローラー
 * タスク関連のリクエスト処理を行う
 */
export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  /**
   * ユーザーのタスク一覧を取得
   */
  async getTasks(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('認証されていません');
    }

    // クエリパラメータのバリデーション
    const queryParams = filterOptionsSchema.parse({
      status: req.query.status,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      tagIds: req.query.tagIds ? (req.query.tagIds as string).split(',') : undefined,
    });

    // タスク一覧の取得
    const result = await this.taskService.getTasks(userId, queryParams);

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  }

  /**
   * 特定のタスクを取得
   */
  async getTaskById(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('認証されていません');
    }

    const taskId = req.params.id;
    const task = await this.taskService.getTaskById(taskId, userId);

    return res.status(200).json({
      status: 'success',
      data: task,
    });
  }

  /**
   * 新しいタスクを作成
   */
  async createTask(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('認証されていません');
    }

    // リクエストボディのバリデーション
    const validatedData = createTaskSchema.parse(req.body);

    // タスクの作成
    const task = await this.taskService.createTask(userId, validatedData);

    return res.status(201).json({
      status: 'success',
      data: task,
    });
  }

  /**
   * タスクを更新
   */
  async updateTask(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('認証されていません');
    }

    const taskId = req.params.id;

    // リクエストボディのバリデーション
    const validatedData = updateTaskSchema.parse(req.body);

    // タスクの更新
    const task = await this.taskService.updateTask(taskId, userId, validatedData);

    return res.status(200).json({
      status: 'success',
      data: task,
    });
  }

  /**
   * タスクを削除
   */
  async deleteTask(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('認証されていません');
    }

    const taskId = req.params.id;

    // タスクの削除
    const result = await this.taskService.deleteTask(taskId, userId);

    return res.status(200).json({
      status: 'success',
      data: result,
    });
  }

  /**
   * タスクの完了状態を切り替え
   */
  async toggleTaskCompletion(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('認証されていません');
    }

    const taskId = req.params.id;

    // タスクの完了状態の切り替え
    const task = await this.taskService.toggleTaskCompletion(taskId, userId);

    return res.status(200).json({
      status: 'success',
      data: task,
    });
  }
}

// シングルトンインスタンスとしてエクスポート
export const taskController = new TaskController();