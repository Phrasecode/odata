import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { createSchema } from './db-setup-class-based';

const PORT = process.env.port || 3000;

dotenv.config();

const app = express();

// enable cors
app.use(cors());
app.options('*', cors());

// parse JSON request bodies
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy---->' });
});

app.listen(PORT, () => {
  const dbPath = process.env.DB_PATH || 'test.db';
  createSchema(app, dbPath);
  console.log(`Server listening on port ${PORT}`);
});

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
