import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc ユーザー登録
 * @access Public
 */
router.post('/register', authController.register.bind(authController));

/**
 * @route POST /api/auth/login
 * @desc ユーザーログイン
 * @access Public
 */
router.post('/login', authController.login.bind(authController));

/**
 * @route GET /api/auth/me
 * @desc 現在のユーザー情報取得
 * @access Private
 */
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export { router as authRoutes };