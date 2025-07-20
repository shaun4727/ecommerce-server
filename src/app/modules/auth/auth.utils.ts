import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { IJwtPayload } from './auth.interface';

export const createToken = (jwtPayload: IJwtPayload, secret: Secret, expiresIn: string | number): string => {
	return jwt.sign(
		jwtPayload,
		secret as string,
		{
			expiresIn: expiresIn,
		} as SignOptions,
	);
};

export const verifyToken = (token: string, secret: Secret): IJwtPayload & JwtPayload => {
	return jwt.verify(token, secret) as IJwtPayload & JwtPayload;
};
