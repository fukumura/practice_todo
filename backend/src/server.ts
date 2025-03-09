import dotenv from 'dotenv';
import app from './app';

// 環境変数のロード
dotenv.config();

const PORT = process.env.PORT || 5000;

// サーバーの起動
app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});