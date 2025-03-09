import { taskService } from '../../src/services/taskService';
import prisma from '../../src/utils/prismaClient';
import { NotFoundError, ForbiddenError } from '../../src/middlewares/errorHandler';

// モックの設定
jest.mock('../../src/utils/prismaClient', () => ({
  task: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  taskTag: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  tag: {
    findMany: jest.fn(),
  },
}));

describe('TaskService', () => {
  // 各テストの前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const userId = 'test-user-id';
  const taskId = 'test-task-id';

  describe('getTasks', () => {
    it('ユーザーのタスク一覧を正常に取得できる', async () => {
      // モックの設定
      (prisma.task.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'task-1',
          title: 'タスク1',
          description: '説明1',
          completed: false,
          tags: [],
        },
        {
          id: 'task-2',
          title: 'タスク2',
          description: '説明2',
          completed: true,
          tags: [],
        },
      ]);
      (prisma.task.count as jest.Mock).mockResolvedValue(2);

      // テスト対象の関数を呼び出し
      const result = await taskService.getTasks(userId);

      // 期待される結果と一致するか確認
      expect(result.tasks.length).toBe(2);
      expect(result.total).toBe(2);

      // モックが正しく呼び出されたことを確認
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
        })
      );
      expect(prisma.task.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
        })
      );
    });

    it('フィルタリングとソートを適用したタスク一覧を取得できる', async () => {
      // モックの設定
      (prisma.task.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'task-1',
          title: '重要なタスク',
          description: '説明',
          completed: false,
          priority: 'HIGH',
          tags: [],
        },
      ]);
      (prisma.task.count as jest.Mock).mockResolvedValue(1);

      // テスト対象の関数を呼び出し
      const result = await taskService.getTasks(userId, {
        status: 'incomplete',
        search: '重要',
        sortBy: 'priority',
        sortOrder: 'desc',
      });

      // 期待される結果と一致するか確認
      expect(result.tasks.length).toBe(1);
      expect(result.total).toBe(1);

      // モックが正しく呼び出されたことを確認
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            completed: false,
            title: expect.objectContaining({
              contains: '重要',
            }),
          }),
          orderBy: { priority: 'desc' },
        })
      );
    });
  });

  describe('getTaskById', () => {
    it('存在するタスクIDでタスク情報を取得できる', async () => {
      // モックの設定
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        title: 'テストタスク',
        description: 'テスト説明',
        userId: userId,
        tags: [],
      });

      // テスト対象の関数を呼び出し
      const result = await taskService.getTaskById(taskId, userId);

      // 期待される結果と一致するか確認
      expect(result.id).toBe(taskId);
      expect(result.title).toBe('テストタスク');

      // モックが正しく呼び出されたことを確認
      expect(prisma.task.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: taskId },
        })
      );
    });

    it('存在しないタスクIDでエラーを返す', async () => {
      // モックの設定
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      // テスト対象の関数を呼び出し、例外が発生することを確認
      await expect(taskService.getTaskById('nonexistent-id', userId)).rejects.toThrow(NotFoundError);
    });

    it('他のユーザーのタスクへのアクセスでエラーを返す', async () => {
      // モックの設定
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        title: 'テストタスク',
        userId: 'other-user-id',
        tags: [],
      });

      // テスト対象の関数を呼び出し、例外が発生することを確認
      await expect(taskService.getTaskById(taskId, userId)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('createTask', () => {
    it('新規タスクを正常に作成できる', async () => {
      // モックの設定
      (prisma.task.create as jest.Mock).mockResolvedValue({
        id: 'new-task-id',
        title: '新しいタスク',
        description: '説明',
        priority: 'MEDIUM',
        userId,
      });
      // getTaskByIdのモック
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: 'new-task-id',
        title: '新しいタスク',
        description: '説明',
        priority: 'MEDIUM',
        userId,
        tags: [],
      });

      // テスト対象の関数を呼び出し
      const result = await taskService.createTask(userId, {
        title: '新しいタスク',
        description: '説明',
      });

      // 期待される結果と一致するか確認
      expect(result.id).toBe('new-task-id');
      expect(result.title).toBe('新しいタスク');

      // モックが正しく呼び出されたことを確認
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: '新しいタスク',
          description: '説明',
          priority: 'MEDIUM',
          userId,
        }),
      });
    });

    it('タグ付きで新規タスクを作成できる', async () => {
      // モックの設定
      (prisma.task.create as jest.Mock).mockResolvedValue({
        id: 'new-task-id',
        title: 'タグ付きタスク',
        userId,
      });
      (prisma.tag.findMany as jest.Mock).mockResolvedValue([
        { id: 'tag-1', name: 'タグ1' },
        { id: 'tag-2', name: 'タグ2' },
      ]);
      // getTaskByIdのモック
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: 'new-task-id',
        title: 'タグ付きタスク',
        userId,
        tags: [
          { tag: { id: 'tag-1', name: 'タグ1' } },
          { tag: { id: 'tag-2', name: 'タグ2' } },
        ],
      });

      // テスト対象の関数を呼び出し
      const result = await taskService.createTask(userId, {
        title: 'タグ付きタスク',
        tagIds: ['tag-1', 'tag-2'],
      });

      // 期待される結果と一致するか確認
      expect(result.id).toBe('new-task-id');
      expect(result.tags.length).toBe(2);

      // モックが正しく呼び出されたことを確認
      expect(prisma.task.create).toHaveBeenCalled();
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['tag-1', 'tag-2'] },
          userId,
        },
      });
      expect(prisma.taskTag.createMany).toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    it('タスクを正常に更新できる', async () => {
      // モックの設定
      (prisma.task.findUnique as jest.Mock).mockImplementation((args) => {
        // 初回呼び出し（updateTask内での存在確認用）
        if (args.include === undefined) {
          return Promise.resolve({
            id: taskId,
            title: '元のタスク',
            userId,
          });
        }
        // 2回目呼び出し（getTaskById内での取得用）
        return Promise.resolve({
          id: taskId,
          title: '更新されたタスク',
          completed: true,
          userId,
          tags: [],
        });
      });

      (prisma.task.update as jest.Mock).mockResolvedValue({
        id: taskId,
        title: '更新されたタスク',
        completed: true,
        userId,
      });

      // テスト対象の関数を呼び出し
      const result = await taskService.updateTask(taskId, userId, {
        title: '更新されたタスク',
        completed: true,
      });

      // 期待される結果と一致するか確認
      expect(result.title).toBe('更新されたタスク');
      expect(result.completed).toBe(true);

      // モックが正しく呼び出されたことを確認
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: expect.objectContaining({
          title: '更新されたタスク',
          completed: true,
        }),
      });
    });

    it('他のユーザーのタスク更新でエラーを返す', async () => {
      // モックの設定
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        title: '他のユーザーのタスク',
        userId: 'other-user-id',
      });

      // テスト対象の関数を呼び出し、例外が発生することを確認
      await expect(
        taskService.updateTask(taskId, userId, {
          title: '更新しようとしたタイトル',
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteTask', () => {
    it('タスクを正常に削除できる', async () => {
      // モックの設定
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        title: '削除予定のタスク',
        userId,
      });
      (prisma.task.delete as jest.Mock).mockResolvedValue({
        id: taskId,
      });

      // テスト対象の関数を呼び出し
      const result = await taskService.deleteTask(taskId, userId);

      // 期待される結果と一致するか確認
      expect(result.id).toBe(taskId);

      // モックが正しく呼び出されたことを確認
      expect(prisma.taskTag.deleteMany).toHaveBeenCalledWith({
        where: { taskId },
      });
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });

    it('他のユーザーのタスク削除でエラーを返す', async () => {
      // モックの設定
      (prisma.task.findUnique as jest.Mock).mockResolvedValue({
        id: taskId,
        title: '他のユーザーのタスク',
        userId: 'other-user-id',
      });

      // テスト対象の関数を呼び出し、例外が発生することを確認
      await expect(taskService.deleteTask(taskId, userId)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('toggleTaskCompletion', () => {
    it('タスクの完了状態を正常に切り替えられる', async () => {
      // モックの設定
      (prisma.task.findUnique as jest.Mock).mockImplementation((args) => {
        // 初回呼び出し（toggleTaskCompletion内での存在確認用）
        if (args.include === undefined) {
          return Promise.resolve({
            id: taskId,
            title: 'タスク',
            completed: false,
            userId,
          });
        }
        // 2回目呼び出し（getTaskById内での取得用）
        return Promise.resolve({
          id: taskId,
          title: 'タスク',
          completed: true,
          userId,
          tags: [],
        });
      });

      (prisma.task.update as jest.Mock).mockResolvedValue({
        id: taskId,
        title: 'タスク',
        completed: true,
        userId,
      });

      // テスト対象の関数を呼び出し
      const result = await taskService.toggleTaskCompletion(taskId, userId);

      // 期待される結果と一致するか確認
      expect(result.completed).toBe(true);

      // モックが正しく呼び出されたことを確認
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { completed: true },
      });
    });
  });
});