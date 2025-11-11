import mongoose, { Schema } from 'mongoose';

export interface EmployeeDoc {
	_id: mongoose.Types.ObjectId;
	name: string;
	username: string;
	email: string;
	phone?: string;
	website?: string;
	role: 'Admin' | 'Editor' | 'Viewer';
	isActive: boolean;
	skills: string[];
	availableSlots: string[];
	address: {
		street: string;
		city: string;
		zipcode: string;
	};
	company: {
		name: string;
	};
	deletedAt?: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

const employeeSchema = new Schema<EmployeeDoc>(
	{
		name: { type: String, required: true },
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		phone: String,
		website: String,
		role: { type: String, enum: ['Admin', 'Editor', 'Viewer'], required: true },
		isActive: { type: Boolean, default: true },
		skills: { type: [String], default: [] },
		availableSlots: { type: [String], default: [] },
		address: {
			street: { type: String, required: true },
			city: { type: String, required: true },
			zipcode: { type: String, required: true }
		},
		company: {
			name: { type: String, required: true }
		},
		deletedAt: { type: Date, default: null }
	},
	{ timestamps: true }
);

export const EmployeeModel = mongoose.model<EmployeeDoc>('Employee', employeeSchema);


