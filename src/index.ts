import express from 'express';
import type { Application } from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/UserRoutes/userRoutes.ts';
import jobRoutes from './routes/JobRoutes/jobRoutes.ts';

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/job', jobRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Job Scheduler with Kafka - Ready for millions users!' });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log('📧 Run `npm run consumer` in new terminal for job processing');
  console.log('🐳 Kafka: docker compose -f docker-compose-kafka.yml up -d');
});
