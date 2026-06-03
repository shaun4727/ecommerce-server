import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import SSLCommerzPayment from 'sslcommerz-lts';
import config from '../../config';
import AppError from '../../errors/appError';
import { Order } from '../order/order.model';
import { Payment } from '../payment/payment.model';

const store_id = config.ssl.store_id as string;
const store_passwd = config.ssl.store_pass as string;
const is_live = false; // true for live, false for sandbox

// SSLCommerz init
const initPayment = async (paymentData: {
	total_amount: number;
	tran_id: string;
	cus_email?: string;
	cus_name?: string;
}) => {
	const { total_amount, tran_id, cus_email, cus_name } = paymentData;

	const data = {
		total_amount,
		currency: 'BDT',
		tran_id,

		// --- FIXED URL MAPPINGS ---
		// Success goes to the success URL
		success_url: `${config.ssl.backend_success_url}?tran_id=${tran_id}`,

		fail_url: config.ssl.failed_url as string,
		cancel_url: config.ssl.cancel_url as string,

		// Map the required ipn_url field to your existing validation_url config
		ipn_url: config.ssl.validation_url as string,
		// --------------------------

		shipping_method: 'Courier',
		product_name: 'E-commerce Products',
		product_category: 'General',
		product_profile: 'general',

		// Customer Info
		cus_name: cus_name || 'N/A',
		cus_email: cus_email || 'N/A',
		cus_add1: 'Dhaka',
		cus_city: 'Dhaka',
		cus_state: 'Dhaka',
		cus_postcode: '1000',
		cus_country: 'Bangladesh',
		cus_phone: '01711111111',

		// Shipment Info
		ship_name: cus_name || 'N/A',
		ship_add1: 'Dhaka',
		ship_city: 'Dhaka',
		ship_state: 'Dhaka',
		ship_postcode: 1000,
		ship_country: 'Bangladesh',
	};

	const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

	try {
		const apiResponse = await sslcz.init(data);
		if (apiResponse?.GatewayPageURL) {
			return apiResponse.GatewayPageURL;
		} else {
			throw new AppError(StatusCodes.BAD_GATEWAY, 'Failed to generate payment gateway URL.');
		}
	} catch (error) {
		throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while processing payment.');
	}
};

const validatePaymentService = async (tran_id: string): Promise<boolean> => {
	const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		//@ts-ignore
		const validationResponse = await sslcz.transactionQueryByTransactionId({ tran_id });

		const status =
			validationResponse.element[0].status === 'VALID' || validationResponse.element[0].status === 'VALIDATED'
				? 'Paid'
				: 'Failed';

		const data = {
			status: status,
			gatewayResponse: validationResponse.element[0],
		};

		const updatedPayment = await Payment.findOneAndUpdate({ transactionId: tran_id }, data, { new: true, session });

		if (!updatedPayment) throw new Error('Payment not updated');

		const updatedOrder = await Order.findByIdAndUpdate(
			updatedPayment.order,
			{ paymentStatus: data.status },
			{ new: true, session },
		).populate('user products.product');

		if (!updatedOrder) throw new Error('Order not updated');
		if (data.status === 'Failed') throw new Error('Payment failed');

		// CRITICAL FIX: You MUST commit the transaction for DB changes to save!
		await session.commitTransaction();
		session.endSession();

		// Email logic (Optional: Uncomment when you want invoices sent)
		// ...

		return true;
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.error('SSL Validation Error:', error);
		return false;
	}
};

export const sslService = {
	initPayment,
	validatePaymentService,
};
