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
  aprobadas: number;
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
    aprobadas: 0,
    rechazadas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
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
  }, [filterEstado]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/facturas/');
      const allFacturas = response.data;

      // Filtrar por estado
      const filtered = filterEstado === 'todos'
        ? allFacturas
        : allFacturas.filter((f: Factura) => f.estado === filterEstado);

      setFacturas(filtered);

      // Calcular estadísticas
      setStats({
        total: allFacturas.length,
        pendientes: allFacturas.filter((f: Factura) => f.estado === 'pendiente').length,
        aprobadas: allFacturas.filter((f: Factura) => f.estado === 'aprobado').length,
        rechazadas: allFacturas.filter((f: Factura) => f.estado === 'rechazado').length,
      });
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'success';
      case 'rechazado':
        return 'error';
      case 'pendiente':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      case 'pendiente':
        return 'Pendiente';
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
        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

      {/* Filtros y búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar por número, NIT o nombre del emisor..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterEstado}
                  label="Estado"
                  onChange={(e) => setFilterEstado(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="pendiente">Pendientes</MenuItem>
                  <MenuItem value="aprobado">Aprobadas</MenuItem>
                  <MenuItem value="rechazado">Rechazadas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                sx={{ height: 56, borderColor: zentriaColors.verde.main, color: zentriaColors.verde.main }}
              >
                Exportar
              </Button>
            </Grid>
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
