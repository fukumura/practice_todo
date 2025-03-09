import { Router } from 'express';
import { tagController } from '../controllers/tagController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// すべてのタグ関連ルートに認証ミドルウェアを適用
router.use(authenticate);

/**
 * @route GET /api/tags
 * @desc タグ一覧の取得
 * @access Private
 */
router.get('/', tagController.getTags.bind(tagController));

/**
 * @route GET /api/tags/:id
 * @desc 特定のタグを取得
 * @access Private
 */
router.get('/:id', tagController.getTagById.bind(tagController));

/**
 * @route POST /api/tags
 * @desc 新しいタグを作成
 * @access Private
 */
router.post('/', tagController.createTag.bind(tagController));

/**
 * @route PUT /api/tags/:id
 * @desc タグを更新
 * @access Private
 */
router.put('/:id', tagController.updateTag.bind(tagController));

/**
 * @route DELETE /api/tags/:id
 * @desc タグを削除
 * @access Private
 */
router.delete('/:id', tagController.deleteTag.bind(tagController));

export { router as tagRoutes };