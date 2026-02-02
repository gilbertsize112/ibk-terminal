import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 

dotenv.config();

const app = express();

// Cache the connection to prevent "ReplicaSetNoPrimary" and Timeout errors
let isConnected = false;

// Added production-specific timeout parameters to the URI fallback
const MONGO_URI = process.env.MONGO_URI || 
                  process.env.MONGODB_URI || 
                  'mongodb+srv://ibk_admin:BankPass2026@cluster0.zsj4kdb.mongodb.net/bank_app?retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=45000';

app.use(cors({
  origin: ['https://ibk-finance.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// 🛡️ Enhanced Serverless Connection Helper
async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  // CRITICAL for Vercel: Fail fast if the DB is unreachable 
  // instead of buffering and timing out the function.
  mongoose.set('bufferCommands', false);

  console.log('🔄 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // Wait 15s for Atlas 
      connectTimeoutMS: 30000,        // 30s for the initial connection
      socketTimeoutMS: 45000,         // 45s for inactivity
    });
    
    isConnected = true;
    console.log('✅ MongoDB Connected Successfully');
  } catch (err: any) {
    isConnected = false;
    console.error('❌ MongoDB Connection Error:', err.message);
    throw err; 
  }
}

// ⚡ Request Middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // Priority 1: Instant Ping (Does not wait for DB)
  if (req.url.toLowerCase().includes('ping')) {
    return res.status(200).json({ 
      status: 'active',
      db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting...',
      timestamp: new Date().toISOString()
    });
  }

  // Priority 2: Ensure DB is connected for all other requests
  try {
    await connectToDatabase();
    next();
  } catch (err: any) {
    // If DB fails, send a clear error so Vercel doesn't just hang
    res.status(503).json({ 
      error: "Database Unavailable", 
      message: err.message,
      hint: "Check if MongoDB Atlas is under heavy load or IP whitelist is correct."
    });
  }
});

// Routes
app.use(['/api/auth', '/auth'], authRoutes);   
app.use(['/api/user', '/user'], userRoutes);   
app.use(['/api/admin', '/admin'], adminRoutes); 

app.get('/', (req, res) => res.status(200).send('Bank Server API Online'));

// 404 Catch-all
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found', path: req.url });
});

// 🚀 Start locally only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(Number(PORT), () => {
    console.log(`🚀 Local server running on port ${PORT}`);
  });
}

export default app;