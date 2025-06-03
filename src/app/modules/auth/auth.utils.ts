import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { IJwtPayload } from './auth.interface';

export const createToken = (
    jwtPayload: IJwtPayload,
    secret: Secret,
    expiresIn: string,
): string => {
    return jwt.sign(jwtPayload, secret, {
        expiresIn,
    });
};

export const verifyToken = (
    token: string,
    secret: Secret
): IJwtPayload & JwtPayload => {
    return jwt.verify(token, secret) as IJwtPayload & JwtPayload;
};
