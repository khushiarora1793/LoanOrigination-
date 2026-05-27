import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import officerRoutes from './routes/officerRoutes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 250 }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'loan-origination-api' });
});

app.use('/auth', authRoutes);
app.use('/loans', loanRoutes);
app.use('/officer', officerRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  res.status(status).json({
    message: error.message || 'Server error'
  });
});

export default app;
