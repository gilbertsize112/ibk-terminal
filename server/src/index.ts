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

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bank_app';

// 1. Bulletproof Ping Route
// This matches /api/ping, /ping, or even /src/index/api/ping
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url.endsWith('/ping')) {
    return res.status(200).json({ 
      status: 'active',
      receivedUrl: req.url,
      method: req.method
    });
  }
  next();
});

// 2. Flexible Route Mounting
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

// 3. Global 404 handler with Path Debugging
app.use((req: Request, res: Response) => {
  console.log(`404 error at: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.url,
    message: "Check Vercel logs to see the actual path received by Express."
  });
});

// Port listener for local only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(Number(PORT), () => {
    console.log(`🚀 Local Server ready on port ${PORT}`);
  });
}

export default app;