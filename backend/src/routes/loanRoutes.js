import { Router } from 'express';
import { applyForLoan, getLoanStatus, myLoans } from '../controllers/loanController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.post('/apply', authorize('CUSTOMER'), applyForLoan);
router.get('/mine', authorize('CUSTOMER'), myLoans);
router.get('/:id/status', getLoanStatus);

export default router;
