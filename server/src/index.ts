import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 

dotenv.config();

const app = express();

// Cache the connection to prevent "ReplicaSetNoPrimary" errors in serverless
let isConnected = false;

const MONGO_URI = process.env.MONGO_URI || 
                  process.env.MONGODB_URI || 
                  'mongodb+srv://ibk_admin:BankPass2026@cluster0.zsj4kdb.mongodb.net/bank_app?retryWrites=true&w=majority';

app.use(cors({
  origin: ['https://ibk-finance.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// 🛡️ Robust Connection Helper
async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10s wait for Atlas re-election
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('✅ MongoDB Connected Successfully');
  } catch (err: any) {
    console.error('❌ MongoDB Connection Error:', err.message);
    throw err; 
  }
}

// ⚡ Request Middleware: Ensures DB is ready and handles Ping
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // Priority 1: Handle Ping immediately to verify server status
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
    res.status(500).json({ 
      error: "Database Connection Error", 
      message: "Server is live but could not reach the database. Check Atlas Whitelist." 
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

// 🚀 START SERVER LOCALLY ONLY
// Vercel handles the listener automatically in production
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(Number(PORT), () => {
    console.log(`🚀 Local server running on port ${PORT}`);
  });
}

export default app;