import { z } from 'zod';

export const registerSchema = z.object({
	name: z.string().min(3).max(50),
	username: z.string().min(3).max(20),
	email: z.string().email().max(100),
	password: z.string().min(6).max(100),
	role: z.enum(['Admin', 'Editor', 'Viewer']).optional()
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;


