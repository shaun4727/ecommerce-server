import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { IJwtPayload } from '../auth/auth.interface';
import { OrderService } from './order.service';

const createOrder = catchAsync(async (req: Request, res: Response) => {
	const result = await OrderService.createOrder(req.body, req.user as IJwtPayload);

	sendResponse(res, {
		statusCode: StatusCodes.CREATED,
		success: true,
		message: 'Order created successfully',
		data: result,
	});
});

const getMyShopOrders = catchAsync(async (req: Request, res: Response) => {
	const result = await OrderService.getMyShopOrders(req.query, req.user as IJwtPayload);

	sendResponse(res, {
		statusCode: StatusCodes.OK,
		success: true,
		message: 'Order retrieve successfully',
		data: result.result,
		meta: result.meta,
	});
});

const getOrderDetails = catchAsync(async (req: Request, res: Response) => {
	const result = await OrderService.getOrderDetails(req.params.orderId);

	sendResponse(res, {
		statusCode: StatusCodes.OK,
		success: true,
		message: 'Order retrieved successfully',
		data: result,
	});
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
	const result = await OrderService.getMyOrders(req.query, req.user as IJwtPayload);

	sendResponse(res, {
		statusCode: StatusCodes.OK,
		success: true,
		message: 'Order retrieved successfully',
		data: result.result,
		meta: result.meta,
	});
});

const changeOrderStatus = catchAsync(async (req: Request, res: Response) => {
	const { status } = req.body;
	const result = await OrderService.changeOrderStatus(req.params.orderId, status, req.user as IJwtPayload);

	sendResponse(res, {
		statusCode: StatusCodes.OK,
		success: true,
		message: 'Order status changed successfully',
		data: result,
	});
});

const assignAgentToOrder = catchAsync(async (req: Request, res: Response) => {
	const result = await OrderService.assignOrderToAgentIntoDB(req.body);

	sendResponse(res, {
		statusCode: StatusCodes.OK,
		success: true,
		message: 'Agent assigned successfully',
		data: result,
	});
});

const getAgentOrders = catchAsync(async (req: Request, res: Response) => {
	const { agentId } = req.params;

	const result = await OrderService.getAgentOrdersFromDB(agentId);

	sendResponse(res, {
		statusCode: StatusCodes.OK,
		success: true,
		message: 'Agent orders retrieved successfully',
		data: result,
	});
});
const getDeliveryAddress = catchAsync(async (req: Request, res: Response) => {
	const { agentId } = req.params;
	const result = await OrderService.getDeliveryAddressFromDB(agentId);

	sendResponse(res, {
		statusCode: StatusCodes.OK,
		success: true,
		message: 'Delivery address retrieved successfully',
		data: result,
	});
});

const updateDeliveryStatus = catchAsync(async (req: Request, res: Response) => {
	const { orderId } = req.params;

	await OrderService.updateDeliveryStatusIntoDB(orderId, req.user?.userId);

	sendResponse(res, {
		statusCode: StatusCodes.OK,
		success: true,
		message: 'Order status updated successfully',
		data: null,
	});
});

export const OrderController = {
	createOrder,
	getMyShopOrders,
	getOrderDetails,
	getMyOrders,
	changeOrderStatus,
	assignAgentToOrder,
	getAgentOrders,
	getDeliveryAddress,
	updateDeliveryStatus,
};
