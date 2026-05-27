import mongoose from 'mongoose';

const LoanApplicationSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanOfficer' },
    amountRequested: { type: Number, required: true, min: 1000 },
    tenureMonths: { type: Number, required: true, min: 1 },
    interestRate: { type: Number, default: 11.5 },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    eligibilityScore: { type: Number, default: 0 },
    decisionNote: { type: String, default: '' },
    evaluatedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('LoanApplication', LoanApplicationSchema);
