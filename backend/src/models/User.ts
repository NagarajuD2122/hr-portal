import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface UserDoc {
	_id: mongoose.Types.ObjectId;
	name: string;
	username: string;
	email: string;
	password: string;
	role: UserRole;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<UserDoc>(
	{
		name: { type: String, required: true },
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true, index: true },
		password: { type: String, required: true },
		role: { type: String, enum: ['Admin', 'Editor', 'Viewer'], default: 'Viewer', required: true },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.comparePassword = function (candidate: string) {
	return bcrypt.compare(candidate, this.password);
};

export const UserModel = mongoose.model<UserDoc>('User', userSchema);


