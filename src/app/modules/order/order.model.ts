import { Schema, model } from 'mongoose';
import { OrderAssignedStatus } from '../../utils/constant';
import { Coupon } from '../coupon/coupon.model';
import { Product } from '../product/product.model';
import { IAgentOrder, IOrder } from './order.interface';

const orderSchema = new Schema<IOrder>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		shop: {
			type: Schema.Types.ObjectId,
			ref: 'Shop',
			required: true,
		},
		products: [
			{
				product: {
					type: Schema.Types.ObjectId,
					ref: 'Product',
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				unitPrice: {
					type: Number,
					required: true,
				},
				color: {
					type: String,
					required: true,
				},
			},
		],
		coupon: {
			type: Schema.Types.ObjectId,
			ref: 'Coupon',
			default: null,
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		discount: {
			type: Number,
			default: 0,
			min: 0,
		},
		deliveryCharge: {
			type: Number,
			default: 0,
		},
		finalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		status: {
			type: String,
			enum: ['Pending', 'Processing', 'Completed', 'Cancelled', 'Picked'],
			default: 'Pending',
		},
		shippingAddress: {
			type: {
				city: { type: String, required: true },
				zip_code: { type: String, required: true },
				street_or_building_name: { type: String, required: true },
				area: { type: String, required: true },
			},
			required: true,
		},
		assigned: {
			type: Schema.Types.ObjectId,
			ref: 'AgentOrder',
		},
		paymentMethod: {
			type: String,
			enum: ['COD', 'Online'],
			default: 'Online',
		},
		paymentStatus: {
			type: String,
			enum: ['Pending', 'Paid', 'Failed'],
			default: 'Pending',
		},
	},
	{
		timestamps: true,
	},
);

// Pre-save hook to calculate total, discount, delivery charge, and final price
orderSchema.pre('validate', async function (next) {
	const order = this;

	// Step 1: Initialize total amount
	let totalAmount = 0;
	let finalDiscount = 0;
	let shopId: Schema.Types.ObjectId | null = null;

	// Step 2: Calculate total amount for products
	for (let item of order.products) {
		const product = await Product.findById(item.product).populate('shop');

		if (!product) {
			return next(new Error(`Product not found!.`));
		}
		if (shopId && String(shopId) !== String(product.shop._id)) {
			return next(new Error('Products must be from the same shop.'));
		}

		//@ts-ignore
		shopId = product.shop._id;

		const offerPrice = (await product?.calculateOfferPrice()) || 0;

		let productPrice = product.price;
		if (offerPrice) productPrice = Number(offerPrice);

		item.unitPrice = productPrice;
		const price = productPrice * item.quantity;

		totalAmount += price;
	}

	if (order.coupon) {
		const couponDetails = await Coupon.findById(order.coupon);
		// if (String(shopId) === couponDetails?.shop.toString()) {
		//   throw new AppError(StatusCodes.BAD_REQUEST, "The coupon is not applicable for your selected products")
		// }
		if (couponDetails && couponDetails.isActive) {
			if (totalAmount >= couponDetails.minOrderAmount) {
				if (couponDetails.discountType === 'Percentage') {
					finalDiscount = Math.min(
						(couponDetails.discountValue / 100) * totalAmount,
						couponDetails.maxDiscountAmount ? couponDetails.maxDiscountAmount : Infinity,
					);
				} else if (couponDetails.discountType === 'Flat') {
					finalDiscount = Math.min(couponDetails.discountValue, totalAmount);
				}
			}
		}
	}

	const isDhaka = order?.shippingAddress?.city.toLowerCase()?.includes('dhaka');
	const deliveryCharge = isDhaka ? 60 : 120;

	order.totalAmount = totalAmount;
	order.discount = finalDiscount;
	order.deliveryCharge = deliveryCharge;
	order.finalAmount = totalAmount - finalDiscount + deliveryCharge;
	//@ts-ignore
	order.shop = shopId;

	next();
});

export const Order = model<IOrder>('Order', orderSchema);

/**
 * Agent Schema definition
 */

// 2. Define the Mongoose Schema
const AgentOrderSchema: Schema = new Schema<IAgentOrder>(
	{
		orderId: {
			type: Schema.Types.ObjectId, // Use Mongoose's ObjectId type
			required: true, // Assuming orderId is mandatory
			unique: true, // If each agent order entry refers to a unique core order
			ref: 'Order', // Optional: If this orderId refers to a separate 'Order' collection
		},
		agentId: {
			type: Schema.Types.ObjectId, // Use Mongoose's ObjectId type
			required: true, // Assuming orderId is mandatory
			ref: 'User', // Optional: If this orderId refers to a separate 'Order' collection
		},

		destination: {
			type: {
				city: String,
				zip_code: String,
				street_or_building_name: String,
				area: String,
			}, // JavaScript String maps to Mongoose String
			required: true,
			trim: true, // Removes whitespace from both ends of a string
		},
		status: {
			type: String,
			enum: [OrderAssignedStatus.picked, OrderAssignedStatus.delivered, OrderAssignedStatus.assigned],
			required: true,
		},
	},
	{
		timestamps: true, // Adds createdAt and updatedAt fields automatically
	},
);

// 3. Create and export the Mongoose Model
export const AgentOrder = model<IAgentOrder>('AgentOrder', AgentOrderSchema);
