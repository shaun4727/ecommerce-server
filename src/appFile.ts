import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import os from 'os';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import notFound from './app/middleware/notFound';
import router from './app/routes';
// import seedAdmin from './app/DB/seed';
// import { sslService } from './app/modules/sslcommerz/sslcommerz.service';

const application: Application = express();

// Middleware setup
application.use(cors({ origin: 'http://103.174.51.143:3000' }));
application.use(cookieParser());
application.use(express.json());
application.use(express.urlencoded({ extended: true }));

application.use('/api/v1', router);
application.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'http://103.174.51.143:3000');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Methods', 'GET, POST');
	next();
});

// seedAdmin();

// Test route
application.get('/', (req: Request, res: Response, next: NextFunction) => {
	const currentDateTime = new Date().toISOString();
	const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
	const serverHostname = os.hostname();
	const serverPlatform = os.platform();
	const serverUptime = os.uptime();

	res.status(StatusCodes.OK).json({
		success: true,
		message: 'Welcome to the EMart',
		version: '1.0.0',
		clientDetails: {
			ipAddress: clientIp,
			accessedAt: currentDateTime,
		},
		serverDetails: {
			hostname: serverHostname,
			platform: serverPlatform,
			uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor((serverUptime / 60) % 60)} minutes`,
		},
	});
});

application.use(globalErrorHandler);

//Not Found
application.use(notFound);

export default application; // Export the app for use in server.ts
