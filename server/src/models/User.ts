import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  accountNumber: { type: String, unique: true, required: true },
  balance: { type: Number, default: 0 },
  
  transactionPin: { 
    type: String, 
    default: null,
    select: false 
  },

  isFrozen: { 
    type: Boolean, 
    default: false 
  },
  
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true }, // Ensures virtuals show up in JSON sent to frontend
  toObject: { virtuals: true }
});

/**
 * VIRTUAL: hasPin
 * This allows your React frontend to see "hasPin: true" 
 * without actually sending the secret PIN over the network.
 */
userSchema.virtual('hasPin').get(function() {
  return !!this.transactionPin;
});

/**
 * SECURITY HOOK: Hash password before saving
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = model('User', userSchema);