import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 

dotenv.config();

const app = express();

/**
 * 🛡️ MONGOOSE SINGLETON CACHE
 * Prevents "Socket Timeout" and "Too many connections" on Vercel
 */
let isConnected = false;

const MONGO_URI = process.env.MONGO_URI || 
                  'mongodb+srv://ibk_admin:BankPass2026@cluster0.zsj4kdb.mongodb.net/bank_app?retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=45000&maxIdleTimeMS=60000';

app.use(cors({
  origin: ['https://ibk-finance.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

/**
 * 🛠️ Robust Database Connection
 */
async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  // CRITICAL: Disable buffering to avoid the 3-minute hang
  mongoose.set('bufferCommands', false);

  console.log('🔄 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // Fail after 15s if Atlas is unreachable
      connectTimeoutMS: 30000,        // 30s limit for initial handshake
      socketTimeoutMS: 45000,         // Close inactive sockets
      heartbeatFrequencyMS: 10000     // Keep the connection alive
    });
    
    isConnected = true;
    console.log('✅ MongoDB Connected Successfully');
  } catch (err: any) {
    isConnected = false;
    console.error('❌ MongoDB Connection Error:', err.message);
    throw err; 
  }
}

/**
 * ⚡ Request Middleware
 */
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // 1. Instant Ping for Health Checks
  if (req.url.toLowerCase().includes('ping')) {
    return res.status(200).json({ 
      status: 'active',
      db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting...',
      timestamp: new Date().toISOString()
    });
  }

  // 2. Database Handshake
  try {
    await connectToDatabase();
    next();
  } catch (err: any) {
    res.status(503).json({ 
      error: "Database Unavailable", 
      message: err.message 
    });
  }
});

// Routes
app.use(['/api/auth', '/auth'], authRoutes);   
app.use(['/api/user', '/user'], userRoutes);   
app.use(['/api/admin', '/admin'], adminRoutes); 

app.get('/', (req, res) => res.status(200).send('Bank Server API Online'));

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.url });
});

// 🚀 Local Development Listener
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(Number(PORT), () => {
    console.log(`🚀 Local server running on port ${PORT}`);
  });
}

export default app;