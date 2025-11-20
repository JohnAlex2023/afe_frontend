/**
 * ResumenPagosTab - Tab con estadísticas y KPIs de pagos
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  Payment,
  PendingActions,
  CheckCircle,
} from '@mui/icons-material';
import { zentriaColors } from '../../../theme/colors';

interface KPIData {
  totalFacturas: number;
  totalMonto: number;
  totalPagado: number;
  totalPendiente: number;
  porcentajePago: number;
  pagosProcesados: number;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
            {title}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 50,
            height: 50,
            borderRadius: '50%',
            bgcolor: `${color}20`,
            color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const ResumenPagosTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalFacturas: 0,
    totalMonto: 0,
    totalPagado: 0,
    totalPendiente: 0,
    porcentajePago: 0,
    pagosProcesados: 0,
  });

  useEffect(() => {
    // TODO: Cargar datos de KPI desde API
    // dispatch(fetchKPIPagos())
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Grilla de KPIs */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Facturas"
            value={kpiData.totalFacturas}
            icon={<Payment />}
            color={zentriaColors.violeta.main}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monto Total"
            value={`$${kpiData.totalMonto.toLocaleString()}`}
            icon={<TrendingUp />}
            color={zentriaColors.naranja.main}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Pagado"
            value={`$${kpiData.totalPagado.toLocaleString()}`}
            icon={<CheckCircle />}
            color={zentriaColors.verde.main}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pendiente"
            value={`$${kpiData.totalPendiente.toLocaleString()}`}
            icon={<PendingActions />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* Barra de progreso */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Porcentaje de Pago
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: zentriaColors.verde.main }}>
                {kpiData.porcentajePago}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={kpiData.porcentajePago}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  background: `linear-gradient(90deg, ${zentriaColors.verde.main}, ${zentriaColors.violeta.main})`,
                },
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            De ${kpiData.totalMonto.toLocaleString()} total, se han pagado ${kpiData.totalPagado.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            📊 Estadísticas Generales
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary" gutterBottom>
                Pagos Procesados
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {kpiData.pagosProcesados}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary" gutterBottom>
                Promedio por Factura
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ${kpiData.totalFacturas > 0 ? (kpiData.totalPagado / kpiData.totalFacturas).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Información */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Nota:</strong> Los datos se actualizan automáticamente cada vez que registras un pago.
          Todos los montos están en COP (Pesos Colombianos).
        </Typography>
      </Alert>
    </Box>
  );
};

export default ResumenPagosTab;
