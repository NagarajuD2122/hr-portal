import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

export type JwtPayload = {
	sub: string;
	role: 'Admin' | 'Editor' | 'Viewer';
};

export function signAccessToken(user: { id: string; role: JwtPayload['role'] }) {
	const payload: JwtPayload = { sub: user.id, role: user.role };
	const secret = process.env.JWT_ACCESS_SECRET!;
	return jwt.sign(payload, secret, { expiresIn: '15m' });
}

export function signRefreshToken(user: { id: string; role: JwtPayload['role'] }) {
	const payload: JwtPayload = { sub: user.id, role: user.role };
	const secret = process.env.JWT_REFRESH_SECRET!;
	return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): JwtPayload {
	const secret = process.env.JWT_ACCESS_SECRET!;
	return jwt.verify(token, secret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
	const secret = process.env.JWT_REFRESH_SECRET!;
	return jwt.verify(token, secret) as JwtPayload;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user?: { id: string; role: JwtPayload['role'] };
		}
	}
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
	try {
		const header = req.headers.authorization;
		if (!header?.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		const token = header.split(' ')[1]!;
		const payload = verifyAccessToken(token);
		// optional: ensure user still exists/active
		const user = await UserModel.findById(payload.sub).lean().exec();
		if (!user) return res.status(401).json({ message: 'Invalid user' });
		req.user = { id: payload.sub, role: payload.role };
		next();
	} catch {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

export function requireRole(roles: Array<JwtPayload['role']>) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		next();
	};
}


