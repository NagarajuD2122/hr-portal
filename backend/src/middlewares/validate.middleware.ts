import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';

export function validateBody<T extends ZodSchema>(schema: T) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.body);
		if (!result.success) {
			return res.status(400).json({ message: 'Validation failed', errors: result.error.flatten() });
		}
		req.body = result.data;
		next();
	};
}

export function validateQuery<T extends ZodSchema>(schema: T) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.query);
		if (!result.success) {
			return res.status(400).json({ message: 'Validation failed', errors: result.error.flatten() });
		}
		req.query = result.data as any;
		next();
	};
}

export function validateParams<T extends ZodSchema>(schema: T) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.params);
		if (!result.success) {
			return res.status(400).json({ message: 'Validation failed', errors: result.error.flatten() });
		}
		req.params = result.data as any;
		next();
	};
}


