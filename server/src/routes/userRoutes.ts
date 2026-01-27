import { Router, Request, Response } from 'express';
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
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: "User account not found" });
    res.status(200).json(user);
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
 * @route   POST /api/user/transfer
 * @desc    Transfer funds from the logged-in user to another user by Account Number
 */
router.post('/transfer', authenticateToken, async (req: any, res: any) => {
  try {
    const { recipientAccountNumber, amount } = req.body;
    const senderId = req.user.id;
    const numericAmount = Number(amount);

    // 1. Validation
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Please enter a valid amount" });
    }

    // 2. Find Sender and verify funds
    const sender = await User.findById(senderId);
    if (!sender) return res.status(404).json({ message: "Sender not found" });
    
    if (sender.balance < numericAmount) {
      return res.status(400).json({ message: "Insufficient funds for this transfer" });
    }

    // 3. Find Recipient
    const recipient = await User.findOne({ accountNumber: recipientAccountNumber });
    if (!recipient) {
      return res.status(404).json({ message: "Recipient account number not recognized" });
    }

    // 4. Prevent self-transfer
    if (sender.accountNumber === recipientAccountNumber) {
      return res.status(400).json({ message: "Cannot transfer funds to yourself" });
    }

    // 5. Atomic Update (Subtract from sender, add to recipient)
    sender.balance -= numericAmount;
    recipient.balance += numericAmount;

    await sender.save();
    await recipient.save();

    // 6. Create Transaction Records (Receipts for both)
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

    await Promise.all([senderDebit.save(), recipientCredit.save()]);

    res.status(200).json({ 
      message: "Transfer successful", 
      newBalance: sender.balance 
    });

  } catch (error) {
    console.error("Transfer Logic Error:", error);
    res.status(500).json({ message: "Critical error during transfer process" });
  }
});

export default router;