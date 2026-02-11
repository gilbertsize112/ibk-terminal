import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js'; 
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * MIDDLEWARE: authenticateToken
 */
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123', (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Session expired or invalid" });
    }
    req.user = decoded;
    next();
  });
};

/**
 * @route   GET /api/user/profile
 */
router.get('/profile', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id).select('-password +transactionPin');
    if (!user) return res.status(404).json({ message: "User account not found" });

    const userObj: any = user.toObject();
    userObj.hasPin = !!user.transactionPin;
    delete userObj.transactionPin;

    res.status(200).json(userObj);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route   GET /api/user/transactions
 */
router.get('/transactions', authenticateToken, async (req: any, res: any) => {
  try {
    const history = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json(history);
  } catch (error) {
    console.error("Transaction History Error:", error);
    res.status(500).json({ message: "Failed to load activity feed" });
  }
});

/**
 * @route   GET /api/user/verify/:accountNumber
 */
router.get('/verify/:accountNumber', authenticateToken, async (req: any, res: any) => {
  try {
    const { accountNumber } = req.params;
    const recipient = await User.findOne({ accountNumber }).select('name');
    if (!recipient) {
      return res.status(404).json({ message: "Recipient account number not recognized" });
    }
    res.status(200).json({ name: recipient.name });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Security lookup failed" });
  }
});

/**
 * @route   POST /api/user/setup-pin
 * @desc    Initialize or Update a user's 4-digit transaction security PIN
 */
router.post('/setup-pin', authenticateToken, async (req: any, res: any) => {
  try {
    const { pin } = req.body;

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: "Security PIN must be exactly 4 numeric digits" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Account not found" });

    user.transactionPin = pin; 
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Transaction PIN established successfully" 
    });
  } catch (error) {
    console.error("PIN Setup Error:", error);
    res.status(500).json({ message: "Internal security failure during PIN setup" });
  }
});

/**
 * @route   POST /api/user/transfer
 */
router.post('/transfer', authenticateToken, async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { recipientAccountNumber, amount, pin } = req.body;
    const senderId = req.user.id;
    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Please enter a valid amount" });
    }

    const sender = await User.findById(senderId).select('+transactionPin').session(session);
    if (!sender) throw new Error("Sender not found");

    if (!sender.transactionPin || sender.transactionPin !== pin) {
      return res.status(403).json({ message: "Invalid Transaction PIN. Access Denied." });
    }
    
    if (sender.balance < numericAmount) {
      return res.status(400).json({ message: "Insufficient funds for this transfer" });
    }

    const recipient = await User.findOne({ accountNumber: recipientAccountNumber }).session(session);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient account number not recognized" });
    }

    if (sender.accountNumber === recipientAccountNumber) {
      return res.status(400).json({ message: "Cannot transfer funds to yourself" });
    }

    sender.balance -= numericAmount;
    recipient.balance += numericAmount;

    await sender.save({ session });
    await recipient.save({ session });

    const senderDebit = new Transaction({
      userId: sender._id,
      type: 'debit',
      amount: numericAmount,
      description: `Transfer to ${recipient.name}`,
      status: 'completed'
    });

    const recipientCredit = new Transaction({
      userId: recipient._id,
      type: 'credit',
      amount: numericAmount,
      description: `Transfer from ${sender.name}`,
      status: 'completed'
    });

    await senderDebit.save({ session });
    await recipientCredit.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ 
      message: "Transfer successful", 
      newBalance: sender.balance 
    });

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transfer Logic Error:", error);
    res.status(error.message === "Sender not found" ? 404 : 400).json({ 
      message: error.message || "Critical error during transfer process" 
    });
  }
});

export default router;