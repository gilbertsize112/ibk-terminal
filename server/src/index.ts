import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'https://ibk-finance.vercel.app', 
    'http://localhost:5173',          
    'http://localhost:3000'            
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bank_app';

// Ping route
app.get('/api/ping', (req: Request, res: Response) => {
  res.status(200).json({ status: 'active' });
});

// Routes
app.use('/api/auth', authRoutes);   
app.use('/api/user', userRoutes);   
app.use('/api/admin', adminRoutes); 

app.get('/', (req: Request, res: Response) => {
  res.send('Bank Server API is running...');
});

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Global 404 handler - This will help us debug
app.use((req: Request, res: Response) => {
  console.log(`404 attempt: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Path ${req.url} not found on this server` });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(Number(PORT), () => {
    console.log(`🚀 Local Server ready on port ${PORT}`);
  });
}

export default app;