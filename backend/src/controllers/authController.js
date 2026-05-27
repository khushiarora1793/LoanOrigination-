import bcrypt from 'bcryptjs';
import Customer from '../models/Customer.js';
import LoanOfficer from '../models/LoanOfficer.js';
import User from '../models/User.js';
import { signToken } from '../utils/signToken.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role, income, creditScore, branch } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role });

    let profileId;
    if (role === 'CUSTOMER') {
      const customer = await Customer.create({ userId: user._id, income, creditScore });
      profileId = customer._id;
    } else if (role === 'OFFICER') {
      const officer = await LoanOfficer.create({ userId: user._id, branch });
      profileId = officer._id;
    } else {
      return res.status(400).json({ message: 'role must be CUSTOMER or OFFICER' });
    }

    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id,
      profileId,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const profile =
      user.role === 'CUSTOMER'
        ? await Customer.findOne({ userId: user._id })
        : await LoanOfficer.findOne({ userId: user._id });

    res.json({
      token: signToken(user),
      userId: user._id,
      profileId: profile?._id,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
}
