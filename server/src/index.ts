import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 

dotenv.config();

const app = express();

// Singleton connection state for Vercel
let isConnected = false;

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bank_app';

// CORS Configuration
app.use(cors({
  origin: ['https://ibk-finance.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// 1. 🛡️ SERVERLESS DB CONNECTION MIDDLEWARE
// Ensures MongoDB is connected before any route is processed
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return next();
  }

  try {
    console.log('🔄 Attempting MongoDB connection...');
    const db = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ Connected to MongoDB');
    next();
  } catch (err: any) {
    console.error('❌ MongoDB connection error:', err.message);
    // Don't block /ping even if DB fails, so we can still see the server is live
    if (req.url.includes('ping')) return next();
    
    res.status(500).json({ error: "Database Connection Failed", detail: err.message });
  }
});

// 2. ⚡ AGGRESSIVE PING HANDLER
// Catches /ping, /api/ping, etc. based on your Runtime Logs discovery
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url.toLowerCase().includes('ping')) {
    console.log(`🔍 Ping hit: ${req.url}`);
    return res.status(200).json({ 
      status: 'active',
      receivedUrl: req.url,
      dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      info: "Express is officially processing requests." 
    });
  }
  next();
});

// 3. Flexible Route Mounting
app.use(['/api/auth', '/auth'], authRoutes);   
app.use(['/api/user', '/user'], userRoutes);   
app.use(['/api/admin', '/admin'], adminRoutes); 

app.get('/', (req, res) => res.send('Bank Server API Online'));

// 4. Debugging 404 Handler
app.use((req: Request, res: Response) => {
  console.log(`❌ 404 on path: ${req.url}`);
  res.status(404).json({ 
    error: 'Not Found',
    path: req.url,
    msg: "If you see this, Express is live but the path is not matching routes." 
  });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(Number(PORT), () => console.log(`🚀 Port ${PORT}`));
}

export default app;