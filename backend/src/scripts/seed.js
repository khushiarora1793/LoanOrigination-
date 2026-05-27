import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDb } from '../config/db.js';
import Customer from '../models/Customer.js';
import LoanApplication from '../models/LoanApplication.js';
import LoanOfficer from '../models/LoanOfficer.js';
import User from '../models/User.js';
import { evaluateLoan } from '../services/loanService.js';

dotenv.config();

async function seed() {
  await connectDb();
  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    LoanOfficer.deleteMany({}),
    LoanApplication.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash('P@ssw0rd', 12);
  const [customerUser, officerUser] = await User.create([
    { name: 'Ravi Kumar', email: 'ravi@example.com', passwordHash, role: 'CUSTOMER' },
    { name: 'Ananya Sharma', email: 'officer@example.com', passwordHash, role: 'OFFICER' }
  ]);

  const customer = await Customer.create({
    userId: customerUser._id,
    income: 95000,
    creditScore: 760
  });

  await LoanOfficer.create({
    userId: officerUser._id,
    branch: 'Mumbai Central'
  });

  const loans = await LoanApplication.create([
    { customerId: customer._id, amountRequested: 500000, tenureMonths: 24 },
    { customerId: customer._id, amountRequested: 1400000, tenureMonths: 48 }
  ]);

  await Promise.all(loans.map((loan) => evaluateLoan(loan._id)));

  console.log('Seed complete');
  console.log('Customer login: ravi@example.com / P@ssw0rd');
  console.log('Officer login: officer@example.com / P@ssw0rd');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
