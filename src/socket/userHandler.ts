import { Server, Socket } from 'socket.io';

export const userHandler = (io: Server, socket: Socket) => {
	// 1. Extract the data we attached in middleware
	const { userId, role } = socket.data;

	// 2. Join Role-Based Rooms
	if (role === 'admin') {
		socket.join('admins');
		console.log(`🛡️ Admin joined admins room: ${userId}`);
	} else if (role === 'agent') {
		socket.join('agents');
		console.log(`🛵 Agent joined agents room: ${userId}`);
	} else {
		socket.join('users');
		console.log(`👤 User joined users room: ${userId}`);
	}

	// Private ID room (for targeted notifications)
	socket.join(`user_${userId}`);
	console.log(`📡 Socket ${socket.id} is now reachable via user_${userId}`);
};
