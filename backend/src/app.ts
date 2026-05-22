import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import apiRouter, { setDatabaseConnected } from './routes/api';
import { errorHandler, rateLimiter } from './middleware/auth';

// Load Environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors({
  origin: '*', // For local dev, allows all cross-origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply IP Rate Limiting to secure API endpoints
app.use(rateLimiter);

// API Routes Mounting
app.use('/api', apiRouter);

// Health Check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    time: new Date(),
    databaseConnected: mongoose.connection.readyState === 1
  });
});

// Central Error Handler Middleware
app.use(errorHandler);

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/simplifier';

console.log('🔌 Connecting to MongoDB at:', MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully.');
    setDatabaseConnected(true);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️ Running backend in Resilient Offline Mode (using in-memory Mock DB fallback).');
    setDatabaseConnected(false);
  });

// Start Server
app.listen(PORT, () => {
  console.log(`🌌 AI Article Simplifier Server running on: http://localhost:${PORT}`);
});

export default app;
