import { z } from 'zod';

const roleEnum = z.enum(['Admin', 'Editor', 'Viewer']);

const idParam = z.object({
	id: z.string().min(1)
});

const skillsSchema = z.array(z.string().min(2).max(10)).max(100);
const futureISODate = z.string().refine((val) => {
	const d = new Date(val);
	return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}, 'Date must be in the future');

export const employeeBaseSchema = z.object({
	name: z.string().min(3).max(50),
	username: z.string().min(3).max(20),
	email: z.string().email().max(100),
	phone: z.string().max(20).optional(),
	website: z.string().url().max(100).optional(),
	role: roleEnum,
	isActive: z.boolean().default(true),
	skills: skillsSchema,
	availableSlots: z.array(futureISODate),
	address: z.object({
		street: z.string().min(5).max(100),
		city: z.string().min(2).max(50),
		zipcode: z.string().regex(/^\d{5,10}$/)
	}),
	company: z.object({
		name: z.string().min(2).max(100)
	})
});

export const employeeCreateSchema = employeeBaseSchema;
export const employeeUpdateSchema = employeeBaseSchema.partial();

export const employeeQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	search: z.string().max(100).optional(),
	role: roleEnum.optional(),
	isActive: z.coerce.boolean().optional()
});

export const employeeIdParamSchema = idParam;

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;


