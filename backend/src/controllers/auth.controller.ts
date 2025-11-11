import { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { LoginInput, RegisterInput } from '../validation/auth.schemas.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../middlewares/auth.middleware.js';

function setRefreshCookie(res: Response, token: string) {
	const isProd = process.env.NODE_ENV === 'production';
	res.cookie('refreshToken', token, {
		httpOnly: true,
		secure: isProd,
		sameSite: isProd ? 'none' : 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000
	});
}

export async function registerHandler(req: Request<unknown, unknown, RegisterInput>, res: Response) {
	const { name, username, email, password, role } = req.body;
	const exists = await UserModel.findOne({ email }).exec();
	if (exists) return res.status(400).json({ message: 'Email already in use' });
	const user = await UserModel.create({ name, username, email, password, role: role ?? 'Viewer' });
	const accessToken = signAccessToken({ id: user.id, role: user.role });
	const refreshToken = signRefreshToken({ id: user.id, role: user.role });
	setRefreshCookie(res, refreshToken);
	return res.status(201).json({
		accessToken,
		user: {
			id: user.id,
			name: user.name,
			username: user.username,
			email: user.email,
			role: user.role
		}
	});
}

export async function loginHandler(req: Request<unknown, unknown, LoginInput>, res: Response) {
	const { email, password } = req.body;
	const user = await UserModel.findOne({ email }).exec();
	if (!user) return res.status(401).json({ message: 'Invalid credentials' });
	const ok = await user.comparePassword(password);
	if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
	const accessToken = signAccessToken({ id: user.id, role: user.role });
	const refreshToken = signRefreshToken({ id: user.id, role: user.role });
	setRefreshCookie(res, refreshToken);
	return res.json({
		accessToken,
		user: {
			id: user.id,
			name: user.name,
			username: user.username,
			email: user.email,
			role: user.role
		}
	});
}

export async function refreshHandler(req: Request, res: Response) {
	const token = req.cookies?.refreshToken as string | undefined;
	if (!token) return res.status(401).json({ message: 'No refresh token' });
	try {
		const payload = verifyRefreshToken(token);
		const user = await UserModel.findById(payload.sub).exec();
		if (!user) return res.status(401).json({ message: 'Invalid user' });
		const accessToken = signAccessToken({ id: user.id, role: user.role });
		// optional: rotate refresh token
		const newRefresh = signRefreshToken({ id: user.id, role: user.role });
		setRefreshCookie(res, newRefresh);
		return res.json({ accessToken });
	} catch {
		return res.status(401).json({ message: 'Invalid refresh token' });
	}
}

export async function logoutHandler(_req: Request, res: Response) {
	res.clearCookie('refreshToken', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
	});
	return res.json({ success: true });
}

export async function meHandler(req: Request, res: Response) {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
	const user = await UserModel.findById(req.user.id).lean().exec();
	if (!user) return res.status(404).json({ message: 'User not found' });
	return res.json({
		id: user._id.toString(),
		name: user.name,
		username: user.username,
		email: user.email,
		role: user.role
	});
}


