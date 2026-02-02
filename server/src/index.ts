import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 

dotenv.config();

const app = express();

// Global variable to cache the MongoDB connection across serverless invocations
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

// 1. 🛡️ IMPROVED SERVERLESS DB CONNECTION
async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  console.log('🔄 Attempting MongoDB connection...');
  try {
    const db = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000, // Slightly longer for cold starts
      socketTimeoutMS: 45000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ Connected to MongoDB');
  } catch (err: any) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err; // Let the middleware handle the response
  }
}

// 2. ⚡ UNIVERSAL REQUEST HANDLER
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // A. Log every single request for debugging
  console.log(`🔍 Incoming: ${req.method} ${req.url}`);

  // B. Handle PING immediately (Before DB or Routes)
  // This solves the /api/ping vs /ping mismatch discovered in logs
  if (req.url.toLowerCase().includes('ping')) {
    return res.status(200).json({ 
      status: 'active',
      receivedUrl: req.url,
      dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      serverTime: new Date().toISOString()
    });
  }

  // C. Connect to DB for all other requests
  try {
    await connectToDatabase();
    next();
  } catch (err: any) {
    res.status(500).json({ 
      error: "Database Connection Failed", 
      message: err.message,
      suggestion: "Check MongoDB Atlas IP Whitelist (0.0.0.0/0)"
    });
  }
});

// 3. Route Mounting
app.use(['/api/auth', '/auth'], authRoutes);   
app.use(['/api/user', '/user'], userRoutes);   
app.use(['/api/admin', '/admin'], adminRoutes); 

app.get('/', (req, res) => {
  res.status(200).send('Bank Server API Online');
});

// 4. Debugging 404 Handler
app.use((req: Request, res: Response) => {
  console.log(`❌ 404 Failure: ${req.url}`);
  res.status(404).json({ 
    error: 'Not Found',
    path: req.url,
    hint: "If the path looks correct, check your vercel.json rewrites." 
  });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(Number(PORT), () => console.log(`🚀 Port ${PORT}`));
}

export default app;