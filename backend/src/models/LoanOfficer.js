import mongoose from 'mongoose';

const LoanOfficerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    branch: { type: String, default: 'Digital Lending Desk', trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('LoanOfficer', LoanOfficerSchema);
