// import { Server } from 'http';
import http from 'http';
import mongoose from 'mongoose';
// server socket
import { Server as socketServer } from 'socket.io';
import config from './app/config';
import setupDeliveryTracking from './app/sockets/deliveryTracker';
import application from './appFile';

// for socket
let io: socketServer;
const server = http.createServer(application);

// Database connection
async function connectToDatabase() {
	try {
		await mongoose.connect(config.db_url as string);
		console.log('🛢 Database connected successfully');
	} catch (err) {
		console.error('Failed to connect to database:', err);
		process.exit(1);
	}
}

// Graceful shutdown
function gracefulShutdown(signal: string) {
	console.log(`Received ${signal}. Closing server...`);
	if (server) {
		server.close(() => {
			console.log('Server closed gracefully');
			process.exit(0);
		});
	} else {
		process.exit(0);
	}
}

// Application bootstrap
async function bootstrap() {
	try {
		await connectToDatabase();
		//await seed();

		/**
		 * code added for socket starts
		 */
		const allowedOrigins =
			process.env.NODE_ENV === 'production' ? ['http://103.174.51.143:3000'] : ['http://103.174.51.143:3000'];

		io = new socketServer(server, {
			cors: {
				origin: allowedOrigins,
				methods: ['GET', 'POST'],
				credentials: true,
			},
		});

		io.on('connection', (socket) => {
			console.log('Socket connected', socket.id);
			setupDeliveryTracking(io, socket);

			socket.on('disconnect', () => {
				console.log('socket disconnected', socket.id);
			});
		});

		server.listen(config.port, () => {
			console.log(`🚀 Application is running on port ${config.port}`);
		});
		/**
		 * code added for socket ends
		 */

		/**
		 * server code before socket starts
		 */
		// server = application.listen(config.port, () => {
		// 	console.log(`🚀 Application is running on port ${config.port}`);
		// });

		/**
		 * server code before socket ends
		 */

		// Listen for termination signals
		process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
		process.on('SIGINT', () => gracefulShutdown('SIGINT'));

		// Error handling
		process.on('uncaughtException', (error) => {
			console.error('Uncaught Exception:', error);
			gracefulShutdown('uncaughtException');
		});

		process.on('unhandledRejection', (error) => {
			console.error('Unhandled Rejection:', error);
			gracefulShutdown('unhandledRejection');
		});
	} catch (error) {
		console.error('Error during bootstrap:', error);
		process.exit(1);
	}
}

// Start the application
bootstrap();
