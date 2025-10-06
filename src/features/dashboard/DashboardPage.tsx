import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  PendingActions as PendingIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Speed as SpeedIcon,
  TrendingUp,
  TrendingDown,
  AccessTime,
  AttachMoney,
  Refresh,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDashboard } from '../facturas/facturasSlice';
import { zentriaColors } from '../../theme/colors';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  subtitle?: string;
}

const MetricCard = ({ title, value, icon, color, trend, subtitle }: MetricCardProps) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}08 0%, ${color}02 100%)`,
      border: `1px solid ${color}20`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 24px ${color}30`,
        border: `1px solid ${color}40`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography color="textSecondary" fontWeight={600} variant="body2" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          {title}
        </Typography>
        <Avatar
          sx={{
            backgroundColor: color,
            width: 48,
            height: 48,
            boxShadow: `0 4px 12px ${color}40`,
          }}
        >
          {icon}
        </Avatar>
      </Box>
      <Typography variant="h3" fontWeight={800} color={color} mb={1}>
        {value}
      </Typography>
      {trend !== undefined && (
        <Box display="flex" alignItems="center" gap={0.5}>
          {trend > 0 ? (
            <ArrowUpward sx={{ fontSize: 16, color: zentriaColors.verde.main }} />
          ) : trend < 0 ? (
            <ArrowDownward sx={{ fontSize: 16, color: zentriaColors.naranja.main }} />
          ) : null}
          <Typography
            variant="caption"
            fontWeight={600}
            color={trend > 0 ? zentriaColors.verde.main : trend < 0 ? zentriaColors.naranja.main : 'text.secondary'}
          >
            {trend > 0 ? '+' : ''}{trend}% vs mes anterior
          </Typography>
        </Box>
      )}
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

/**
 * Dashboard Page - Enterprise Level
 * Dashboard principal con métricas en tiempo real, gráficos interactivos y analytics
 */

function DashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard, loading } = useAppSelector((state) => state.facturas);
  const user = useAppSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchDashboard(user.id));
    }
  }, [dispatch, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await dispatch(fetchDashboard(user.id));
    }
    setTimeout(() => setRefreshing(false), 500);
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px" gap={2}>
        <CircularProgress size={60} sx={{ color: zentriaColors.violeta.main }} />
        <Typography variant="h6" color="text.secondary">Cargando dashboard...</Typography>
      </Box>
    );
  }

  const metrics = dashboard?.resumen || {
    total_facturas: 0,
    pendientes_revision: 0,
    aprobadas_auto: 0,
    rechazadas: 0,
  };

  const tasaAprobacion = dashboard?.metricas?.tasa_aprobacion_auto || 0;

  // Datos de ejemplo para gráficos (en producción vendrían del backend)
  const monthlyData = [
    { mes: 'Ene', aprobadas: 45, rechazadas: 12, pendientes: 8 },
    { mes: 'Feb', aprobadas: 52, rechazadas: 15, pendientes: 10 },
    { mes: 'Mar', aprobadas: 61, rechazadas: 10, pendientes: 6 },
    { mes: 'Abr', aprobadas: 58, rechazadas: 14, pendientes: 12 },
    { mes: 'May', aprobadas: 70, rechazadas: 8, pendientes: 5 },
    { mes: 'Jun', aprobadas: 75, rechazadas: 11, pendientes: 9 },
  ];

  const statusDistribution = [
    { name: 'Aprobadas', value: metrics.aprobadas_auto, color: zentriaColors.verde.main },
    { name: 'Pendientes', value: metrics.pendientes_revision, color: zentriaColors.amarillo.dark },
    { name: 'Rechazadas', value: metrics.rechazadas, color: zentriaColors.naranja.main },
  ];

  const topProveedores = [
    { nombre: 'Proveedor A', facturas: 45, monto: 125000 },
    { nombre: 'Proveedor B', facturas: 38, monto: 98000 },
    { nombre: 'Proveedor C', facturas: 32, monto: 87000 },
    { nombre: 'Proveedor D', facturas: 28, monto: 75000 },
    { nombre: 'Proveedor E', facturas: 22, monto: 62000 },
  ];

  return (
    <Box>
      {/* Header del Dashboard */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Dashboard de Control
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Vista general del sistema de aprobación de facturas • Actualizado en tiempo real
          </Typography>
        </Box>
        <Tooltip title="Actualizar datos">
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
              color: 'white',
              '&:hover': {
                background: `linear-gradient(135deg, ${zentriaColors.violeta.dark}, ${zentriaColors.naranja.dark})`,
              },
            }}
          >
            <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Métricas Principales */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pendientes"
            value={metrics.pendientes_revision}
            icon={<PendingIcon sx={{ fontSize: 24 }} />}
            color={zentriaColors.amarillo.dark}
            trend={12}
            subtitle="Requieren revisión"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Aprobadas Auto"
            value={metrics.aprobadas_auto}
            icon={<CheckIcon sx={{ fontSize: 24 }} />}
            color={zentriaColors.verde.main}
            trend={8}
            subtitle="Automáticamente"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Rechazadas"
            value={metrics.rechazadas}
            icon={<CancelIcon sx={{ fontSize: 24 }} />}
            color={zentriaColors.naranja.main}
            trend={-5}
            subtitle="Total rechazadas"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Tasa Aprobación"
            value={`${tasaAprobacion.toFixed(1)}%`}
            icon={<SpeedIcon sx={{ fontSize: 24 }} />}
            color={zentriaColors.violeta.main}
            trend={3}
            subtitle="Efectividad del sistema"
          />
        </Grid>
      </Grid>

      {/* Gráficos y Analytics */}
      <Grid container spacing={3}>
        {/* Gráfico de Tendencias Mensuales */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Tendencia de Aprobaciones
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Últimos 6 meses
                  </Typography>
                </Box>
                <Chip
                  icon={<TrendingUp />}
                  label="Mejorando"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorAprobadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={zentriaColors.verde.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={zentriaColors.verde.main} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRechazadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={zentriaColors.naranja.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={zentriaColors.naranja.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" stroke="#888" />
                  <YAxis stroke="#888" />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="aprobadas" stroke={zentriaColors.verde.main} fillOpacity={1} fill="url(#colorAprobadas)" />
                  <Area type="monotone" dataKey="rechazadas" stroke={zentriaColors.naranja.main} fillOpacity={1} fill="url(#colorRechazadas)" />
                  <Area type="monotone" dataKey="pendientes" stroke={zentriaColors.amarillo.dark} fill={zentriaColors.amarillo.light} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por Estado (Pie Chart) */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={1}>
                Distribución por Estado
              </Typography>
              <Typography variant="caption" color="text.secondary" mb={3} display="block">
                Total: {metrics.total_facturas || statusDistribution.reduce((sum, item) => sum + item.value, 0)} facturas
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Proveedores */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Top 5 Proveedores
              </Typography>
              {topProveedores.map((proveedor, index) => (
                <Box key={index} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: `${zentriaColors.violeta.main}${(5 - index) * 20}`,
                          width: 32,
                          height: 32,
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {proveedor.nombre}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight={700} color={zentriaColors.verde.main}>
                        ${(proveedor.monto / 1000).toFixed(0)}K
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {proveedor.facturas} facturas
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(proveedor.facturas / topProveedores[0].facturas) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: `${zentriaColors.violeta.main}10`,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: `linear-gradient(90deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Métricas Adicionales */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Métricas de Rendimiento
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: `${zentriaColors.verde.main}08`, borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AccessTime sx={{ fontSize: 20, color: zentriaColors.verde.main }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Tiempo Promedio
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={800} color={zentriaColors.verde.main}>
                      2.3h
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      De procesamiento
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: `${zentriaColors.violeta.main}08`, borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AttachMoney sx={{ fontSize: 20, color: zentriaColors.violeta.main }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Monto Total
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={800} color={zentriaColors.violeta.main}>
                      $1.2M
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Este mes
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="body2" color="text.secondary">
                      Eficiencia del sistema
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color={zentriaColors.verde.main}>
                      94.5%
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="body2" color="text.secondary">
                      Ahorro de tiempo estimado
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color={zentriaColors.violeta.main}>
                      156 horas
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="body2" color="text.secondary">
                      Facturas procesadas hoy
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      23
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CSS para animación de refresh */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}

export default DashboardPage;
