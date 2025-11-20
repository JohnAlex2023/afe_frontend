/**
 * usePermisoPagos - Hook for checking payment-related permissions
 * Validates user role and permissions for payment operations
 */

import { useMemo } from 'react';
import { useAppSelector } from '../../../app/hooks';
import type { UserRole } from '../../../types/auth.types';

interface PermisosPago {
  puedVerPagos: boolean;
  puedeRegistrarPago: boolean;
  puedeVerHistorial: boolean;
  puedeEditarPago: boolean;
  puedEliminarPago: boolean;
  isCounterOrAdmin: boolean;
  userRole: UserRole | undefined;
}

export const usePermisoPagos = (): PermisosPago => {
  const user = useAppSelector((state) => state.auth.user);

  const permisos = useMemo<PermisosPago>(() => {
    const userRole = user?.rol as UserRole | undefined;
    const isCounterOrAdmin = userRole === 'contador' || userRole === 'admin';

    return {
      // CONTADOR y ADMIN pueden ver pagos
      puedVerPagos: isCounterOrAdmin,

      // CONTADOR y ADMIN pueden registrar pagos
      puedeRegistrarPago: isCounterOrAdmin,

      // CONTADOR y ADMIN pueden ver historial completo
      puedeVerHistorial: isCounterOrAdmin,

      // Solo ADMIN puede editar pagos registrados
      puedeEditarPago: userRole === 'admin',

      // Solo ADMIN puede eliminar pagos
      puedEliminarPago: userRole === 'admin',

      // Helper para usar en condiciones simples
      isCounterOrAdmin,

      // Rol actual del usuario
      userRole,
    };
  }, [user?.rol]);

  return permisos;
};

/**
 * Hook simplificado para verificar si el usuario es CONTADOR o ADMIN
 * Útil cuando solo necesitas una verificación rápida
 */
export const useIsCounterOrAdmin = (): boolean => {
  const { isCounterOrAdmin } = usePermisoPagos();
  return isCounterOrAdmin;
};

/**
 * Hook para verificar un permiso específico
 * @param permission - El permiso a verificar
 */
export const useHasPermiso = (
  permission: keyof Omit<PermisosPago, 'userRole' | 'isCounterOrAdmin'>
): boolean => {
  const permisos = usePermisoPagos();
  return permisos[permission];
};

export default usePermisoPagos;
