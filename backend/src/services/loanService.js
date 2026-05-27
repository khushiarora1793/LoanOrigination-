import Customer from '../models/Customer.js';
import LoanApplication from '../models/LoanApplication.js';
import mongoose from 'mongoose';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function calculateEligibility({ income = 0, creditScore = 300, amountRequested = 0 }) {
  const incomeNorm = clamp(income / 150000, 0, 1);
  const creditScoreNorm = clamp((creditScore - 300) / 600, 0, 1);
  const score = Number(((0.6 * creditScoreNorm) + (0.4 * incomeNorm)).toFixed(2));

  const amountPressure = clamp(amountRequested / 2000000, 0, 1);
  const threshold = Number((0.42 + amountPressure * 0.28).toFixed(2));
  const recommendedStatus = score >= threshold ? 'APPROVED' : 'REJECTED';

  return { score, threshold, recommendedStatus };
}

export async function evaluateLoan(applicationId, { persistDecision = false } = {}) {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw Object.assign(new Error('Invalid loan application id'), { statusCode: 400 });
  }

  const loanObjectId = new mongoose.Types.ObjectId(applicationId);

  const [application] = await LoanApplication.aggregate([
    { $match: { _id: loanObjectId } },
    {
      $lookup: {
        from: 'customers',
        localField: 'customerId',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: '$customer' },
    {
      $project: {
        amountRequested: 1,
        tenureMonths: 1,
        status: 1,
        customerIncome: '$customer.income',
        customerCreditScore: '$customer.creditScore'
      }
    }
  ]);

  if (!application) {
    throw Object.assign(new Error('Loan application not found'), { statusCode: 404 });
  }

  const result = calculateEligibility({
    income: application.customerIncome,
    creditScore: application.customerCreditScore,
    amountRequested: application.amountRequested
  });

  const update = {
    eligibilityScore: result.score,
    evaluatedAt: new Date()
  };

  if (persistDecision) {
    update.status = result.recommendedStatus;
    update.decisionNote = `System evaluated score ${result.score} against threshold ${result.threshold}.`;
  }

  const updated = await LoanApplication.findByIdAndUpdate(loanObjectId, update, { new: true });
  return { application: updated, ...result };
}

export async function getCustomerForUser(userId) {
  const customer = await Customer.findOne({ userId });

  if (!customer) {
    throw Object.assign(new Error('Customer profile not found'), { statusCode: 404 });
  }

  return customer;
}
