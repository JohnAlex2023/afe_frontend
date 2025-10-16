/**
 * ChartsSection - Container component for all dashboard charts
 * Organizes charts in a responsive grid layout
 */

import { Box, Grid, Alert, AlertTitle } from '@mui/material';
import { useDashboardStats } from '../hooks/useDashboardStats';
import {
  BarChartFacturas,
  LineChartMontos,
  PieChartEstados,
  GaugeChartKPI,
} from './charts';
import type { DashboardStats } from '../types';

interface ChartsSectionProps {
  stats?: DashboardStats;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ stats: dashboardStats }) => {
  const { monthlyStats, workflowStats, comparisonStats, loading, error } = useDashboardStats();

  // Convert DashboardStats to WorkflowStats format for PieChartEstados
  const pieChartData = dashboardStats ? {
    total_pendientes: dashboardStats.pendientes,
    total_en_revision: dashboardStats.en_revision,
    total_aprobadas: dashboardStats.aprobadas, // Manual approvals (estado 'aprobada'/'aprobado')
    total_aprobadas_auto: dashboardStats.aprobadas_auto, // Auto approvals (estado 'aprobada_auto')
    total_rechazadas: dashboardStats.rechazadas,
    pendientes_antiguas: 0,
    tasa_aprobacion_automatica: (dashboardStats.aprobadas + dashboardStats.aprobadas_auto) > 0
      ? (dashboardStats.aprobadas_auto / (dashboardStats.aprobadas + dashboardStats.aprobadas_auto) * 100)
      : 0,
  } : workflowStats;

  // Convert DashboardStats to ComparisonStats format for GaugeChartKPI
  const gaugeChartData = dashboardStats ? {
    aprobadas_automaticamente: dashboardStats.aprobadas_auto,
    requieren_revision: dashboardStats.pendientes + dashboardStats.en_revision,
    facturas_evaluadas: dashboardStats.total,
    tasa_aprobacion_auto: dashboardStats.total > 0
      ? dashboardStats.aprobadas_auto / dashboardStats.total
      : 0,
  } : comparisonStats;

  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        <AlertTitle>Error al cargar estadísticas</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {/* Top Row - Main Charts */}
        <Grid item xs={12} lg={8}>
          <BarChartFacturas data={monthlyStats} loading={loading} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <PieChartEstados data={pieChartData} loading={loading} />
        </Grid>

        {/* Bottom Row - Secondary Charts */}
        <Grid item xs={12} lg={8}>
          <LineChartMontos data={monthlyStats} loading={loading} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <GaugeChartKPI data={gaugeChartData} loading={loading} />
        </Grid>
      </Grid>
    </Box>
  );
};
