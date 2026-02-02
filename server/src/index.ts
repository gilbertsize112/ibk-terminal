import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 

dotenv.config();

const app = express();

// CORS Configuration
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

// 1. Updated Ping Route (Flexible Path)
app.get(['/api/ping', '/ping'], (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'active',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 2. Flexible Route Mounting
// This ensures routes work even if Vercel rewrites strip the /api prefix
app.use(['/api/auth', '/auth'], authRoutes);   
app.use(['/api/user', '/user'], userRoutes);   
app.use(['/api/admin', '/admin'], adminRoutes); 

// Base Route
app.get('/', (req: Request, res: Response) => {
  res.send('Bank Server API is running correctly...');
});

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 3. Enhanced Global 404 handler for debugging
app.use((req: Request, res: Response) => {
  console.log(`404 detected: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.url,
    method: req.method,
    message: "If you see this, the server is live but the route path is mismatching."
  });
});

// Port listener (Only for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(Number(PORT), () => {
    console.log(`🚀 Local Server ready on port ${PORT}`);
  });
}

// Crucial for Vercel: Export the app
export default app;