import { Server, Socket } from 'socket.io';

export const userHandler = (io: Server, socket: Socket) => {
	// 1. Extract the data we attached in middleware
	const { userId, role } = socket.data;

	// 2. Join Role-Based Rooms
	if (role === 'admin') {
		socket.join('admins');
	} else if (role === 'agent') {
		socket.join('agents');
	} else {
		socket.join('users');
	}

	// Private ID room (for targeted notifications)
	socket.join(`user_${userId}`);
};
