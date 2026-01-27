import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // Added this import

dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Allows your React app (Port 5173) to talk to this server
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bank_app';

// Routes
app.use('/api/auth', authRoutes);   // For Signup & Login
app.use('/api/user', userRoutes);   // For Balance/Transactions
app.use('/api/admin', adminRoutes); // Added this for Admin Dashboard actions

app.get('/', (req: Request, res: Response) => {
  res.send('Bank Server API is running...');
});

// MongoDB Connection & Server Start
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });