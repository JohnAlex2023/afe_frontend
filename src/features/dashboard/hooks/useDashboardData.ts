/**
 * Custom hook for managing dashboard data
 * Handles fetching, filtering, and calculating statistics for facturas
 */

import { useState, useEffect, useCallback } from 'react';
import type { Factura, DashboardStats, EstadoFactura, VistaFacturas } from '../types';
import { facturasService } from '../services/facturas.service';
import { isEstadoAprobado, isEstadoRechazado } from '../utils';

interface UseDashboardDataParams {
  userRole?: string;
  filterEstado: EstadoFactura | 'todos';
  vistaFacturas: VistaFacturas;
}

interface UseDashboardDataReturn {
  facturas: Factura[];
  stats: DashboardStats;
  totalTodasFacturas: number;
  totalAsignadas: number;
  loading: boolean;
  error: string;
  loadData: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardData = ({
  userRole,
  filterEstado,
  vistaFacturas,
}: UseDashboardDataParams): UseDashboardDataReturn => {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pendientes: 0,
    en_revision: 0,
    aprobadas: 0,
    aprobadas_auto: 0,
    rechazadas: 0,
  });
  const [totalTodasFacturas, setTotalTodasFacturas] = useState(0);
  const [totalAsignadas, setTotalAsignadas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const calculateStats = useCallback((allFacturas: Factura[]): DashboardStats => {
    return {
      total: allFacturas.length,
      pendientes: allFacturas.filter((f) => f.estado === 'pendiente').length,
      en_revision: allFacturas.filter((f) => f.estado === 'en_revision').length,
      aprobadas: allFacturas.filter((f) => isEstadoAprobado(f.estado)).length,
      aprobadas_auto: allFacturas.filter((f) => f.estado === 'aprobada_auto').length,
      rechazadas: allFacturas.filter((f) => isEstadoRechazado(f.estado)).length,
    };
  }, []);

  const filterByEstado = useCallback(
    (allFacturas: Factura[]): Factura[] => {
      if (filterEstado === 'todos') {
        return allFacturas;
      }
      return allFacturas.filter((f) => f.estado === filterEstado);
    },
    [filterEstado]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (userRole === 'admin') {
        // Admin can see both "todas" and "asignadas"
        const [todasResponse, asignadasResponse] = await Promise.all([
          facturasService.fetchFacturas({ page: 1, per_page: 2000 }),
          facturasService.fetchFacturas({ solo_asignadas: true, page: 1, per_page: 2000 }),
        ]);

        const todasFacturasData = todasResponse.data || [];
        const asignadasData = asignadasResponse.data || [];

        setTotalTodasFacturas(todasResponse.pagination?.total || todasFacturasData.length);
        setTotalAsignadas(asignadasResponse.pagination?.total || asignadasData.length);

        const allFacturas = vistaFacturas === 'todas' ? todasFacturasData : asignadasData;
        const filtered = filterByEstado(allFacturas);

        setFacturas(filtered);
        setStats(calculateStats(allFacturas));
      } else {
        // Responsable only sees assigned facturas
        const response = await facturasService.fetchFacturas({ page: 1, per_page: 2000 });
        const allFacturas = response.data || [];

        const total = response.pagination?.total || allFacturas.length;
        setTotalAsignadas(total);
        setTotalTodasFacturas(total);

        const filtered = filterByEstado(allFacturas);

        setFacturas(filtered);
        setStats(calculateStats(allFacturas));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  }, [userRole, filterEstado, vistaFacturas, filterByEstado, calculateStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    facturas,
    stats,
    totalTodasFacturas,
    totalAsignadas,
    loading,
    error,
    loadData,
    clearError,
  };
};
