import { useAppDispatch, useAppSelector } from '../utils/hooks';
import { clearAuth } from '../store/slices/auth.slice';
import { toast } from 'react-toastify';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
	const user = localStorage.getItem('auth:user') ? JSON.parse(localStorage.getItem('auth:user') || 'null') : null;
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const logout = async () => {
		await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
		dispatch(clearAuth());
		localStorage.removeItem('auth:user');
		localStorage.removeItem('auth:accessToken');
		navigate("/login");
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


