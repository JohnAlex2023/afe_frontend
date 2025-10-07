import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './app/hooks';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import FacturasPage from './features/facturas/FacturasPage';
import ResponsablesPage from './features/admin/ResponsablesPage';
import ProveedoresManagementPage from './features/proveedores/ProveedoresManagementPage';
import RoleGuard from './components/Auth/RoleGuard';

/**
 * App Routes Configuration
 */

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="facturas" element={<FacturasPage />} />

        {/* Rutas de administración - solo para admin */}
        <Route
          path="admin/responsables"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <ResponsablesPage />
            </RoleGuard>
          }
        />

        {/* Gestión consolidada de proveedores y asignaciones */}
        <Route
          path="gestion/proveedores"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <ProveedoresManagementPage />
            </RoleGuard>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
