import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Autocomplete,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  CheckCircle,
  Cancel,
  Link as LinkIcon,
  PersonAdd,
  Business,
} from '@mui/icons-material';
import { useNotification } from '../../components/Notifications/NotificationProvider';
import {
  getAsignaciones,
  createAsignacion,
  updateAsignacion,
  deleteAsignacion,
  getResponsablesDeProveedor,
  getProveedoresDeResponsable,
  type AsignacionResponsableProveedor,
  type AsignacionCreate,
} from '../../services/responsableProveedor.api';
import { getProveedores, type Proveedor } from '../../services/proveedores.api';
import apiClient from '../../services/api';

interface Responsable {
  id: number;
  usuario: string;
  nombre: string;
  email: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function AsignacionesPage() {
  const { showNotification } = useNotification();

  // Estados principales
  const [tabValue, setTabValue] = useState(0);
  const [asignaciones, setAsignaciones] = useState<AsignacionResponsableProveedor[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');

  // Estados de diálogos
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState<AsignacionResponsableProveedor | null>(null);

  // Form state
  const [formData, setFormData] = useState<AsignacionCreate>({
    responsable_id: 0,
    proveedor_id: 0,
    activo: true,
  });

  // Bulk assignment state
  const [bulkResponsableId, setBulkResponsableId] = useState<number>(0);
  const [bulkProveedoresIds, setBulkProveedoresIds] = useState<number[]>([]);

  // Estados de vista por responsable/proveedor
  const [selectedResponsableView, setSelectedResponsableView] = useState<number | null>(null);
  const [selectedProveedorView, setSelectedProveedorView] = useState<number | null>(null);
  const [viewData, setViewData] = useState<any>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadAsignaciones();
    loadProveedores();
    loadResponsables();
  }, []);

