
import http from 'http';
import mongoose from 'mongoose';
import { app } from './app.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/hr_portal';
async function start() {
	console.log('Connecting to MongoDB...');
	await mongoose.connect(MONGO_URI);
	console.log('Connected to MongoDB');

	const server = http.createServer(app);
	server.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

start().catch((err) => {
	console.error('Failed to start server', err);
	process.exit(1);
});


