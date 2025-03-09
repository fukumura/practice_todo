import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';
import { errorHandler } from './middlewares/errorHandler';
import { authRoutes } from './routes/authRoutes';
import { taskRoutes } from './routes/taskRoutes';
import { tagRoutes } from './routes/tagRoutes';

const app = express();

// ミドルウェアの設定
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// ヘルスチェック用エンドポイント
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// APIドキュメント用の基本情報
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'TODO App API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      tags: '/api/tags',
    },
  });
});

// ルートの設定
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tags', tagRoutes);

// 404エラーハンドリング
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'リクエストされたリソースが見つかりません',
  });
});

// エラーハンドリングミドルウェア
app.use(errorHandler);

export default app;