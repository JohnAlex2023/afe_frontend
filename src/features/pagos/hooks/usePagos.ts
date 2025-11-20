/**
 * usePagos - Hook for managing payment-related data
 * Handles fetching, filtering, and calculating payment statistics
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { fetchFacturasPendientes } from '../../facturas/facturasSlice';
import type { FacturaPendiente } from '../../../types/factura.types';

interface PagosStats {
  totalFacturas: number;
  totalMonto: number;
  totalPagado: number;
  totalPendiente: number;
  porcentajePago: number;
  pagosProcesados: number;
}

export const usePagos = (userId?: number) => {
  const dispatch = useAppDispatch();
  const { pendientes, loading, error } = useAppSelector((state) => state.facturas);

  // Load pending invoices on mount or when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(fetchFacturasPendientes(userId));
    }
  }, [dispatch, userId]);

  // Filter approved invoices only
  const facturasAprobadas = useMemo(
    () => pendientes.filter((f) => f.estado === 'aprobada' || f.estado === 'aprobada_auto'),
    [pendientes]
  );

  // Calculate payment statistics
  const stats = useMemo<PagosStats>(() => {
    const totalFacturas = facturasAprobadas.length;
    const totalMonto = facturasAprobadas.reduce((sum, f) => sum + f.monto, 0);

    // Note: In a real implementation, you would get totalPagado from the backend
    // For now, this is a placeholder for future API integration
    const totalPagado = 0;
    const totalPendiente = totalMonto - totalPagado;
    const porcentajePago = totalMonto > 0 ? (totalPagado / totalMonto) * 100 : 0;
    const pagosProcesados = 0; // Placeholder - would come from payment history

    return {
      totalFacturas,
      totalMonto,
      totalPagado,
      totalPendiente,
      porcentajePago,
      pagosProcesados,
    };
  }, [facturasAprobadas]);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (userId) {
      dispatch(fetchFacturasPendientes(userId));
    }
  }, [dispatch, userId]);

  return {
    facturasAprobadas,
    stats,
    loading,
    error,
    refreshData,
  };
};

export default usePagos;
