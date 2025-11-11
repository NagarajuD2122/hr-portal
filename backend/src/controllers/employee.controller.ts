import { Request, Response } from 'express';
import { EmployeeModel } from '../models/Employee.js';
import { EmployeeCreateInput, EmployeeQueryInput, EmployeeUpdateInput } from '../validation/employee.schemas.js';

export async function listEmployeesHandler(req: Request<unknown, unknown, unknown, EmployeeQueryInput>, res: Response) {
	const { page = 1, limit = 5, search, role, isActive } = req.query;
	const filter: any = { deletedAt: null };
	if (search) {
		filter.$or = [
			{ name: { $regex: search, $options: 'i' } },
			{ email: { $regex: search, $options: 'i' } }
		];
	}
	if (role) filter.role = role;
	if (typeof isActive !== 'undefined') filter.isActive = isActive;

	const skip = (page - 1) * limit;
	const [items, total] = await Promise.all([
		EmployeeModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
		EmployeeModel.countDocuments(filter)
	]);
	return res.json({
		items,
		page,
		limit,
		total,
		totalPages: Math.ceil(total / limit)
	});
}

export async function getEmployeeHandler(req: Request<{ id: string }>, res: Response) {
	const item = await EmployeeModel.findOne({ _id: req.params.id, deletedAt: null }).lean().exec();
	if (!item) return res.status(404).json({ message: 'Employee not found' });
	return res.json(item);
}

export async function createEmployeeHandler(req: Request<unknown, unknown, EmployeeCreateInput>, res: Response) {
	const created = await EmployeeModel.create({ ...req.body, deletedAt: null });
	return res.status(201).json(created);
}

export async function updateEmployeeHandler(
	req: Request<{ id: string }, unknown, EmployeeUpdateInput>,
	res: Response
) {
	const updated = await EmployeeModel.findOneAndUpdate(
		{ _id: req.params.id, deletedAt: null },
		{ $set: req.body },
		{ new: true }
	).lean().exec();
	if (!updated) return res.status(404).json({ message: 'Employee not found' });
	return res.json(updated);
}

export async function deleteEmployeeHandler(req: Request<{ id: string }>, res: Response) {
	const updated = await EmployeeModel.findOneAndUpdate(
		{ _id: req.params.id, deletedAt: null },
		{ $set: { deletedAt: new Date(), isActive: false } },
		{ new: true }
	).lean().exec();
	if (!updated) return res.status(404).json({ message: 'Employee not found' });
	return res.json({ success: true });
}


