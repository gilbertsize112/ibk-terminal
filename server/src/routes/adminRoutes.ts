import { Router, Request, Response } from 'express';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js'; // 1. Import the Transaction model

const router = Router();

/**
 * @route   GET /api/admin/users
 * @desc    Fetch all registered users for the Admin Terminal registry
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, 'name email accountNumber balance');
    res.status(200).json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Failed to synchronize user registry" });
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
    // This creates the history that John Doe will see on his dashboard
    const auditTrail = new Transaction({
      userId: user._id,
      type: 'credit',
      amount: numericAmount,
      description: 'Admin Funding Injection', // Shows up on user statement
      status: 'completed'
    });

    await auditTrail.save();

    // 4. Final Response
    res.status(200).json({ 
      message: `Successfully credited $${numericAmount} to ${user.name}`, 
      newBalance: user.balance,
      transactionId: auditTrail._id // Return the receipt ID for confirmation
    });

  } catch (error) {
    console.error("Critical Transaction Error:", error);
    res.status(500).json({ message: "Financial injection failed. Audit trail error." });
  }
});

export default router;