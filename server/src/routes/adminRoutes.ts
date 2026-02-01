import { Router, Request, Response } from 'express';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';

const router = Router();

/**
 * @route   GET /api/admin/users
 * @desc    Fetch all registered users for the Admin Terminal registry
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    // Added 'isFrozen' to the selection to ensure the frontend knows the status
    const users = await User.find({}, 'name email accountNumber balance isFrozen');
    res.status(200).json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Failed to synchronize user registry" });
  }
});

/**
 * @route   PATCH /api/admin/user-status
 * @desc    Freeze/Unfreeze User: Toggle account access status
 */
router.patch('/user-status', async (req: Request, res: Response) => {
  try {
    const { userId, isFrozen } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Target User ID is required" });
    }

    // Update the isFrozen status in the database
    const user = await User.findByIdAndUpdate(
      userId,
      { isFrozen: isFrozen },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found in the network" });
    }

    const statusLabel = isFrozen ? "FROZEN" : "ACTIVE";

    res.status(200).json({ 
      message: `Account for ${user.name} is now ${statusLabel}`,
      isFrozen: user.isFrozen 
    });

  } catch (error) {
    console.error("Status Toggle Error:", error);
    res.status(500).json({ message: "Failed to update account security status" });
  }
});

/**
 * @route   POST /api/admin/load-wallet
 * @desc    Inward Credit: Inject funds AND log transaction history
 */
router.post('/load-wallet', async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;

    // 1. Validation
    if (!userId) {
      return res.status(400).json({ message: "Target User ID is required" });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid credit amount" });
    }

    // 2. Update the User Balance
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: numericAmount } }, 
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found in the network" });
    }

    // 3. LOG THE TRANSACTION (The professional part)
    const auditTrail = new Transaction({
      userId: user._id,
      type: 'credit',
      amount: numericAmount,
      description: 'Admin Funding Injection', 
      status: 'completed'
    });

    await auditTrail.save();

    // 4. Final Response
    res.status(200).json({ 
      message: `Successfully credited $${numericAmount} to ${user.name}`, 
      newBalance: user.balance,
      transactionId: auditTrail._id 
    });

  } catch (error) {
    console.error("Critical Transaction Error:", error);
    res.status(500).json({ message: "Financial injection failed. Audit trail error." });
  }
});

export default router;