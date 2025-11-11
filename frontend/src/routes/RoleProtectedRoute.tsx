import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../utils/hooks';
import type { UserRole } from '../store/slices/auth.slice';

export function RoleProtectedRoute({ allowed, children }: { allowed: UserRole[]; children: ReactNode }) {
	const user = useAppSelector((s) => s.auth.user);
	const location = useLocation();
	if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
	if (!allowed.includes(user.role)) return <Navigate to="/dashboard" replace />;
	return <>{children}</>;
}


