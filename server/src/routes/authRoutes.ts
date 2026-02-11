import { Router, Request, Response } from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs'; // Using bcryptjs to match your User.ts model
import jwt from 'jsonwebtoken';

const router = Router();

// Define our 3 Administrators
const ADMIN_EMAILS = [
  'daniel@admin.com',
  'eddy@admin.com',
  'favour@admin.com'
];

// --- SIGNUP ROUTE ---
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // We clean the email to make sure no accidental spaces or capitals cause issues
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate account number
    const accountNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');

    const newUser = new User({
      name,
      email: cleanEmail,
      password, // ✅ PASS PLAIN PASSWORD: The User model's pre-save hook handles hashing
      accountNumber
    });

    await newUser.save();
    res.status(201).json({ message: "Account created successfully!", accountNumber });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare provided password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // --- THE ADMIN LOGIC ---
    const userRole = ADMIN_EMAILS.includes(cleanEmail) ? 'admin' : 'user';

    // Create the JWT Token
    const token = jwt.sign(
      { id: user._id, role: userRole }, 
      (process.env.JWT_SECRET as string) || 'secret_key_123', 
      { expiresIn: '1d' }
    );

    // Send the token and user data back
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountNumber: user.accountNumber,
        balance: user.balance,
        role: userRole
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;