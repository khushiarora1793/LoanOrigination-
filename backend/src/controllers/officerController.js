import LoanApplication from '../models/LoanApplication.js';
import LoanOfficer from '../models/LoanOfficer.js';
import { evaluateLoan } from '../services/loanService.js';

const loanPopulate = [
  {
    path: 'customerId',
    populate: { path: 'userId', select: 'name email' }
  },
  {
    path: 'officerId',
    populate: { path: 'userId', select: 'name email' }
  }
];

export async function pendingLoans(req, res, next) {
  try {
    const loans = await LoanApplication.find({ status: 'PENDING' })
      .populate(loanPopulate)
      .sort({ createdAt: 1 });

    res.json(loans);
  } catch (error) {
    next(error);
  }
}

export async function allLoans(req, res, next) {
  try {
    const loans = await LoanApplication.find()
      .populate(loanPopulate)
      .sort({ createdAt: -1 });

    res.json(loans);
  } catch (error) {
    next(error);
  }
}

export async function reviewLoan(req, res, next) {
  try {
    const { decision, decisionNote } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ message: 'decision must be APPROVED or REJECTED' });
    }

    const officer = await LoanOfficer.findOne({ userId: req.user.userId });
    if (!officer) {
      return res.status(404).json({ message: 'Officer profile not found' });
    }

    const evaluation = await evaluateLoan(req.params.id);
    const loan = await LoanApplication.findByIdAndUpdate(
      req.params.id,
      {
        officerId: officer._id,
        status: decision,
        decisionNote: decisionNote || `Officer decision. System recommendation: ${evaluation.recommendedStatus}.`
      },
      { new: true }
    ).populate(loanPopulate);

    res.json({
      message: `Loan ${decision.toLowerCase()} successfully`,
      loan,
      systemRecommendation: evaluation.recommendedStatus,
      threshold: evaluation.threshold
    });
  } catch (error) {
    next(error);
  }
}
