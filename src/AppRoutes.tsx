import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './app/hooks';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import FacturasPage from './features/facturas/FacturasPage';
import ResponsablesPage from './features/admin/ResponsablesPage';
import ProveedoresPage from './features/admin/ProveedoresPage';
import ProveedoresManagementPage from './features/proveedores/ProveedoresPage';
import AsignacionesPage from './features/proveedores/AsignacionesPage';
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
        <Route
          path="admin/proveedores"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <ProveedoresPage />
            </RoleGuard>
          }
        />

        {/* Rutas de gestión de proveedores */}
        <Route
          path="gestion/proveedores"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <ProveedoresManagementPage />
            </RoleGuard>
          }
        />
        <Route
          path="gestion/asignaciones"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <AsignacionesPage />
            </RoleGuard>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
