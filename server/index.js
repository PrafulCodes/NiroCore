import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import subscriptionRoutes from './routes/subscriptions.js';
import ocrRoutes from './routes/ocr.js';
import remindersRoutes from './routes/reminders.js';

import errorHandler from './middleware/errorHandler.js';
import { startScheduler } from './scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Request Logging
app.use(morgan('dev'));

// Hardened CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting Config
const ocrLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many OCR requests. Wait a minute.' },
});

const reminderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
});

import prisma from './lib/prisma.js';

// Health check + Testing
app.get('/api/health', async (req, res) => {
  let dbStatus = 'error';
  try {
    await prisma.subscription.count();
    dbStatus = 'connected';
  } catch (err) {
    console.error('Database connection test failed:', err);
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    scheduler: 'running',
    timestamp: new Date(),
    version: '1.0.0',
  });
});

app.get('/api/demo/reset', async (req, res) => {
  try {
    // Clean down in order to avoid foreign key errors potentially (though schema triggers mostly handle it)
    await prisma.reminderLog.deleteMany({});
    await prisma.subscription.deleteMany({});
    res.json({ cleared: true });
  } catch (err) {
    console.error('Demo reset failed:', err);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// Routes with Rate Limits applied where necessary
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ocr/extract', ocrLimiter);
app.use('/api/ocr', ocrRoutes);
app.use('/api/reminders/trigger', reminderLimiter);
app.use('/api/reminders', remindersRoutes);

// Not Found Handler (404)
app.use((req, res) => {
  res.status(404).json({ 
    error: `Route ${req.path} not found.` 
  });
});

// Global Error Handler (must be LAST)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`NiroCore server running on http://localhost:${PORT}`);
  startScheduler();
});

export default app;
