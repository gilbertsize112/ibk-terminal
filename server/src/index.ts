import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://ibk-finance.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bank_app';

// 1. 🛡️ THE "CATCH-ANY-PING" MIDDLEWARE
// This replaces your previous ping route to be more aggressive
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`🔍 Received: ${req.method} ${req.url}`);
  
  if (req.url.toLowerCase().includes('ping')) {
    return res.status(200).json({ 
      status: 'active',
      receivedUrl: req.url,
      message: "Express caught this request!" 
    });
  }
  next();
});

// 2. Flexible Route Mounting
app.use(['/api/auth', '/auth'], authRoutes);   
app.use(['/api/user', '/user'], userRoutes);   
app.use(['/api/admin', '/admin'], adminRoutes); 

app.get('/', (req, res) => res.send('Bank Server API Online'));

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// 3. Debugging 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.url,
    msg: "If you see this, Express is live but the route didn't match." 
  });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(Number(PORT), () => console.log(`🚀 Port ${PORT}`));
}

export default app;