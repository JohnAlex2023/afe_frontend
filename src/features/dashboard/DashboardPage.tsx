import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Avatar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  PendingActions,
  Refresh,
  Download,
  MoreVert,
  AttachFile,
  RemoveRedEye,
  SmartToy,
} from '@mui/icons-material';
import { useAppSelector } from '../../app/hooks';
import { zentriaColors } from '../../theme/colors';
import apiClient from '../../services/api';

interface Factura {
  id: number;
  numero_factura: string;
  cufe?: string;
  nit_emisor: string;
  nombre_emisor: string;
  monto_total: number;
  fecha_emision: string;
  fecha_vencimiento?: string;
  estado: string;
  responsable_id?: number;
  observaciones?: string;
  archivo_adjunto?: string;
}

interface DashboardStats {
  total: number;
  pendientes: number;
  en_revision: number;
  aprobadas: number;
  aprobadas_auto: number;
  rechazadas: number;
}

/**
 * DashboardPage con CRUD Completo
 * Gestión profesional de facturas con métricas y acciones
 */
function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pendientes: 0,
    en_revision: 0,
    aprobadas: 0,
    aprobadas_auto: 0,
    rechazadas: 0,
  });
  const [totalTodasFacturas, setTotalTodasFacturas] = useState(0); // Total de TODAS las facturas
  const [totalAsignadas, setTotalAsignadas] = useState(0); // Total de facturas ASIGNADAS
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [vistaFacturas, setVistaFacturas] = useState<'todas' | 'asignadas'>('todas'); // Vista para admin
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFactura, setMenuFactura] = useState<Factura | null>(null);

  const [formData, setFormData] = useState({
    numero_factura: '',
    nit_emisor: '',
    nombre_emisor: '',
    monto_total: '',
    fecha_emision: '',
    fecha_vencimiento: '',
    observaciones: '',
  });

  useEffect(() => {
    loadData();
  }, [filterEstado, vistaFacturas]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Si es admin, cargar ambos totales en paralelo
      if (user?.rol === 'admin') {
        const [todasResponse, asignadasResponse] = await Promise.all([
          apiClient.get('/facturas/', { params: { page: 1, per_page: 2000 } }), // Todas las facturas
          apiClient.get('/facturas/', { params: { solo_asignadas: true, page: 1, per_page: 2000 } }), // Solo asignadas
        ]);

        // ✅ CORRECCIÓN: Ahora el backend devuelve { data: [...], pagination: {...} }
        const todasFacturasData = todasResponse.data.data || [];
        const asignadasData = asignadasResponse.data.data || [];

        setTotalTodasFacturas(todasResponse.data.pagination?.total || todasFacturasData.length);
        setTotalAsignadas(asignadasResponse.data.pagination?.total || asignadasData.length);

        // Usar los datos según la vista seleccionada
        const allFacturas = vistaFacturas === 'todas' ? todasFacturasData : asignadasData;

        // Filtrar por estado
        const filtered = filterEstado === 'todos'
          ? allFacturas
          : allFacturas.filter((f: Factura) => f.estado === filterEstado);

        setFacturas(filtered);

        // Calcular estadísticas (separar aprobadas manuales y automáticas)
        setStats({
          total: allFacturas.length,
          pendientes: allFacturas.filter((f: Factura) => f.estado === 'pendiente').length,
          en_revision: allFacturas.filter((f: Factura) => f.estado === 'en_revision').length,
          aprobadas: allFacturas.filter((f: Factura) =>
            f.estado === 'aprobada' || f.estado === 'aprobado'
          ).length,
          aprobadas_auto: allFacturas.filter((f: Factura) => f.estado === 'aprobada_auto').length,
          rechazadas: allFacturas.filter((f: Factura) =>
            f.estado === 'rechazada' || f.estado === 'rechazado'
          ).length,
        });
      } else {
        // Responsable solo ve sus facturas asignadas
        const response = await apiClient.get('/facturas/', { params: { page: 1, per_page: 2000 } });

        // ✅ CORRECCIÓN: Ahora el backend devuelve { data: [...], pagination: {...} }
        const allFacturas = response.data.data || [];

        setTotalAsignadas(response.data.pagination?.total || allFacturas.length);
        setTotalTodasFacturas(response.data.pagination?.total || allFacturas.length); // Para responsable es lo mismo

        // Filtrar por estado
        const filtered = filterEstado === 'todos'
          ? allFacturas
          : allFacturas.filter((f: Factura) => f.estado === filterEstado);

        setFacturas(filtered);

        // Calcular estadísticas (separar aprobadas manuales y automáticas)
        setStats({
          total: allFacturas.length,
          pendientes: allFacturas.filter((f: Factura) => f.estado === 'pendiente').length,
          en_revision: allFacturas.filter((f: Factura) => f.estado === 'en_revision').length,
          aprobadas: allFacturas.filter((f: Factura) =>
            f.estado === 'aprobada' || f.estado === 'aprobado'
          ).length,
          aprobadas_auto: allFacturas.filter((f: Factura) => f.estado === 'aprobada_auto').length,
          rechazadas: allFacturas.filter((f: Factura) =>
            f.estado === 'rechazada' || f.estado === 'rechazado'
          ).length,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const filteredFacturas = facturas.filter(
    (factura) =>
      factura?.numero_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura?.nombre_emisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura?.nit_emisor?.includes(searchTerm)
  );

  const handleOpenDialog = (mode: 'view' | 'edit' | 'create', factura?: Factura) => {
    setDialogMode(mode);
    if (factura) {
      setSelectedFactura(factura);
      setFormData({
        numero_factura: factura.numero_factura || '',
        nit_emisor: factura.nit_emisor || '',
        nombre_emisor: factura.nombre_emisor || '',
        monto_total: factura.monto_total ? factura.monto_total.toString() : '',
        fecha_emision: factura.fecha_emision ? factura.fecha_emision.split('T')[0] : '',
        fecha_vencimiento: factura.fecha_vencimiento?.split('T')[0] || '',
        observaciones: factura.observaciones || '',
      });
    } else {
      setSelectedFactura(null);
      setFormData({
        numero_factura: '',
        nit_emisor: '',
        nombre_emisor: '',
        monto_total: '',
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        observaciones: '',
      });
    }
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFactura(null);
    setError('');
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        monto_total: parseFloat(formData.monto_total),
        estado: 'pendiente',
      };

      if (dialogMode === 'create') {
        await apiClient.post('/facturas/', payload);
      } else if (dialogMode === 'edit' && selectedFactura) {
        await apiClient.put(`/facturas/${selectedFactura.id}`, payload);
      }

      handleCloseDialog();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar factura');
    }
  };

  const handleDelete = async (factura: Factura) => {
    if (!confirm(`¿Está seguro de eliminar la factura ${factura.numero_factura}?`)) return;

    try {
      await apiClient.delete(`/facturas/${factura.id}`);
      loadData();
      setAnchorEl(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar factura');
    }
  };

  const handleApprove = async (factura: Factura) => {
    try {
      await apiClient.post(`/facturas/${factura.id}/aprobar`, {
        aprobado_por: user?.usuario,
      });
      loadData();
      setAnchorEl(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al aprobar factura');
    }
  };

  const handleReject = async (factura: Factura) => {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (!motivo) return;

    try {
      await apiClient.post(`/facturas/${factura.id}/rechazar`, {
        rechazado_por: user?.usuario,
        motivo,
      });
      loadData();
      setAnchorEl(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al rechazar factura');
    }
  };

  const handleExport = () => {
    // Construir URL de exportación
    const params = new URLSearchParams();

    if (filterEstado !== 'todos') {
      params.append('estado', filterEstado);
    }

    if (user?.rol === 'admin' && vistaFacturas === 'asignadas') {
      params.append('solo_asignadas', 'true');
    }

    // Descargar CSV
    const url = `/facturas/export/csv${params.toString() ? '?' + params.toString() : ''}`;
    window.location.href = apiClient.defaults.baseURL + url;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado':
      case 'aprobada':
        return 'success';
      case 'aprobada_auto':
        return 'info';
      case 'rechazado':
      case 'rechazada':
        return 'error';
      case 'pendiente':
        return 'warning';
      case 'en_revision':
        return 'default';
      default:
        return 'default';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'aprobado':
      case 'aprobada':
        return 'Aprobado';
      case 'aprobada_auto':
        return 'Aprobado Auto';
      case 'rechazado':
      case 'rechazada':
        return 'Rechazado';
      case 'pendiente':
        return 'Pendiente';
      case 'en_revision':
        return 'En Revisión';
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} sx={{ color: zentriaColors.violeta.main }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Dashboard de Control
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Gestión completa de facturas • Sistema de aprobación
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadData}
            sx={{ borderColor: zentriaColors.violeta.main, color: zentriaColors.violeta.main }}
          >
            Actualizar
          </Button>
          {user?.rol === 'admin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog('create')}
              sx={{
                background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
              }}
            >
              Nueva Factura
            </Button>
          )}
        </Box>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${zentriaColors.violeta.main}10, ${zentriaColors.violeta.main}05)`,
              border: `1px solid ${zentriaColors.violeta.main}30`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL FACTURAS
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color={zentriaColors.violeta.main}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: zentriaColors.violeta.main, width: 56, height: 56 }}>
                  <AttachFile />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${zentriaColors.amarillo.dark}10, ${zentriaColors.amarillo.dark}05)`,
              border: `1px solid ${zentriaColors.amarillo.dark}30`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    PENDIENTES
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color={zentriaColors.amarillo.dark}>
                    {stats.pendientes}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: zentriaColors.amarillo.dark, width: 56, height: 56 }}>
                  <PendingActions />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, #3b82f610, #3b82f605)`,
              border: `1px solid #3b82f630`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    EN REVISIÓN
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#3b82f6">
                    {stats.en_revision}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#3b82f6', width: 56, height: 56 }}>
                  <RemoveRedEye />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${zentriaColors.verde.main}10, ${zentriaColors.verde.main}05)`,
              border: `1px solid ${zentriaColors.verde.main}30`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    APROBADAS
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color={zentriaColors.verde.main}>
                    {stats.aprobadas}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: zentriaColors.verde.main, width: 56, height: 56 }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, #06b6d410, #06b6d405)`,
              border: `1px solid #06b6d430`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    APROBADAS AUTO
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#06b6d4">
                    {stats.aprobadas_auto}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#06b6d4', width: 56, height: 56 }}>
                  <SmartToy />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${zentriaColors.naranja.main}10, ${zentriaColors.naranja.main}05)`,
              border: `1px solid ${zentriaColors.naranja.main}30`,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    RECHAZADAS
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color={zentriaColors.naranja.main}>
                    {stats.rechazadas}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: zentriaColors.naranja.main, width: 56, height: 56 }}>
                  <Cancel />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros y búsqueda - Diseño UX Profesional */}
      <Card sx={{ mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Fila 1: Buscador y Filtro de Estado */}
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                placeholder="Buscar factura..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 56,
                    backgroundColor: '#ffffff',
                    border: '2px solid #e9ecef',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: `2px solid ${zentriaColors.violeta.main}40`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    },
                    '&.Mui-focused': {
                      border: `2px solid ${zentriaColors.violeta.main}`,
                      boxShadow: `0 0 0 3px ${zentriaColors.violeta.main}20`,
                    },
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#2d3748',
                    '&::placeholder': {
                      color: '#a0aec0',
                      opacity: 1,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: zentriaColors.violeta.main, fontSize: 24 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <Select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  displayEmpty
                  sx={{
                    height: 56,
                    backgroundColor: '#ffffff',
                    border: '2px solid #e9ecef',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover': {
                      border: `2px solid ${zentriaColors.violeta.main}40`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    },
                    '&.Mui-focused': {
                      border: `2px solid ${zentriaColors.violeta.main}`,
                      boxShadow: `0 0 0 3px ${zentriaColors.violeta.main}20`,
                    },
                  }}
                >
                  <MenuItem value="todos" sx={{ fontWeight: 600 }}>
                    📊 Todos los estados
                  </MenuItem>
                  <MenuItem value="pendiente" sx={{ fontWeight: 600 }}>
                    ⏳ Pendientes
                  </MenuItem>
                  <MenuItem value="en_revision" sx={{ fontWeight: 600 }}>
                    🔍 En Revisión
                  </MenuItem>
                  <MenuItem value="aprobada" sx={{ fontWeight: 600 }}>
                    ✅ Aprobadas
                  </MenuItem>
                  <MenuItem value="aprobada_auto" sx={{ fontWeight: 600 }}>
                    🤖 Aprobadas Automáticamente
                  </MenuItem>
                  <MenuItem value="rechazada" sx={{ fontWeight: 600 }}>
                    ❌ Rechazadas
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Divider visual */}
            {user?.rol === 'admin' && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
            )}

            {/* Fila 2: Botones de Vista (Admin) - Separados */}
            {user?.rol === 'admin' && (
              <>
                <Grid item xs={12} md={5}>
                  <Button
                    fullWidth
                    variant={vistaFacturas === 'todas' ? 'contained' : 'outlined'}
                    onClick={() => setVistaFacturas('todas')}
                    sx={{
                      height: 56,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      borderRadius: '12px',
                      border: `2px solid ${zentriaColors.violeta.main}`,
                      backgroundColor: vistaFacturas === 'todas' ? zentriaColors.violeta.main : 'transparent',
                      color: vistaFacturas === 'todas' ? 'white' : zentriaColors.violeta.main,
                      boxShadow: vistaFacturas === 'todas' ? '0 4px 12px rgba(138, 43, 226, 0.3)' : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: vistaFacturas === 'todas'
                          ? zentriaColors.violeta.dark
                          : `${zentriaColors.violeta.main}15`,
                        border: `2px solid ${zentriaColors.violeta.dark}`,
                        boxShadow: '0 4px 12px rgba(138, 43, 226, 0.3)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    📋 Todas las Facturas ({totalTodasFacturas})
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant={vistaFacturas === 'asignadas' ? 'contained' : 'outlined'}
                    onClick={() => setVistaFacturas('asignadas')}
                    sx={{
                      height: 56,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      borderRadius: '12px',
                      border: `2px solid ${zentriaColors.violeta.main}`,
                      backgroundColor: vistaFacturas === 'asignadas' ? zentriaColors.violeta.main : 'transparent',
                      color: vistaFacturas === 'asignadas' ? 'white' : zentriaColors.violeta.main,
                      boxShadow: vistaFacturas === 'asignadas' ? '0 4px 12px rgba(138, 43, 226, 0.3)' : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: vistaFacturas === 'asignadas'
                          ? zentriaColors.violeta.dark
                          : `${zentriaColors.violeta.main}15`,
                        border: `2px solid ${zentriaColors.violeta.dark}`,
                        boxShadow: '0 4px 12px rgba(138, 43, 226, 0.3)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    👤 Facturas Asignadas ({totalAsignadas})
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleExport}
                    sx={{
                      height: 56,
                      borderRadius: '12px',
                      border: `2px solid ${zentriaColors.verde.main}`,
                      color: zentriaColors.verde.main,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        border: `2px solid ${zentriaColors.verde.dark}`,
                        backgroundColor: `${zentriaColors.verde.main}15`,
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Exportar
                  </Button>
                </Grid>
              </>
            )}

            {/* Botón Exportar para Responsable */}
            {user?.rol !== 'admin' && (
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleExport}
                  sx={{
                    height: 56,
                    borderRadius: '12px',
                    border: `2px solid ${zentriaColors.verde.main}`,
                    color: zentriaColors.verde.main,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: `2px solid ${zentriaColors.verde.dark}`,
                      backgroundColor: `${zentriaColors.verde.main}15`,
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Exportar Datos
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabla de facturas */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: zentriaColors.violeta.main }}>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Número</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Emisor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>NIT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Monto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Fecha Emisión</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFacturas && filteredFacturas.length > 0 ? (
                filteredFacturas
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((factura) => (
                    <TableRow key={factura?.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {factura?.numero_factura || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{factura?.nombre_emisor || '-'}</TableCell>
                      <TableCell>{factura?.nit_emisor || '-'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color={zentriaColors.verde.main}>
                        ${factura.monto_total ? Number(factura.monto_total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {factura.fecha_emision ? new Date(factura.fecha_emision).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getEstadoLabel(factura.estado)}
                        color={getEstadoColor(factura.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog('view', factura)}
                          sx={{ color: zentriaColors.violeta.main }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {user?.rol === 'admin' && (
                        <>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('edit', factura)}
                              sx={{ color: zentriaColors.naranja.main }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Más acciones">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setMenuFactura(factura);
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" py={4}>
                      No hay facturas disponibles
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredFacturas.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Filas por página:"
        />
      </Card>

      {/* Menú contextual */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {menuFactura?.estado === 'pendiente' && (
          <MenuItem
            onClick={() => menuFactura && handleApprove(menuFactura)}
            sx={{ color: zentriaColors.verde.main }}
          >
            <CheckCircle sx={{ mr: 1 }} fontSize="small" />
            Aprobar
          </MenuItem>
        )}
        {menuFactura?.estado === 'pendiente' && (
          <MenuItem
            onClick={() => menuFactura && handleReject(menuFactura)}
            sx={{ color: zentriaColors.naranja.main }}
          >
            <Cancel sx={{ mr: 1 }} fontSize="small" />
            Rechazar
          </MenuItem>
        )}
        <MenuItem onClick={() => menuFactura && handleDelete(menuFactura)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para ver/editar/crear */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
            color: 'white',
            fontWeight: 700,
          }}
        >
          {dialogMode === 'view'
            ? 'Detalles de Factura'
            : dialogMode === 'edit'
            ? 'Editar Factura'
            : 'Nueva Factura'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Factura"
                value={formData.numero_factura}
                onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                disabled={dialogMode === 'view'}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NIT Emisor"
                value={formData.nit_emisor}
                onChange={(e) => setFormData({ ...formData, nit_emisor: e.target.value })}
                disabled={dialogMode === 'view'}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre Emisor"
                value={formData.nombre_emisor}
                onChange={(e) => setFormData({ ...formData, nombre_emisor: e.target.value })}
                disabled={dialogMode === 'view'}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monto Total"
                type="number"
                value={formData.monto_total}
                onChange={(e) => setFormData({ ...formData, monto_total: e.target.value })}
                disabled={dialogMode === 'view'}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha Emisión"
                type="date"
                value={formData.fecha_emision}
                onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha Vencimiento"
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={3}
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                disabled={dialogMode === 'view'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Cerrar' : 'Cancelar'}
          </Button>
          {dialogMode !== 'view' && (
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={
                !formData.numero_factura ||
                !formData.nit_emisor ||
                !formData.nombre_emisor ||
                !formData.monto_total ||
                !formData.fecha_emision
              }
              sx={{
                background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
              }}
            >
              Guardar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DashboardPage;
