import LoanApplication from '../models/LoanApplication.js';
import { evaluateLoan, getCustomerForUser } from '../services/loanService.js';

export async function applyForLoan(req, res, next) {
  try {
    const { amountRequested, tenureMonths } = req.body;
    const customer = await getCustomerForUser(req.user.userId);

    const loan = await LoanApplication.create({
      customerId: customer._id,
      amountRequested,
      tenureMonths
    });

    const evaluation = await evaluateLoan(loan._id, { persistDecision: false });

    res.status(201).json({
      loanId: loan._id,
      message: 'Loan application submitted.',
      eligibilityScore: evaluation.score,
      recommendation: evaluation.recommendedStatus,
      threshold: evaluation.threshold
    });
  } catch (error) {
    next(error);
  }
}

export async function getLoanStatus(req, res, next) {
  try {
    const loan = await LoanApplication.findById(req.params.id)
      .populate({ path: 'customerId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'officerId', populate: { path: 'userId', select: 'name email' } });

    if (!loan) {
      return res.status(404).json({ message: 'Loan application not found' });
    }

    if (req.user.role === 'CUSTOMER' && loan.customerId.userId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only view your own applications' });
    }

    res.json({
      loanId: loan._id,
      amountRequested: loan.amountRequested,
      tenureMonths: loan.tenureMonths,
      interestRate: loan.interestRate,
      status: loan.status,
      eligibilityScore: loan.eligibilityScore,
      decisionNote: loan.decisionNote,
      officer: loan.officerId?.userId?.name || null,
      createdAt: loan.createdAt
    });
  } catch (error) {
    next(error);
  }
}

export async function myLoans(req, res, next) {
  try {
    const customer = await getCustomerForUser(req.user.userId);
    const loans = await LoanApplication.find({ customerId: customer._id }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    next(error);
  }
}
