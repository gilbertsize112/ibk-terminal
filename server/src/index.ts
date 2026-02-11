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
 */
let isConnected = false;

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 
                  'mongodb+srv://ibk_admin:BankPass2026@cluster0.zsj4kdb.mongodb.net/bank_app?retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=45000&maxIdleTimeMS=60000';

app.use(cors({
  origin: ['https://ibk-finance.vercel.app', 'https://ibkbank.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
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

  // Disable buffering to prevent long hangs on Vercel
  mongoose.set('bufferCommands', false);

  console.log('🔄 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000
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
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  }

  // 2. Database Handshake for Serverless Cold Starts
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

/**
 * 🚀 Startup Logic
 * Optimized to prevent "bufferCommands" errors by connecting BEFORE listening.
 */
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    
    // Connect to DB first so it's ready for requests
    await connectToDatabase();
    
    app.listen(Number(PORT), () => {
      console.log(`🚀 Server fully ready on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Critical: Could not start server because DB connection failed.");
    
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'production') {
  startServer();
}

export default app;