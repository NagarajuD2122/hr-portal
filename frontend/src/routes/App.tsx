import { useRoutes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LoginPage } from '../views/auth/LoginPage';
import { RegisterPage } from '../views/auth/RegisterPage';
import { DashboardPage } from '../views/DashboardPage';
import { EmployeesPage } from '../views/employees/EmployeesPage';
import { EmployeeEditPage } from '../views/employees/EmployeeEditPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';
import MainSideBar from './main-sideber/MainSidebar';

export function App() {
  const token = localStorage.getItem('auth:accessToken');
  const routes = useRoutes([
    {
      path: '/',
      element: <Navigate to={token ? '/dashboard' : '/login'} replace />,
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/register',
      element: <RegisterPage />,
    },
    {
      element: <ProtectedRoute />,
      children: [
        { path: '/dashboard', element: <DashboardPage /> },
        { path: '/employees', element: <EmployeesPage /> },
        {
          path: '/employees/:id',
          element: (
            <RoleProtectedRoute allowed={['Admin', 'Editor']}>
              <EmployeeEditPage />
            </RoleProtectedRoute>
          ),
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);

  return (
    <div className="flex h-full w-full">
      {token && <MainSideBar />}
      {routes}
      <ToastContainer position="top-right" />
    </div>
  );
}
