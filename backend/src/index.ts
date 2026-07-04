import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import businessRoutes from './routes/business.routes';
import boardroomRoutes from './routes/boardroom.routes';
import kpiRoutes from './routes/kpi.routes';
import strategyRoutes from './routes/strategy.routes';
import copilotRoutes from './routes/copilot.routes';
import contentRoutes from './routes/content.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'GrowthOS Backend Running ✅' }));

// Routes
app.use('/api/business', businessRoutes);
app.use('/api/boardroom', boardroomRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/strategy', strategyRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/content', contentRoutes);

// Start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 GrowthOS Backend running on port ${PORT}`);
  });
});

export default app;
