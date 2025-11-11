import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router as authRouter } from './routes/auth.routes.js';
import { router as employeeRouter } from './routes/employee.routes.js';

export const app = express();

app.use(cors({
	origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
	credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
	res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/employees', employeeRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error(err);
	const status = typeof err.status === 'number' ? err.status : 500;
	res.status(status).json({ message: err.message ?? 'Internal Server Error' });
});


