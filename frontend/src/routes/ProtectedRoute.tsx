import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../utils/hooks';

export function ProtectedRoute() {
	const token = useAppSelector((s) => s.auth.accessToken);
	const location = useLocation();
	if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
	return <Outlet />;
}


