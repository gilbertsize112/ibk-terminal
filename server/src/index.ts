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

// 1. 🛡️ THE "STOP THE 404" MIDDLEWARE
// This is positioned BEFORE any other routes to guarantee it catches the request.
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`🔍 Incoming Request: ${req.method} ${req.url}`);
  
  // Checks if 'ping' is anywhere in the URL string
  if (req.url.toLowerCase().includes('ping')) {
    return res.status(200).json({ 
      status: 'active',
      receivedUrl: req.url,
      info: "Server reached successfully. If this works, your backend logic is live."
    });
  }
  next();
});

// 2. Flexible Route Mounting
// Using arrays to handle both prefixed and non-prefixed paths from Vercel
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
    message: "If you see this, the server is live but the path is not matching a route."
  });
});

// Local listener (Only runs outside of Vercel production)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(Number(PORT), () => {
    console.log(`🚀 Local Server ready on port ${PORT}`);
  });
}

// Crucial: Export the app for Vercel's handler
export default app;