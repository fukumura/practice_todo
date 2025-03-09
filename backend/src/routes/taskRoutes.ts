import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// すべてのタスク関連ルートに認証ミドルウェアを適用
router.use(authenticate);

/**
 * @route GET /api/tasks
 * @desc タスク一覧の取得
 * @access Private
 */
router.get('/', taskController.getTasks.bind(taskController));

/**
 * @route GET /api/tasks/:id
 * @desc 特定のタスクを取得
 * @access Private
 */
router.get('/:id', taskController.getTaskById.bind(taskController));

/**
 * @route POST /api/tasks
 * @desc 新しいタスクを作成
 * @access Private
 */
router.post('/', taskController.createTask.bind(taskController));

/**
 * @route PUT /api/tasks/:id
 * @desc タスクを更新
 * @access Private
 */
router.put('/:id', taskController.updateTask.bind(taskController));

/**
 * @route DELETE /api/tasks/:id
 * @desc タスクを削除
 * @access Private
 */
router.delete('/:id', taskController.deleteTask.bind(taskController));

/**
 * @route PATCH /api/tasks/:id/toggle
 * @desc タスクの完了状態を切り替え
 * @access Private
 */
router.patch('/:id/toggle', taskController.toggleTaskCompletion.bind(taskController));

export { router as taskRoutes };