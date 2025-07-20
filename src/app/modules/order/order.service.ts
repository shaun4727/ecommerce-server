import { StatusCodes } from 'http-status-codes';
import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/appError';
import { IJwtPayload } from '../auth/auth.interface';
import { Coupon } from '../coupon/coupon.model';
import { Payment } from '../payment/payment.model';
import { generateTransactionId } from '../payment/payment.utils';
import { Product } from '../product/product.model';
import Shop from '../shop/shop.model';
import { sslService } from '../sslcommerz/sslcommerz.service';
import User from '../user/user.model';
import { IAgentOrder, IOrder } from './order.interface';
import { AgentOrder, Order } from './order.model';

const createOrder = async (orderData: Partial<IOrder>, authUser: IJwtPayload) => {
	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		if (orderData.products) {
			for (const productItem of orderData.products) {
				const product = await Product.findById(productItem.product).populate('shop').session(session);

				if (product) {
					if (product.isActive === false) {
						throw new Error(`Product ${product?.name} is inactive.`);
					}

					if (product.stock < productItem.quantity) {
						throw new Error(`Insufficient stock for product: ${product.name}`);
					}
					// Decrement the product stock
					product.stock -= productItem.quantity;
					await product.save({ session });
				} else {
					throw new Error(`Product not found: ${productItem.product}`);
				}
			}
		}

		// Handle coupon and update orderData
		if (orderData.coupon) {
			const coupon = await Coupon.findOne({ code: orderData.coupon }).session(session);
			if (coupon) {
				const currentDate = new Date();

				// Check if the coupon is within the valid date range
				if (currentDate < coupon.startDate) {
					throw new Error(`Coupon ${coupon.code} has not started yet.`);
				}

				if (currentDate > coupon.endDate) {
					throw new Error(`Coupon ${coupon.code} has expired.`);
				}

				orderData.coupon = coupon._id as Types.ObjectId;
			} else {
				throw new Error('Invalid coupon code.');
			}
		}

		// Create the order
		const order = new Order({
			...orderData,
			user: authUser.userId,
			assigned: null,
		});

		const createdOrder = await order.save({ session });
		await createdOrder.populate('user products.product');

		const transactionId = generateTransactionId();

		const payment = new Payment({
			user: authUser.userId,
			shop: createdOrder.shop,
			order: createdOrder._id,
			method: orderData.paymentMethod,
			transactionId,
			amount: createdOrder.finalAmount,
		});

		await payment.save({ session });

		let result;

		if (createdOrder.paymentMethod == 'Online') {
			result = await sslService.initPayment({
				total_amount: createdOrder.finalAmount,
				tran_id: transactionId,
			});
			result = { paymentUrl: result };
		} else {
			result = null;
		}

		// Commit the transaction
		await session.commitTransaction();
		session.endSession();

		// const pdfBuffer = await generateOrderInvoicePDF(createdOrder);
		// const emailContent = await EmailHelper.createEmailContent(
		//   //@ts-ignore
		//   { userName: createdOrder.user.name || "" },
		//   "orderInvoice"
		// );

		// const attachment = {
		//   filename: `Invoice_${createdOrder._id}.pdf`,
		//   content: pdfBuffer,
		//   encoding: "base64", // if necessary
		// };

		// await EmailHelper.sendEmail(
		//   //@ts-ignore
		//   createdOrder.user.email,
		//   emailContent,
		//   "Order confirmed!",
		//   attachment
		// );
		return result;
	} catch (error) {
		console.log(error);
		// Rollback the transaction in case of error
		await session.abortTransaction();
		session.endSession();
		throw error;
	}
};

const getMyShopOrders = async (query: Record<string, unknown>, authUser: IJwtPayload) => {
	const userHasShop = await User.findById(authUser.userId).select('isActive hasShop');

	if (!userHasShop) throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
	if (!userHasShop.isActive) throw new AppError(StatusCodes.BAD_REQUEST, 'User account is not active!');
	if (!userHasShop.hasShop) throw new AppError(StatusCodes.BAD_REQUEST, 'User does not have any shop!');

	const shopIsActive = await Shop.findOne({
		user: userHasShop._id,
		isActive: true,
	}).select('isActive');

	if (!shopIsActive) throw new AppError(StatusCodes.BAD_REQUEST, 'Shop is not active!');

	const orderQuery = new QueryBuilder(
		Order.find({ shop: shopIsActive._id }).populate([
			{ path: 'user' },
			{ path: 'products.product' },
			{ path: 'coupon' },
			{
				path: 'assigned',
				populate: {
					path: 'agentId',
					model: 'User',
				},
			},
		]),
		query,
	)
		.search(['user.name', 'user.email', 'products.product.name'])
		.filter()
		.sort()
		.paginate()
		.fields();

	const result = await orderQuery.modelQuery;

	const meta = await orderQuery.countTotal();

	return {
		meta,
		result,
	};
};

