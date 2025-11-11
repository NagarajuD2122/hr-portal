import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { UserModel } from '../models/User.js';
import { EmployeeModel } from '../models/Employee.js';

async function run() {
	const uri = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/hr_portal';
	await mongoose.connect(uri);
	console.log('Connected to MongoDB');

	await UserModel.deleteMany({});
	await EmployeeModel.deleteMany({});

	await UserModel.create([
		{
			name: 'Admin User',
			username: 'admin',
			email: 'admin@example.com',
			password: 'Admin@123',
			role: 'Admin'
		},
		{
			name: 'Editor User',
			username: 'editor',
			email: 'editor@example.com',
			password: 'Editor@123',
			role: 'Editor'
		},
		{
			name: 'Viewer User',
			username: 'viewer',
			email: 'viewer@example.com',
			password: 'Viewer@123',
			role: 'Viewer'
		}
	]);

	const nowPlus = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

	await EmployeeModel.create([
		{
			name: 'Alice Johnson',
			username: 'alice',
			email: 'alice@example.com',
			role: 'Editor',
			isActive: true,
			skills: ['React', 'Node'],
			availableSlots: [nowPlus(2), nowPlus(5)],
			address: { street: '123 Main St', city: 'Metropolis', zipcode: '12345' },
			company: { name: 'Acme Inc' }
		},
		{
			name: 'Bob Smith',
			username: 'bobsmith',
			email: 'bob@example.com',
			role: 'Viewer',
			isActive: true,
			skills: ['SQL', 'Excel'],
			availableSlots: [nowPlus(3)],
			address: { street: '456 Oak Ave', city: 'Gotham', zipcode: '67890' },
			company: { name: 'Wayne Corp' }
		}
	]);

	console.log('Seed complete');
	await mongoose.disconnect();
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});


