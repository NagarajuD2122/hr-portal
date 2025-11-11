import { useAppDispatch, useAppSelector } from '../utils/hooks';
import { clearAuth } from '../store/slices/auth.slice';
import { toast } from 'react-toastify';
import { Button } from 'primereact/button';

export function DashboardPage() {
	const user = useAppSelector((s) => s.auth.user);
	const dispatch = useAppDispatch();

	const logout = async () => {
		await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
		dispatch(clearAuth());
		toast.info('Logged out');
	};

	return (
		<div className="w-full flex flex-column gap-4 m-4">
			<div>
			<h2>Dashboard</h2>
			{user ? (
				<p>
					Signed in as <strong>{user.name}</strong> ({user.role})
				</p>
			) : (
				<p>Not signed in</p>
				
			)}
			<Button label='Logout' onClick={logout} />
		</div>
				</div>
	);
}