const getOrderDetails = async (orderId: string) => {
	const order = await Order.findById(orderId).populate('user products.product coupon');
	if (!order) {
		throw new AppError(StatusCodes.NOT_FOUND, 'Order not Found');
	}

	order.payment = await Payment.findOne({ order: order._id });
	return order;
};

const getMyOrders = async (query: Record<string, unknown>, authUser: IJwtPayload) => {
	const orderQuery = new QueryBuilder(
		Order.find({ user: authUser.userId }).populate('user products.product coupon assigned'),
		query,
	)
		.search(['user.name', 'user.email', 'products.product.name'])
		.filter()
		.sort()
		.paginate()
		.fields();

	const result = await orderQuery.modelQuery;

	const meta = await orderQuery.countTotal();

	return {
		meta,
		result,
	};
};

const changeOrderStatus = async (orderId: string, status: string, authUser: IJwtPayload) => {
	const userHasShop = await User.findById(authUser.userId).select('isActive hasShop');

	if (!userHasShop) throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
	if (!userHasShop.isActive) throw new AppError(StatusCodes.BAD_REQUEST, 'User account is not active!');
	if (!userHasShop.hasShop) throw new AppError(StatusCodes.BAD_REQUEST, 'User does not have any shop!');

	const shopIsActive = await Shop.findOne({
		user: userHasShop._id,
		isActive: true,
	}).select('isActive');

	if (!shopIsActive) throw new AppError(StatusCodes.BAD_REQUEST, 'Shop is not active!');

	const order = await Order.findOneAndUpdate(
		{ _id: new Types.ObjectId(orderId), shop: shopIsActive._id },
		{ status },
		{ new: true },
	);
	return order;
};

const assignOrderToAgentIntoDB = async (assignment: IAgentOrder) => {
	// assign the order

	const session = await mongoose.startSession();
	session.startTransaction();
	try {
		const order = await Order.findById(assignment.orderId).session(session);

		const assignedOrder = new AgentOrder({
			...assignment,
		});

		const result = await assignedOrder.save({ session });
		if (order) {
			order.assigned = result._id;
		}
		await order?.save({ session });
		await session.commitTransaction();
		session.endSession();
		return result;
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		throw err;
	}
};

const getAgentOrdersFromDB = async (agentId: string) => {
	try {
		const user = await User.findById(agentId);

		let orders;
		if (!user!.picked) {
			orders = await AgentOrder.find({ agentId: agentId, status: 'Assigned' });
		} else {
			orders = await AgentOrder.find({ agentId: agentId, status: 'Picked' });
		}

		return orders;
	} catch (err: any) {
		throw new err();
	}
};
const getDeliveryAddressFromDB = async (agentId: string) => {
	try {
		const agentOrder = await AgentOrder.findOne({ agentId: agentId, status: 'Picked' });

		return agentOrder;
	} catch (err: any) {
		throw new err();
	}
};

const updateDeliveryStatusIntoDB = async (orderId: string, userId: string) => {
	let session: mongoose.ClientSession | null = null;
	try {
		session = await mongoose.startSession();
		session.startTransaction();

		const agentOrder = await AgentOrder.findOne({ orderId: orderId, status: 'Picked' }).session(session);
		if (agentOrder) {
			agentOrder.status = 'Delivered';
		}

		await agentOrder?.save({ session });

		// updating order
		const order = await Order.findById(orderId).session(session);
		if (order) {
			order.status = 'Completed';
			order.paymentStatus = 'Paid';
		}
		await order?.save({ session });

		// update user status
		const user = await User.findById(userId).session(session);

		if (user) {
			user.picked = false;
			await user.save({ session });
		}

		await session.commitTransaction();
		session.endSession();
	} catch (err: any) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		throw new err();
	}
};
const getCustomerInvoiceFromDB = async (userId: string) => {
	try {
		const order = await Order.findOne({ user: userId }).populate('user products.product');

		return order;
		// Set the response headers
	} catch (err: any) {
		throw new err();
	}
};
// const getCustomerInvoiceFromDB = async (userId: string) => {
// 	try {
// 		const order = await Order.findOne({ user: userId }).populate('user products.product');

// 		const browser = await puppeteer.launch();
// 		const page = await browser.newPage();

