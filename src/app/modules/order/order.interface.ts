import { Document, Types } from 'mongoose';
import { IPayment } from '../payment/payment.interface';

export interface IOrderProduct {
	product: Types.ObjectId;
	quantity: number;
	unitPrice: number;
	color: string;
	type: string;
}

export interface IOrder extends Document {
	user: Types.ObjectId;
	shop: Types.ObjectId;
	products: IOrderProduct[];
	coupon: Types.ObjectId | null;
	totalAmount: number;
	discount: number;
	deliveryCharge: number;
	finalAmount: number;
	status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled' | 'Picked';
	shippingAddress: string;
	paymentMethod: 'Cash' | 'Card' | 'Online';
	paymentStatus: 'Pending' | 'Paid' | 'Failed';
	createdAt?: Date;
	updatedAt?: Date;
	payment?: IPayment | null;
	assigned: Types.ObjectId;
}

export interface IAgentOrder {
	orderId: Types.ObjectId;
	destination: string;
	agentId: Types.ObjectId;
	status: 'Picked' | 'Delivered' | 'Assigned';
	createdAt?: Date;
	updatedAt?: Date;
}
