import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links this transaction to a specific user
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'transfer'], 
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: 'Bank Transaction'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Transaction = mongoose.model('Transaction', TransactionSchema);