import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './app/hooks';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './features/auth/LoginPage';
import MicrosoftCallbackPage from './features/auth/MicrosoftCallbackPage';
import DashboardPage from './features/dashboard/DashboardPage';
import FacturasPage from './features/facturas/FacturasPage';
import FacturasPendientesPage from './features/facturas/FacturasPendientesPage';
import ResponsablesPage from './features/admin/ResponsablesPage';
import ProveedoresManagementPage from './features/proveedores/ProveedoresManagementPage';
import EmailConfigPage from './features/email-config/EmailConfigPage';
import CuentaDetailPage from './features/email-config/CuentaDetailPage';
import { GestionPagosPage } from './features/pagos/pages/GestionPagosPage';
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
      <Route path="/auth/microsoft/callback" element={<MicrosoftCallbackPage />} />

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

        {/* Ruta para contadores - Facturas Pendientes (NUEVO 2025-11-18) */}
        <Route
          path="contabilidad/pendientes"
          element={
            <RoleGuard allowedRoles={['contador']}>
              <FacturasPendientesPage />
            </RoleGuard>
          }
        />

        {/* Ruta para gestión de pagos - CONTADOR y ADMIN únicamente (FASE 2 REFACTORIZADO) */}
        <Route
          path="pagos"
          element={
            <RoleGuard allowedRoles={['contador', 'admin']}>
              <GestionPagosPage />
            </RoleGuard>
          }
        />

        {/* Rutas de administración - admin y viewer (solo lectura) */}
        <Route
          path="admin/responsables"
          element={
            <RoleGuard allowedRoles={['admin', 'viewer']}>
              <ResponsablesPage />
            </RoleGuard>
          }
        />

        {/* Gestión consolidada de proveedores y asignaciones - admin y viewer (solo lectura) */}
        <Route
          path="gestion/proveedores"
          element={
            <RoleGuard allowedRoles={['admin', 'viewer']}>
              <ProveedoresManagementPage />
            </RoleGuard>
          }
        />

        {/* Configuración de Correos - solo para admin */}
        <Route
          path="email-config"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <EmailConfigPage />
            </RoleGuard>
          }
        />
        <Route
          path="email-config/:id"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <CuentaDetailPage />
            </RoleGuard>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