// 		// Set your HTML content
// 		const htmlContent = `
// 		            <!DOCTYPE html>
// 		            <html lang="en">
// 		            <head>
// 		                <meta charset="UTF-8">
// 		                <meta name="viewport" content="width=device-width, initial-scale=1.0">
// 		                <title>Invoice</title>
// 		                <style lang="css">
// 		                    #app h1{
// 		                        font-size:38px;
// 		                        font-weight: 700;
// 		                    }

// 		                    #app .customer-detail{
// 		                        display: flex;
// 		                        justify-content: space-between;
// 		                    }
// 		                    #app .customer-detail .section-one{
// 		                        line-height: .4;
// 		                    }
// 		                    #app .customer-detail .section-one .customer-name{
// 		                        font-weight:600;
// 		                    }

// 		                    #app .invoice-title{
// 		                        width: 100%;
// 		                        display: flex;
// 		                        justify-content: center;
// 		                        margin-top: 35px!important;
// 		                    }
// 		                    #app .invoice-title span{
// 		                        border: 1px solid #000;
// 		                        font-weight: 600;
// 		                        padding: 8px;
// 		                        border-radius: 8px;
// 		                    }
// 		                    .invoice-table{
// 		                        width: 100%;
// 		                        border-collapse: collapse;
// 		                        margin-top: 25px;
// 		                    }
// 		                    @media print{
// 		                        body{
// 		                            margin: 0;
// 		                            padding: 0;
// 		                            box-sizing: border-box;
// 		                        }
// 		                        @page {
// 		                            size: A4;
// 		                            border: none;
// 		                        }
// 		                    }
// 		                </style>

// 		            </head>
// 		            <body>
// 		                <div id="app">
// 		                    <h1>EMart</h1>
// 		                    <div class="customer-detail">
// 		                        <div class="section-one">
// 		                            <p>Bill To:</p>
// 		                            <p class="customer-name">${order?.user?.name ?? ''}</p>
// 		                            <p class="customer-address">${order?.shippingAddress?.area ?? ''}, ${
// 			order?.shippingAddress?.street_or_building_name
// 		}</p>
// 		                            <p class="customer-address">${order?.shippingAddress?.zip_code ?? ''}, ${
// 			order?.shippingAddress?.city
// 		}, Bangladesh</p>
// 		                        </div>
// 		                        <div class="section-two">
// 		                            <p class="date">Invoice Date: ${new Intl.DateTimeFormat('en-US').format(new Date())}</p>
// 		                        </div>
// 		                    </div>
// 		                    <div class="invoice-title">
// 		                        <span>INVOICE</span>
// 		                    </div>
// 		                    <table border="1" cellspacing="0" cellpadding="8" class="invoice-table">
// 		                        <thead>
// 		                            <tr>
// 		                                <th>Product Name</th>
// 		                                <th>Unit Price</th>
// 		                                <th>Quantity</th>
// 		                                <th>Total Price</th>
// 		                            </tr>
// 		                        </thead>
// 		                        <tbody>
// 		                        ${order?.products
// 									?.map((product) => {
// 										return `<tr>
// 		                                <td>${product?.product?.name ?? ''}</td>
// 		                                <td>BDT ${product?.unitPrice ?? ''}</td>
// 		                                <td>${product?.quantity ?? ''}</td>
// 		                                <td>BDT ${Number(product?.quantity) * Number(product.unitPrice)}</td>
// 		                            </tr>`;
// 									})
// 									.join('')}
// 		                        </tbody>
// 		                        <tfoot>
// 		                            <tr>
// 		                                <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
// 		                                <td>BDT ${order?.totalAmount ?? '0'}</td>
// 		                            </tr>
// 		                            <tr>
// 		                                <td colspan="3" style="text-align: right;"><strong>Delivery Charge:</strong></td>
// 		                                <td>BDT ${order?.deliveryCharge ?? '0'}</td>
// 		                            </tr>
// 		                            <tr>
// 		                                <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
// 		                                <td><strong>BDT ${order?.finalAmount ?? '0'}</strong></td>
// 		                            </tr>
// 		                        </tfoot>
// 		                    </table>

// 		                </div>
// 		            </body>
// 		            </html>
// 		`;

// 		console.log('service hit ', order);
// 		await page.setContent(htmlContent);
// 		const pdfBuffer = await page.pdf({ format: 'A4' });

// 		await browser.close();

// 		return pdfBuffer;
// 		// Set the response headers
// 	} catch (err: any) {
// 		throw new err();
// 	}
// };

export const OrderService = {
	createOrder,
	getMyShopOrders,
	getOrderDetails,
	getMyOrders,
	changeOrderStatus,
	assignOrderToAgentIntoDB,
	getAgentOrdersFromDB,
	getDeliveryAddressFromDB,
	updateDeliveryStatusIntoDB,
	getCustomerInvoiceFromDB,
};
