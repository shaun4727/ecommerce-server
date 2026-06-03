import { Request, Response } from 'express';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import { sslService } from './sslcommerz.service';

const validatePaymentService = catchAsync(async (req: Request, res: Response) => {
	// Collect the transaction ID from the incoming SSLCommerz POST body
	const tran_id = req.body.tran_id || req.query.tran_id;

	if (!tran_id) {
		return res.redirect(303, config.ssl.failed_url_vercel as string);
	}

	const result = await sslService.validatePaymentService(tran_id as string);

	if (result) {
		// SUCCESS: Redirect the user back to the Next.js Vercel app
		// Using a 303 redirect safely changes the browser request from POST to GET
		res.redirect(303, `${config.ssl.success_url_vercel}?tran_id=${tran_id}`);
	} else {
		// FAILURE: Redirect to Vercel failure page
		res.redirect(303, config.ssl.failed_url_vercel as string);
	}
});

export const SSLController = {
	validatePaymentService,
};
