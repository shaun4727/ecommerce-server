import { Request, Response } from 'express';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import { sslService } from './sslcommerz.service';

const validatePaymentService = catchAsync(async (req: Request, res: Response) => {
	// Best Practice: SSLCommerz POSTs data to this route.
	// Fallback to query if it was passed via URL string.
	const tran_id = req.body.tran_id || req.query.tran_id;

	if (!tran_id) {
		return res.redirect(301, config.ssl.failed_url as string);
	}

	const result = await sslService.validatePaymentService(tran_id as string);

	if (result) {
		// Fix: Append the tran_id so the Next.js frontend can read it!
		// config.ssl.success_url should be: "http://localhost:3000/payment/success"
		res.redirect(301, `${config.ssl.success_url}?tran_id=${tran_id}`);
	} else {
		res.redirect(301, config.ssl.failed_url as string);
	}
});

export const SSLController = {
	validatePaymentService,
};
