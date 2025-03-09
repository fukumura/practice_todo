// backend/src/server.ts
import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});
