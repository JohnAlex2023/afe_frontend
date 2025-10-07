/** Tab de Asignaciones - CRUD completo */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Autocomplete,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchAsignaciones,
  createAsignacionThunk,
  deleteAsignacionThunk,
  fetchProveedores,
  selectAsignacionesList,
  selectAsignacionesLoading,
  selectProveedoresList,
} from '../proveedoresSlice';
import { getResponsables } from '../../../services/responsableProveedor.api';
import { Responsable } from '../../../types/responsable.types';
import { createAsignacionesBulk } from '../../../services/responsableProveedor.api';

interface AsignacionFormData {
  responsable_id: number | null;
  proveedor_id: number | null;
}

function AsignacionesTab() {
  const dispatch = useAppDispatch();
  const asignaciones = useAppSelector(selectAsignacionesList);
  const loading = useAppSelector(selectAsignacionesLoading);
  const proveedores = useAppSelector(selectProveedoresList);

  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [formData, setFormData] = useState<AsignacionFormData>({
    responsable_id: null,
    proveedor_id: null,
  });
  const [bulkResponsableId, setBulkResponsableId] = useState<number | null>(null);
  const [bulkProveedores, setBulkProveedores] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAsignaciones());
    dispatch(fetchProveedores({}));
    loadResponsables();
  }, [dispatch]);

  const loadResponsables = async () => {
    try {
      const data = await getResponsables({ limit: 1000 });
      setResponsables(data);
    } catch (err) {
      console.error('Error cargando responsables:', err);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ responsable_id: null, proveedor_id: null });
    setError(null);
    setSuccess(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenBulkDialog = () => {
    setBulkResponsableId(null);
    setBulkProveedores([]);
    setError(null);
    setSuccess(null);
    setOpenBulkDialog(true);
  };

  const handleCloseBulkDialog = () => {
    setOpenBulkDialog(false);
  };

  const handleSubmit = async () => {
    if (!formData.responsable_id || !formData.proveedor_id) {
      setError('Debe seleccionar un responsable y un proveedor');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await dispatch(
        createAsignacionThunk({
          responsable_id: formData.responsable_id,
          proveedor_id: formData.proveedor_id,
        })
      ).unwrap();

      setSuccess('Asignación creada exitosamente');
      setTimeout(() => {
        handleCloseDialog();
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al crear la asignación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkResponsableId || bulkProveedores.length === 0) {
      setError('Debe seleccionar un responsable y al menos un proveedor');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await createAsignacionesBulk({
        responsable_id: bulkResponsableId,
        proveedor_ids: bulkProveedores,
      });

      setSuccess(`${response.creadas} asignaciones creadas exitosamente`);
      dispatch(fetchAsignaciones());
      setTimeout(() => {
        handleCloseBulkDialog();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al crear asignaciones masivas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar esta asignación?')) {
      try {
        await dispatch(deleteAsignacionThunk(id)).unwrap();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar la asignación');
      }
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Gestión de Asignaciones
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenBulkDialog}>
            Asignación Masiva
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Nueva Asignación
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>NIT</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : asignaciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">No hay asignaciones registradas</Typography>
                </TableCell>
              </TableRow>
            ) : (
              asignaciones.map((asignacion) => (
                <TableRow key={asignacion.id}>
                  <TableCell>{asignacion.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {asignacion.responsable.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {asignacion.responsable.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {asignacion.proveedor.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={asignacion.proveedor.nit} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleDelete(asignacion.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear asignación individual */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Asignación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Autocomplete
              options={responsables}
              getOptionLabel={(option) => `${option.nombre} (${option.email})`}
              value={responsables.find((r) => r.id === formData.responsable_id) || null}
              onChange={(_, newValue) =>
                setFormData({ ...formData, responsable_id: newValue?.id || null })
              }
              renderInput={(params) => <TextField {...params} label="Responsable" required />}
            />
            <Autocomplete
              options={proveedores}
              getOptionLabel={(option) => `${option.nombre} - ${option.nit}`}
              value={proveedores.find((p) => p.id === formData.proveedor_id) || null}
              onChange={(_, newValue) =>
                setFormData({ ...formData, proveedor_id: newValue?.id || null })
              }
              renderInput={(params) => <TextField {...params} label="Proveedor" required />}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para asignación masiva */}
      <Dialog open={openBulkDialog} onClose={handleCloseBulkDialog} maxWidth="md" fullWidth>
        <DialogTitle>Asignación Masiva de Proveedores</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Autocomplete
              options={responsables}
              getOptionLabel={(option) => `${option.nombre} (${option.email})`}
              value={responsables.find((r) => r.id === bulkResponsableId) || null}
              onChange={(_, newValue) => setBulkResponsableId(newValue?.id || null)}
              renderInput={(params) => <TextField {...params} label="Responsable" required />}
            />
            <Autocomplete
              multiple
              options={proveedores}
              getOptionLabel={(option) => `${option.nombre} - ${option.nit}`}
              value={proveedores.filter((p) => bulkProveedores.includes(p.id))}
              onChange={(_, newValue) => setBulkProveedores(newValue.map((v) => v.id))}
              renderInput={(params) => (
                <TextField {...params} label="Proveedores (selección múltiple)" required />
              )}
            />
            <Typography variant="caption" color="text.secondary">
              Seleccione múltiples proveedores para asignar al responsable seleccionado
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDialog}>Cancelar</Button>
          <Button onClick={handleBulkSubmit} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : `Asignar ${bulkProveedores.length} proveedores`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AsignacionesTab;
