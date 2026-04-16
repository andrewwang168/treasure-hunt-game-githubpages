import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db';
import authRouter from './routes/auth';
import scoresRouter from './routes/scores';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/scores', scoresRouter);

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
