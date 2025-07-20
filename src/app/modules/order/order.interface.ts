import { Document, Types } from 'mongoose';
import { IPayment } from '../payment/payment.interface';
import { IProduct } from '../product/product.interface';
import { IUser } from '../user/user.interface';

export interface IOrderProduct {
	product: IProduct;
	quantity: number;
	unitPrice: number;
	color: string;
	type: string;
}

export interface IOrderAddress {
	city: string;
	zip_code: string;
	street_or_building_name: string;
	area: string;
}

export interface IOrder extends Document {
	user: IUser;
	shop: Types.ObjectId;
	products: IOrderProduct[];
	coupon: Types.ObjectId | null;
	totalAmount: number;
	discount: number;
	deliveryCharge: number;
	finalAmount: number;
	status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled' | 'Picked';
	shippingAddress: IOrderAddress;
	paymentMethod: 'COD' | 'Online';
	paymentStatus: 'Pending' | 'Paid' | 'Failed';
	createdAt?: Date;
	updatedAt?: Date;
	payment?: IPayment | null;
	assigned: Types.ObjectId;
}

export interface IAgentOrder {
	orderId: Types.ObjectId;
	destination: { city: string; area: string; zip_code: string; street_or_building_name: string };
	agentId: Types.ObjectId;
	status: 'Picked' | 'Delivered' | 'Assigned';
	createdAt?: Date;
	updatedAt?: Date;
}
