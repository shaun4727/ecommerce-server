import { Server, Socket } from 'socket.io';
// import { storeAgentLocation } from '../services/deliveryService';

export default function setupDeliveryTracking(io: Server, socket: Socket) {
	socket.on('realtime_location', async (payload) => {
		// { agentId, latitude, longitude, timestamp }
		const orderId = payload.pickedOrder.orderId;
		// console.log(`📍 Agent ${orderId} sent location:`, payload);

		// Store or update location in DB
		// await storeAgentLocation(payload.agentId, {
		// 	lat: payload.latitude,
		// 	lng: payload.longitude,
		// 	timestamp: payload.timestamp,
		// });

		// Emit to clients (customer, admin, etc.)
		console.log('orderId', orderId, payload.location);
		io.to(orderId).emit('share_with_user', payload.location);
		io.to(orderId).emit('updateShipment', payload.location);
	});
	socket.on('join_order', ({ orderId }) => {
		socket.join(orderId);
		console.log('server joined order room');
	});

	socket.on('disconnect', () => {
		console.log(`❌ Socket ${socket.id} disconnected`);
	});
}
