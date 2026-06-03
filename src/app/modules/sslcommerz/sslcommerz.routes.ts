import { Router } from 'express';
import { SSLController } from './sslcommerz.controller';

const router = Router();

// Define routes

router.post('/validate', SSLController.validatePaymentService);
router.post('/fail', SSLController.failedPaymentService);

export const SSLRoutes = router;
