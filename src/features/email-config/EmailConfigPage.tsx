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
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
              Configuración de Correos
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 1, fontWeight: 500, letterSpacing: 0.5 }}>
                      CUENTAS TOTALES
                    </Typography>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                      {totalCuentas}
                    </Typography>
                  </Box>
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    p: 1.5,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <EmailIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(240, 147, 251, 0.3)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 1, fontWeight: 500, letterSpacing: 0.5 }}>
                      CUENTAS ACTIVAS
                    </Typography>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                      {cuentasActivas}
                    </Typography>
                  </Box>
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    p: 1.5,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <ActiveIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                borderRadius: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(79, 172, 254, 0.3)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 1, fontWeight: 500, letterSpacing: 0.5 }}>
                      NITS CONFIGURADOS
                    </Typography>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                      {totalNits}
                    </Typography>
                  </Box>
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    p: 1.5,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <NumbersIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                border: 'none',
                borderRadius: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(67, 233, 123, 0.3)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 1, fontWeight: 500, letterSpacing: 0.5 }}>
                      NITS ACTIVOS
                    </Typography>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                      {totalNitsActivos}
                    </Typography>
                  </Box>
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: 2,
                    p: 1.5,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <TrendingUpIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros y Búsqueda */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Buscar por email, nombre o organización..."
                  value={searchLocal}
                  onChange={(e) => setSearchLocal(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.default',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
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
                    label={<Typography variant="body2" fontWeight={500}>Solo activas</Typography>}
                  />
                  <Chip
                    label={`${cuentasFiltradas.length} resultado${cuentasFiltradas.length !== 1 ? 's' : ''}`}
                    color="primary"
                    sx={{
                      fontWeight: 600,
                      px: 1
                    }}
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
                elevation={0}
                sx={{
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: cuenta.activa ? 'success.light' : 'error.light',
                  borderLeft: '6px solid',
                  borderLeftColor: cuenta.activa ? 'success.main' : 'error.main',
                  position: 'relative',
                  overflow: 'visible',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                    borderColor: cuenta.activa ? 'success.main' : 'error.main',
                  },
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
                    right: 24,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    letterSpacing: 0.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                />

                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={4} alignItems="center">
                    {/* Columna 1: Información Principal */}
                    <Grid item xs={12} md={5}>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              bgcolor: 'primary.50',
                              borderRadius: 2,
                              p: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <EmailIcon color="primary" sx={{ fontSize: 28 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                              {cuenta.email}
                            </Typography>
                            {cuenta.nombre_descriptivo && (
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>
                                {cuenta.nombre_descriptivo}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {cuenta.organizacion && (
                            <Chip
                              icon={<BusinessIcon sx={{ fontSize: 16 }} />}
                              label={cuenta.organizacion}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 500,
                                borderRadius: 2,
                              }}
                            />
                          )}
                          <Chip
                            label={`Creada ${formatDistanceToNow(new Date(cuenta.creada_en), { addSuffix: true, locale: es })}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 400,
                              borderRadius: 2,
                              borderColor: 'divider',
                            }}
                          />
                        </Stack>
                      </Stack>
                    </Grid>

                    {/* Columna 2: Estadísticas */}
                    <Grid item xs={12} md={4}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              textAlign: 'center',
                              p: 2.5,
                              bgcolor: 'primary.50',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'primary.100',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: 'primary.100',
                                transform: 'scale(1.05)',
                              }
                            }}
                          >
                            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {cuenta.total_nits}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              NITs Totales
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              textAlign: 'center',
                              p: 2.5,
                              bgcolor: 'success.50',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'success.100',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: 'success.100',
                                transform: 'scale(1.05)',
                              }
                            }}
                          >
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {cuenta.total_nits_activos}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              NITs Activos
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Columna 3: Acciones */}
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1.5}>
                        <Button
                          variant="contained"
                          startIcon={<ViewIcon />}
                          onClick={() => navigate(`/email-config/${cuenta.id}`)}
                          fullWidth
                          sx={{
                            py: 1.25,
                            fontWeight: 600,
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          Ver Detalles
                        </Button>
                        <Button
                          variant={cuenta.activa ? 'outlined' : 'contained'}
                          color={cuenta.activa ? 'error' : 'success'}
                          startIcon={cuenta.activa ? <InactiveIcon /> : <ActiveIcon />}
                          onClick={() => handleToggleActiva(cuenta.id, cuenta.activa)}
                          fullWidth
                          sx={{
                            py: 1,
                            fontWeight: 500,
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
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
