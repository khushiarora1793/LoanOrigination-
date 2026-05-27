import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    income: { type: Number, default: 0, min: 0 },
    creditScore: { type: Number, default: 650, min: 300, max: 900 }
  },
  { timestamps: true }
);

export default mongoose.model('Customer', CustomerSchema);