  const loadAsignaciones = async () => {
    setLoading(true);
    try {
      const data = await getAsignaciones({ skip: 0, limit: 1000 });
      setAsignaciones(data);
    } catch (error: any) {
      showNotification('Error al cargar asignaciones', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadProveedores = async () => {
    try {
      const data = await getProveedores({ skip: 0, limit: 1000 });
      setProveedores(data);
    } catch (error: any) {
      console.error(error);
    }
  };

  const loadResponsables = async () => {
    try {
      const response = await apiClient.get('/responsables/');
      setResponsables(response.data);
    } catch (error: any) {
      console.error(error);
    }
  };

  // Filtrado
  const filteredAsignaciones = asignaciones.filter((a) =>
    a.proveedor.nit.toLowerCase().includes(searchText.toLowerCase()) ||
    a.proveedor.razon_social.toLowerCase().includes(searchText.toLowerCase()) ||
    a.responsable.usuario.toLowerCase().includes(searchText.toLowerCase()) ||
    a.responsable.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  // Paginación
  const paginatedAsignaciones = filteredAsignaciones.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handlers de asignaciones
  const handleOpenDialog = (asignacion?: AsignacionResponsableProveedor) => {
    if (asignacion) {
      setEditMode(true);
      setSelectedAsignacion(asignacion);
      setFormData({
        responsable_id: asignacion.responsable_id,
        proveedor_id: asignacion.proveedor_id,
        activo: asignacion.activo,
      });
    } else {
      setEditMode(false);
      setSelectedAsignacion(null);
      setFormData({
        responsable_id: 0,
        proveedor_id: 0,
        activo: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedAsignacion(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMode && selectedAsignacion) {
        await updateAsignacion(selectedAsignacion.id, {
          responsable_id: formData.responsable_id,
          activo: formData.activo,
        });
        showNotification('Asignación actualizada exitosamente', 'success');
      } else {
        await createAsignacion(formData);
        showNotification('Asignación creada exitosamente', 'success');
      }
      handleCloseDialog();
      loadAsignaciones();
    } catch (error: any) {
      showNotification(
        error.response?.data?.detail || 'Error al guardar asignación',
        'error'
      );
      console.error(error);
    }
  };

  const handleDeleteClick = (asignacion: AsignacionResponsableProveedor) => {
    setSelectedAsignacion(asignacion);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAsignacion) return;

    try {
      await deleteAsignacion(selectedAsignacion.id);
      showNotification('Asignación eliminada exitosamente', 'success');
      setDeleteDialogOpen(false);
      setSelectedAsignacion(null);
      loadAsignaciones();
    } catch (error: any) {
      showNotification(
        error.response?.data?.detail || 'Error al eliminar asignación',
        'error'
      );
      console.error(error);
    }
  };

  // Bulk assignment
  const handleBulkAssign = async () => {
    if (!bulkResponsableId || bulkProveedoresIds.length === 0) {
      showNotification('Seleccione un responsable y al menos un proveedor', 'warning');
      return;
    }

    try {
      const response = await apiClient.post('/responsable-proveedor/bulk', {
        responsable_id: bulkResponsableId,
        proveedor_ids: bulkProveedoresIds,
        activo: true,
      });

      showNotification(
        `${response.data.creadas} asignaciones creadas, ${response.data.omitidas} omitidas`,
        'success'
      );
      setBulkDialogOpen(false);
      setBulkResponsableId(0);
      setBulkProveedoresIds([]);
      loadAsignaciones();
    } catch (error: any) {
      showNotification('Error en asignación masiva', 'error');
      console.error(error);
    }
  };

  // Vista por responsable
  const handleLoadResponsableView = async () => {
    if (!selectedResponsableView) return;

    setLoading(true);
    try {
      const data = await getProveedoresDeResponsable(selectedResponsableView);
      setViewData(data);
    } catch (error: any) {
      showNotification('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Vista por proveedor
  const handleLoadProveedorView = async () => {
    if (!selectedProveedorView) return;

    setLoading(true);
    try {
      const data = await getResponsablesDeProveedor(selectedProveedorView);
      setViewData(data);
    } catch (error: any) {
      showNotification('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Gestión de Asignaciones Responsable-Proveedor
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadAsignaciones}
            disabled={loading}
          >
            Refrescar
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={() => setBulkDialogOpen(true)}
          >
            Asignación Masiva
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nueva Asignación
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<LinkIcon />} label="Todas las Asignaciones" />
          <Tab icon={<PersonAdd />} label="Por Responsable" />
          <Tab icon={<Business />} label="Por Proveedor" />
        </Tabs>
      </Paper>

      {/* Tab 1: Todas las asignaciones */}
      <TabPanel value={tabValue} index={0}>
        {/* Búsqueda */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Buscar por NIT, razón social, responsable..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Tabla */}
        <Card>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Proveedor (NIT)</TableCell>
                      <TableCell>Razón Social</TableCell>
                      <TableCell>Responsable</TableCell>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedAsignaciones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary">
                            No se encontraron asignaciones
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedAsignaciones.map((asignacion) => (
                        <TableRow key={asignacion.id} hover>
                          <TableCell>
                            <Typography fontWeight="bold">#{asignacion.id}</Typography>
                          </TableCell>
                          <TableCell>{asignacion.proveedor.nit}</TableCell>
                          <TableCell>{asignacion.proveedor.razon_social}</TableCell>
                          <TableCell>{asignacion.responsable.nombre}</TableCell>
                          <TableCell>
                            <Chip label={asignacion.responsable.usuario} size="small" />
                          </TableCell>
                          <TableCell>
                            {asignacion.activo ? (
                              <Chip
                                label="Activo"
                                color="success"
                                size="small"
                                icon={<CheckCircle />}
                              />
                            ) : (
                              <Chip
                                label="Inactivo"
                                color="error"
                                size="small"
                                icon={<Cancel />}
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(asignacion)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(asignacion)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredAsignaciones.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage="Filas por página:"
              />
            </>
          )}
        </Card>
      </TabPanel>

      {/* Tab 2: Por Responsable */}
      <TabPanel value={tabValue} index={1}>
        <Card sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Autocomplete
                options={responsables}
                getOptionLabel={(option) => `${option.nombre} (${option.usuario})`}
                value={responsables.find((r) => r.id === selectedResponsableView) || null}
                onChange={(_, newValue) => {
                  setSelectedResponsableView(newValue?.id || null);
                  setViewData(null);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Seleccionar Responsable" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleLoadResponsableView}
                disabled={!selectedResponsableView || loading}
              >
                Consultar Proveedores
              </Button>
            </Grid>
          </Grid>

          {viewData && (
            <Box mt={3}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Proveedores asignados a: {viewData.responsable.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total: {viewData.total} proveedores
              </Typography>

              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>NIT</TableCell>
                      <TableCell>Razón Social</TableCell>
                      <TableCell>Área</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewData.proveedores.map((prov: any) => (
                      <TableRow key={prov.asignacion_id}>
                        <TableCell>{prov.nit}</TableCell>
                        <TableCell>{prov.razon_social}</TableCell>
                        <TableCell>{prov.area || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={prov.activo ? 'Activo' : 'Inactivo'}
                            color={prov.activo ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Card>
      </TabPanel>

      {/* Tab 3: Por Proveedor */}
      <TabPanel value={tabValue} index={2}>
        <Card sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Autocomplete
                options={proveedores}
                getOptionLabel={(option) => `${option.razon_social} (${option.nit})`}
                value={proveedores.find((p) => p.id === selectedProveedorView) || null}
                onChange={(_, newValue) => {
                  setSelectedProveedorView(newValue?.id || null);
                  setViewData(null);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Seleccionar Proveedor" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleLoadProveedorView}
                disabled={!selectedProveedorView || loading}
              >
                Consultar Responsables
              </Button>
            </Grid>
          </Grid>

          {viewData && (
            <Box mt={3}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Responsables asignados a: {viewData.proveedor.razon_social}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                NIT: {viewData.proveedor.nit} | Total: {viewData.total} responsables
              </Typography>

              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewData.responsables.map((resp: any) => (
                      <TableRow key={resp.asignacion_id}>
                        <TableCell>{resp.usuario}</TableCell>
                        <TableCell>{resp.nombre}</TableCell>
                        <TableCell>{resp.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={resp.activo ? 'Activo' : 'Inactivo'}
                            color={resp.activo ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Card>
      </TabPanel>

      {/* Dialog Crear/Editar */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Asignación' : 'Nueva Asignación'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={responsables}
                getOptionLabel={(option) => `${option.nombre} (${option.usuario})`}
                value={responsables.find((r) => r.id === formData.responsable_id) || null}
                onChange={(_, newValue) =>
                  setFormData({ ...formData, responsable_id: newValue?.id || 0 })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Responsable *" required />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={proveedores}
                getOptionLabel={(option) => `${option.razon_social} (${option.nit})`}
                value={proveedores.find((p) => p.id === formData.proveedor_id) || null}
                onChange={(_, newValue) =>
                  setFormData({ ...formData, proveedor_id: newValue?.id || 0 })
                }
                disabled={editMode}
                renderInput={(params) => (
                  <TextField {...params} label="Proveedor *" required />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={(e) =>
                      setFormData({ ...formData, activo: e.target.checked })
                    }
                  />
                }
                label="Asignación Activa"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.responsable_id || !formData.proveedor_id}
          >
            {editMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción no se puede deshacer
          </Alert>
          <Typography>
            ¿Está seguro de que desea eliminar la asignación entre{' '}
            <strong>{selectedAsignacion?.responsable.nombre}</strong> y{' '}
            <strong>{selectedAsignacion?.proveedor.razon_social}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Asignación Masiva */}
      <Dialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Asignación Masiva de Proveedores</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={responsables}
                getOptionLabel={(option) => `${option.nombre} (${option.usuario})`}
                value={responsables.find((r) => r.id === bulkResponsableId) || null}
                onChange={(_, newValue) => setBulkResponsableId(newValue?.id || 0)}
                renderInput={(params) => (
                  <TextField {...params} label="Seleccionar Responsable *" required />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={proveedores}
                getOptionLabel={(option) => `${option.razon_social} (${option.nit})`}
                value={proveedores.filter((p) => bulkProveedoresIds.includes(p.id))}
                onChange={(_, newValue) =>
                  setBulkProveedoresIds(newValue.map((p) => p.id))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccionar Proveedores *"
                    required
                    placeholder="Seleccione múltiples proveedores"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Se crearán {bulkProveedoresIds.length} asignaciones para el responsable
                seleccionado. Las asignaciones duplicadas serán omitidas.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleBulkAssign}
            disabled={!bulkResponsableId || bulkProveedoresIds.length === 0}
          >
            Asignar ({bulkProveedoresIds.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AsignacionesPage;
