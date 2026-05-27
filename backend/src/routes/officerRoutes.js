import { Router } from 'express';
import { allLoans, pendingLoans, reviewLoan } from '../controllers/officerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('OFFICER'));
router.get('/loans', allLoans);
router.get('/loans/pending', pendingLoans);
router.post('/loans/:id/review', reviewLoan);

export default router;
