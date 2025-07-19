import { Server, Socket } from 'socket.io';
// import { storeAgentLocation } from '../services/deliveryService';

export default function setupDeliveryTracking(io: Server, socket: Socket) {
	socket.on('realtime_location', async (payload: Record<string, string>) => {
		// { agentId, latitude, longitude, timestamp }
		const orderId = payload.orderId;

		// console.log(`📍 Agent ${orderId} sent location:`, payload);

		io.to(orderId).emit('share_with_user', { lat: payload.latitude, lng: payload.longitude });
	});
	socket.on('join_order', ({ orderId }) => {
		socket.join(orderId);
		console.log('server joined order room');
	});

	socket.on('disconnect', () => {
		console.log(`❌ Socket ${socket.id} disconnected`);
	});
}
