/**
 * Email Config Page - Gestión de Configuración de Correos
 * Diseño profesional y moderno con Material-UI
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Numbers as NumbersIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  cargarCuentas,
  setFiltros,
  toggleCuentaActiva,
  eliminarCuenta,
  limpiarError,
} from './emailConfigSlice';
import CreateCuentaDialog from './components/CreateCuentaDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const EmailConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { cuentas, loadingCuentas, filtros, error } = useAppSelector(
    (state) => state.emailConfig
  );

  const [dialogCrearOpen, setDialogCrearOpen] = useState(false);
  const [cuentaAEliminar, setCuentaAEliminar] = useState<number | null>(null);
  const [searchLocal, setSearchLocal] = useState('');

  // Cargar cuentas al montar
  useEffect(() => {
    dispatch(cargarCuentas({ solo_activas: filtros.solo_activas }));
  }, [dispatch, filtros.solo_activas]);

  // Filtrar cuentas localmente
  const cuentasFiltradas = cuentas.filter((cuenta) => {
    const matchSearch =
      !searchLocal ||
      cuenta.email.toLowerCase().includes(searchLocal.toLowerCase()) ||
      cuenta.nombre_descriptivo?.toLowerCase().includes(searchLocal.toLowerCase()) ||
      cuenta.organizacion?.toLowerCase().includes(searchLocal.toLowerCase());

    const matchOrganizacion =
      !filtros.organizacion ||
      cuenta.organizacion?.toLowerCase() === filtros.organizacion.toLowerCase();

    return matchSearch && matchOrganizacion;
  });

  const handleToggleActiva = async (cuentaId: number, activa: boolean) => {
    await dispatch(toggleCuentaActiva({ cuentaId, activa: !activa }));
    dispatch(cargarCuentas({ solo_activas: filtros.solo_activas }));
  };

  const handleEliminar = async () => {
    if (cuentaAEliminar) {
      await dispatch(eliminarCuenta(cuentaAEliminar));
      setCuentaAEliminar(null);
      dispatch(cargarCuentas({ solo_activas: filtros.solo_activas }));
    }
  };

  const handleRefresh = () => {
    dispatch(cargarCuentas({ solo_activas: filtros.solo_activas }));
  };

  // Estadísticas globales
  const totalCuentas = cuentas.length;
  const cuentasActivas = cuentas.filter((c) => c.activa).length;
  const totalNits = cuentas.reduce((sum, c) => sum + c.total_nits, 0);
  const totalNitsActivos = cuentas.reduce((sum, c) => sum + c.total_nits_activos, 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              📧 Configuración de Correos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona las cuentas de correo corporativo y los NITs para extracción de facturas
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refrescar">
              <IconButton onClick={handleRefresh} color="primary" disabled={loadingCuentas}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogCrearOpen(true)}
              size="large"
              sx={{ px: 3 }}
            >
              Nueva Cuenta
            </Button>
          </Box>
        </Box>

        {/* Estadísticas Globales */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                      {totalCuentas}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      Cuentas Totales
                    </Typography>
                  </Box>
                  <EmailIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                      {cuentasActivas}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      Cuentas Activas
                    </Typography>
                  </Box>
                  <ActiveIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                      {totalNits}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      NITs Configurados
                    </Typography>
                  </Box>
                  <NumbersIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                      {totalNitsActivos}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      NITs Activos
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros y Búsqueda */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Buscar por email, nombre o organización..."
                  value={searchLocal}
                  onChange={(e) => setSearchLocal(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filtros.solo_activas}
                        onChange={(e) =>
                          dispatch(setFiltros({ solo_activas: e.target.checked }))
                        }
                        color="success"
                      />
                    }
                    label="Solo activas"
                  />
                  <Chip
                    label={`${cuentasFiltradas.length} resultado${cuentasFiltradas.length !== 1 ? 's' : ''}`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(limpiarError())}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loadingCuentas && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Lista de Cuentas */}
      {!loadingCuentas && (
        <Grid container spacing={3}>
          {cuentasFiltradas.map((cuenta) => (
            <Grid item xs={12} key={cuenta.id}>
              <Card
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                  border: cuenta.activa ? '2px solid #4caf50' : '2px solid #f44336',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {/* Badge de estado en la esquina */}
                <Chip
                  label={cuenta.activa ? 'ACTIVA' : 'INACTIVA'}
                  color={cuenta.activa ? 'success' : 'error'}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    fontWeight: 700,
                  }}
                />

                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems="center">
                    {/* Columna 1: Información Principal */}
                    <Grid item xs={12} md={5}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon color="primary" sx={{ fontSize: 28 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {cuenta.email}
                          </Typography>
                        </Box>
                        {cuenta.nombre_descriptivo && (
                          <Typography variant="body2" color="text.secondary">
                            {cuenta.nombre_descriptivo}
                          </Typography>
                        )}
                        {cuenta.organizacion && (
                          <Chip
                            icon={<BusinessIcon />}
                            label={cuenta.organizacion}
                            size="small"
                            variant="outlined"
                            sx={{ alignSelf: 'flex-start' }}
                          />
                        )}
                      </Stack>
                    </Grid>

                    {/* Columna 2: Estadísticas */}
                    <Grid item xs={12} md={4}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'primary.50', borderRadius: 2 }}>
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                              {cuenta.total_nits}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              NITs Totales
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.50', borderRadius: 2 }}>
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                              {cuenta.total_nits_activos}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              NITs Activos
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                        Creada {formatDistanceToNow(new Date(cuenta.creada_en), { addSuffix: true, locale: es })}
                      </Typography>
                    </Grid>

                    {/* Columna 3: Acciones */}
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1}>
                        <Button
                          variant="contained"
                          startIcon={<ViewIcon />}
                          onClick={() => navigate(`/email-config/${cuenta.id}`)}
                          fullWidth
                        >
                          Ver Detalles
                        </Button>
                        <Button
                          variant={cuenta.activa ? 'outlined' : 'contained'}
                          color={cuenta.activa ? 'error' : 'success'}
                          startIcon={cuenta.activa ? <InactiveIcon /> : <ActiveIcon />}
                          onClick={() => handleToggleActiva(cuenta.id, cuenta.activa)}
                          fullWidth
                          size="small"
                        >
                          {cuenta.activa ? 'Desactivar' : 'Activar'}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Empty State */}
          {cuentasFiltradas.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <EmailIcon sx={{ fontSize: 100, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No se encontraron cuentas
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {filtros.solo_activas
                    ? 'No hay cuentas activas. Prueba desactivando el filtro.'
                    : 'Comienza agregando tu primera cuenta de correo corporativo.'}
                </Typography>
                {!filtros.solo_activas && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogCrearOpen(true)}
                    size="large"
                  >
                    Agregar Primera Cuenta
                  </Button>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Dialog Crear Cuenta */}
      <CreateCuentaDialog
        open={dialogCrearOpen}
        onClose={() => setDialogCrearOpen(false)}
        onSuccess={() => {
          setDialogCrearOpen(false);
          handleRefresh();
        }}
      />

      {/* Dialog Confirmar Eliminación */}
      <ConfirmDialog
        open={cuentaAEliminar !== null}
        title="¿Eliminar cuenta?"
        message="Esta acción eliminará la cuenta y todos sus NITs asociados. Esta operación no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={handleEliminar}
        onCancel={() => setCuentaAEliminar(null)}
        severity="error"
      />
    </Container>
  );
};

export default EmailConfigPage;
