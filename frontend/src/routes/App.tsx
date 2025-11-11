import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LoginPage } from '../views/auth/LoginPage';
import { RegisterPage } from '../views/auth/RegisterPage';
import { DashboardPage } from '../views/DashboardPage';
import { EmployeesPage } from '../views/employees/EmployeesPage';
import { EmployeeEditPage } from '../views/employees/EmployeeEditPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';
import { useAppSelector } from '../utils/hooks';
import MainSideBar from './main-sideber/MainSidebar';


export function App() {
	const token = useAppSelector((s) => s.auth.accessToken);
	return (
		<div className='flex h-full w-full'>
			{token && <MainSideBar />}
			<Routes>
				<Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route element={<ProtectedRoute />}>
					<Route path="/dashboard" element={<DashboardPage />} />
					<Route path="/employees" element={<EmployeesPage />} />
					<Route
						path="/employees/:id"
						element={
							<RoleProtectedRoute allowed={['Admin', 'Editor']}>
								<EmployeeEditPage />
							</RoleProtectedRoute>
						}
					/>
				</Route>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
			<ToastContainer position="top-right" />
		</div>
	);
}


