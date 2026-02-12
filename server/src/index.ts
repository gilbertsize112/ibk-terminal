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

// --- UPDATED CORS CONFIGURATION ---
const allowedOrigins = [
  'https://beacontrust-finance.vercel.app', 
  'https://ibk-finance.vercel.app', 
  'https://ibkbank.vercel.app', 
  'http://localhost:5173', 
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS Policy: Origin not allowed'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Handle preflight requests globally
app.options('*', cors()); 

app.use(express.json());

/**
 * 🛠️ Robust Database Connection
 */
async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  mongoose.set('bufferCommands', false);

  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Attempting MongoDB Connection...');
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
      });
      isConnected = true;
      console.log('✅ MongoDB Connected Successfully');
    }
  } catch (err: any) {
    isConnected = false;
    console.error('❌ MongoDB Connection Error:', err.message);
    if (process.env.NODE_ENV === 'production') throw err;
  }
}

/**
 * ⚡ Request Middleware
 */
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (req.url.toLowerCase().includes('ping')) {
    return res.status(200).json({ status: 'active' });
  }

  try {
    await connectToDatabase();
    next();
  } catch (err: any) {
    res.status(503).json({ error: "Database Unavailable" });
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

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  
  const startLocalServer = async () => {
    if (!(global as any).hasStarted) {
      try {
        await connectToDatabase();
        app.listen(Number(PORT), () => {
          console.log(`🚀 Local Server confirmed on port ${PORT}`);
          (global as any).hasStarted = true;
        });
      } catch (err) {
        console.error("❌ Startup failed", err);
      }
    }
  };

  startLocalServer();
}

export default app;