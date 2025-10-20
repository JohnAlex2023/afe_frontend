/**
 * BarChartFacturas - Stacked Bar Chart showing facturas by month
 * Shows distribution of facturas by estado across months
 */

import { Box, Typography, Paper, Skeleton } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { zentriaColors } from '../../../../theme/colors';
import type { MonthlyStats } from '../../hooks/useDashboardStats';

interface BarChartFacturasProps {
  data: MonthlyStats[];
  loading?: boolean;
}

export const BarChartFacturas: React.FC<BarChartFacturasProps> = ({ data, loading }) => {
  if (loading) {
    return <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />;
  }

  if (!data || data.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography color="text.secondary">No hay datos disponibles</Typography>
      </Paper>
    );
  }

  // Transform data for stacked bar chart
  const chartData = data.map((item) => ({
    periodo: item.periodo_display,
    Pendientes: item.facturas_por_estado?.pendiente || 0,
    'En Revisión': item.facturas_por_estado?.en_revision || 0,
    'Aprobadas Auto': item.facturas_por_estado?.aprobada_auto || 0,
    Aprobadas: item.facturas_por_estado?.aprobada || 0,
    Rechazadas: item.facturas_por_estado?.rechazada || 0,
    Total: item.total_facturas || 0,
  }));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        height: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Box mb={2}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Facturas por Mes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Distribución de estados en los últimos meses
        </Typography>
      </Box>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="periodo"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="circle"
          />
          <Bar
            dataKey="Total"
            fill={zentriaColors.violeta.main}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};
