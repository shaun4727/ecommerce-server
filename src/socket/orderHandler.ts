import { Server, Socket } from 'socket.io';
import { Order } from '../app/modules/order/order.model';

export const orderHandler = (io: Server, socket: Socket) => {
	// 1. Join a specific order room (for tracking)
	socket.on('joinOrderRoom', ({ orderId }: { orderId: string }, callback) => {
		const roomName = `order_${orderId}`;
		socket.join(roomName);
		callback(`Socket ${socket.id} joined ${roomName}`);
	});

	socket.on('orderPlaced', () => {
		io.to('admins').emit('newOrderPlaced');
	});

	socket.on('OrderPicked', async ({ orderId }: { orderId: string }) => {
		const order = await Order.findById(orderId);

		if (order) {
			io.to(`user_${order.user}`).emit('ShippedOrder', { orderId });
		}
		// io.to('admins').emit('newOrderPlaced');
	});

	// 3. Assign order to Agent
	socket.on('OrderAssigned', ({ agentId }: { agentId: string }) => {
		io.to(`user_${agentId}`).emit('NewOrderForAgent');
	});
};
