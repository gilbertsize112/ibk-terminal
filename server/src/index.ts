import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 

dotenv.config();

const app = express();

// ✅ UPDATED MIDDLEWARE: Explicitly allow your frontend
app.use(cors({
  origin: [
    'https://ibk-finance.vercel.app', // Your new live frontend
    'http://localhost:5173',          // Your local dev environment
    'http://localhost:3000'           // Alternative local port
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bank_app';

// Routes
app.use('/api/auth', authRoutes);   // For Signup & Login
app.use('/api/user', userRoutes);   // For Balance/Transactions
app.use('/api/admin', adminRoutes); // Admin Dashboard actions

app.get('/', (req: Request, res: Response) => {
  res.send('Bank Server API is running...');
});

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// This allows the app to still run locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(Number(PORT), () => {
    console.log(`🚀 Local Server ready on port ${PORT}`);
  });
}

// CRITICAL FOR VERCEL: Export the app
export default app;