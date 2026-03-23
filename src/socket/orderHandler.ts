import { Server, Socket } from 'socket.io';
import { Order } from '../app/modules/order/order.model';

export const orderHandler = (io: Server, socket: Socket) => {
	// 1. Join a specific order room (for tracking)
	socket.on('joinOrderRoom', ({ orderId }: { orderId: string }, callback) => {
		const roomName = `order_${orderId}`;
		socket.join(roomName);
		console.log(`Socket ${socket.id} joined ${roomName}`);
		callback(`Socket ${socket.id} joined ${roomName}`);
	});

	socket.on('orderPlaced', () => {
		io.to('admins').emit('newOrderPlaced');
	});
	socket.on('OrderPicked', async ({ orderId }: { orderId: string }) => {
		const order = Order.findById(orderId);
		console.log(order);
		// io.to('admins').emit('newOrderPlaced');
	});

	// 3. Assign order to Agent
	socket.on('OrderAssigned', ({ agentId }: { agentId: string }) => {
		io.to(`user_${agentId}`).emit('NewOrderForAgent');
	});
};
