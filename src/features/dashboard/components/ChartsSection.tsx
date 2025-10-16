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

export const ChartsSection: React.FC = () => {
  const { monthlyStats, workflowStats, comparisonStats, loading, error } = useDashboardStats();

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
          <PieChartEstados data={workflowStats} loading={loading} />
        </Grid>

        {/* Bottom Row - Secondary Charts */}
        <Grid item xs={12} lg={8}>
          <LineChartMontos data={monthlyStats} loading={loading} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <GaugeChartKPI data={comparisonStats} loading={loading} />
        </Grid>
      </Grid>
    </Box>
  );
};
