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

// 1. 🧪 DEBUGGING MIDDLEWARE (The "Truth" Seeker)
// This logs exactly what Vercel is handing to Express
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`🔍 Incoming Request: ${req.method} ${req.url}`);
  
  // If the path has 'ping' anywhere in it, respond immediately
  if (req.url.includes('ping')) {
    return res.status(200).json({ 
      status: 'active',
      receivedUrl: req.url,
      info: "If you see this, the server is ALIVE. The 404 was a path mismatch."
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
  console.log(`❌ 404 error at: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Route not found',
    receivedPath: req.url,
    suggestion: "Check your Vercel logs to see if a prefix was added to the URL."
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