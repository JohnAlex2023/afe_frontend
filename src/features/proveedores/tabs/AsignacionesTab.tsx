/**
 * Tab de Asignaciones - CRUD completo
 *
 * @version 2.0 - Migrado a asignacion-nit
 * @date 2025-10-19
 */
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
  Checkbox,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, DeleteSweep as DeleteSweepIcon } from '@mui/icons-material';
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
import {
  getResponsables,
  createAsignacionesNitBulk,
} from '../../../services/asignacionNit.api';
import { Responsable } from '../../../types/responsable.types';

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
  const [openWarningDialog, setOpenWarningDialog] = useState(false); // Modal de advertencia
  const [warningMessage, setWarningMessage] = useState<string>(''); // Mensaje de advertencia
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [formData, setFormData] = useState<AsignacionFormData>({
    responsable_id: null,
    proveedor_id: null,
  });
  const [bulkResponsableId, setBulkResponsableId] = useState<number | null>(null);
  const [bulkProveedores, setBulkProveedores] = useState<string[]>([]);
  const [bulkNitsRechazados, setBulkNitsRechazados] = useState<string[]>([]); // NITs que no están registrados
  const [hasPendingInput, setHasPendingInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bulkDialogError, setBulkDialogError] = useState<string | null>(null); // Error específico del modal bulk
  const [submitting, setSubmitting] = useState(false);
  const [selectedAsignaciones, setSelectedAsignaciones] = useState<number[]>([]);
  const listboxRef = React.useRef<HTMLUListElement | null>(null);
  const scrollPositionRef = React.useRef<number>(0);

  useEffect(() => {
    // Cargar TODAS las asignaciones (activas e inactivas) para ver asignaciones huérfanas
    dispatch(fetchAsignaciones({}));
    dispatch(fetchProveedores({}));
    loadResponsables();
  }, [dispatch]);

  const loadResponsables = async () => {
    try {
      const data = await getResponsables({ limit: 1000 });
      setResponsables(data);
    } catch (err) {
      // Error cargando responsables
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
    // Limpiar todos los estados al abrir el modal
    setBulkResponsableId(null);
    setBulkProveedores([]);
    setBulkNitsRechazados([]);
    setHasPendingInput(false);
    setBulkDialogError(null); // Limpiar error del modal
    setOpenBulkDialog(true);
  };

  const handleCloseBulkDialog = () => {
    setOpenBulkDialog(false);
    // Limpiar estados al cerrar el modal
    setBulkResponsableId(null);
    setBulkProveedores([]);
    setBulkNitsRechazados([]);
    setHasPendingInput(false);
    setBulkDialogError(null);
  };

  const handleSubmit = async () => {
    if (!formData.responsable_id || !formData.proveedor_id) {
      setError('Debe seleccionar un responsable y un proveedor');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Obtener datos del proveedor seleccionado
      const proveedor = proveedores.find((p) => p.id === formData.proveedor_id);

      if (!proveedor) {
        setError('Proveedor no encontrado');
        return;
      }

      // Crear asignación con estructura correcta (NIT-based)
      await dispatch(
        createAsignacionThunk({
          nit: proveedor.nit,
          nombre_proveedor: proveedor.razon_social || proveedor.nombre || '',
          responsable_id: formData.responsable_id,
          area: proveedor.area,
          permitir_aprobacion_automatica: true,
          requiere_revision_siempre: false,
        })
      ).unwrap();

      setSuccess('Asignación creada exitosamente');
      setTimeout(() => {
        handleCloseDialog();
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      // Manejar errores específicos del backend
      const errorMessage = err.response?.data?.detail || err.message || 'Error al crear la asignación';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    // PRIMERO: Procesar cualquier input pendiente en el campo de texto
    if (hasPendingInput) {
      const autocompleteInput = document.querySelector<HTMLInputElement>(
        'input[placeholder*="NITs separados por coma"]'
      );

      if (autocompleteInput && autocompleteInput.value.trim()) {
        const inputValue = autocompleteInput.value.trim();

        // Separar NITs por coma
        const nits = inputValue
          .split(',')
          .map((nit) => nit.trim())
          .filter((nit) => nit.length > 0);

        // Validar NITs
        const nitsNoEncontrados: string[] = [];
        const nitsValidos = nits.filter((nit) => {
          const existe = proveedores.some((p) => p.nit === nit);
          if (!existe) {
            nitsNoEncontrados.push(nit);
          }
          return existe;
        });

        // Agregar a los NITs existentes (sin duplicados)
        const nitsUnicos = [...new Set([...bulkProveedores, ...nitsValidos])];

        // Guardar NITs rechazados (acumular con los existentes)
        const rechazadosUnicos = [...new Set([...bulkNitsRechazados, ...nitsNoEncontrados])];

        // Actualizar estados
        setBulkProveedores(nitsUnicos);
        setBulkNitsRechazados(rechazadosUnicos);
        setHasPendingInput(false);

        // Limpiar el input
        autocompleteInput.value = '';

        // Si no hay NITs válidos después de procesar, mostrar error
        if (nitsUnicos.length === 0) {
          setBulkDialogError('Ninguno de los NITs ingresados está registrado como proveedor.');
          return;
        }

        // Esperar un tick para que los estados se actualicen
        setTimeout(() => handleBulkSubmit(), 50);
        return;
      }
    }

    // VALIDACIONES
    if (!bulkResponsableId) {
      setBulkDialogError('Debe seleccionar un responsable');
      return;
    }

    if (bulkProveedores.length === 0) {
      setBulkDialogError('Debe seleccionar o ingresar al menos un NIT válido');
      return;
    }

    setSubmitting(true);
    setBulkDialogError(null);

    try {
      // bulkProveedores ya contiene solo los NITs VÁLIDOS
      // Parsear los NITs para la API
      const nitsData = bulkProveedores.map((nit) => {
        // Buscar el proveedor en la lista por NIT
        const proveedorExistente = proveedores.find((p) => p.nit === nit);

        if (!proveedorExistente) {
          console.error(`NIT ${nit} no encontrado en proveedores, esto no debería pasar`);
        }

        return {
          nit,
          nombre_proveedor: proveedorExistente?.razon_social || 'Sin nombre',
          area: proveedorExistente?.area || 'General',
        };
      });

      console.log('==== DEBUG ASIGNACIÓN MASIVA ====');
      console.log('NITs a asignar:', nitsData);
      console.log('Responsable ID:', bulkResponsableId);

      const requestData = {
        responsable_id: bulkResponsableId,
        nits: nitsData,
        permitir_aprobacion_automatica: true,
        activo: true,
      };
      console.log('Datos completos a enviar:', requestData);

      const response = await createAsignacionesNitBulk(requestData);

      console.log('Respuesta del backend:', response);
      console.log('Errores del backend:', response.errores);
      console.log('Mensaje del backend:', response.mensaje);
      console.log('==== FIN DEBUG ====');

      // Recargar asignaciones inmediatamente (todas, incluyendo inactivas)
      await dispatch(fetchAsignaciones({}));

      // Construir mensaje según resultado
      let mensajeCompleto = '';

      if (response.creadas > 0) {
        mensajeCompleto += `✓ Se asignaron ${response.creadas} NIT(s) exitosamente.\n\n`;
      }

      if (response.reactivadas > 0) {
        mensajeCompleto += `↻ Se reactivaron ${response.reactivadas} asignación(es) previamente eliminada(s).\n\n`;
      }

      if (response.omitidas > 0) {
        mensajeCompleto += `⚠ ${response.omitidas} NIT(s) ya estaban asignados a este responsable y fueron omitidos.\n\n`;
        mensajeCompleto += `NOTA: Si no ve estas asignaciones en la lista, es posible que estén inactivas o huérfanas. Contacte al administrador del sistema para limpiar asignaciones inactivas.\n\n`;
      }

      if (bulkNitsRechazados.length > 0) {
        mensajeCompleto += `✗ Los siguientes NITs NO fueron asignados porque no están registrados:\n\n${bulkNitsRechazados.join(', ')}\n\nPor favor, regístrelos primero en Gestión de Proveedores → Proveedores.`;
      }

      // Cerrar el modal de asignación ANTES de mostrar mensajes
      handleCloseBulkDialog();

      // Si hay mensajes de advertencia o NITs rechazados, mostrar modal
      if (response.omitidas > 0 || bulkNitsRechazados.length > 0 || response.reactivadas > 0) {
        setWarningMessage(mensajeCompleto.trim());
        setOpenWarningDialog(true);
      } else if (response.creadas > 0) {
        // Solo éxito total
        setSuccess(`${response.creadas} asignación(es) creada(s) exitosamente`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // No se creó ni actualizó nada
        setError('No se pudo realizar ninguna asignación. Verifique los datos.');
      }
    } catch (err: any) {
      console.error('Error al crear asignaciones:', err);
      // Manejar errores específicos del backend
      const errorMessage = err.response?.data?.detail || err.message || 'Error al crear asignaciones masivas';
      setError(errorMessage);
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

  const handleSelectAll = () => {
    if (selectedAsignaciones.length === asignaciones.length) {
      setSelectedAsignaciones([]);
    } else {
      setSelectedAsignaciones(asignaciones.map((a) => a.id));
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedAsignaciones.includes(id)) {
      setSelectedAsignaciones(selectedAsignaciones.filter((selId) => selId !== id));
    } else {
      setSelectedAsignaciones([...selectedAsignaciones, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedAsignaciones.length === 0) return;

    const confirmMessage =
      selectedAsignaciones.length === 1
        ? '¿Está seguro de eliminar esta asignación?'
        : `¿Está seguro de eliminar ${selectedAsignaciones.length} asignaciones?`;

    if (window.confirm(confirmMessage)) {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      let errores = 0;
      let eliminadas = 0;

      for (const id of selectedAsignaciones) {
        try {
          await dispatch(deleteAsignacionThunk(id)).unwrap();
          eliminadas++;
        } catch (err: any) {
          errores++;
        }
      }

      // Recargar asignaciones desde el backend para sincronizar (todas)
      await dispatch(fetchAsignaciones({}));

      if (eliminadas > 0) {
        setSuccess(`${eliminadas} asignacion(es) eliminada(s) exitosamente`);
      }
      if (errores > 0) {
        setError(`Error al eliminar ${errores} asignacion(es)`);
      }

      setSelectedAsignaciones([]);
      setSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Gestión de Asignaciones
          </Typography>
          {selectedAsignaciones.length > 0 && (
            <Chip
              label={`${selectedAsignaciones.length} seleccionada(s)`}
              color="primary"
              size="small"
              onDelete={() => setSelectedAsignaciones([])}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selectedAsignaciones.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteSweepIcon />}
              onClick={handleDeleteSelected}
              disabled={submitting}
            >
              Eliminar {selectedAsignaciones.length}
            </Button>
          )}
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
              <TableCell padding="checkbox">
                <Checkbox
                  checked={asignaciones.length > 0 && selectedAsignaciones.length === asignaciones.length}
                  indeterminate={selectedAsignaciones.length > 0 && selectedAsignaciones.length < asignaciones.length}
                  onChange={handleSelectAll}
                  disabled={asignaciones.length === 0}
                />
              </TableCell>
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
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : asignaciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">No hay asignaciones registradas</Typography>
                </TableCell>
              </TableRow>
            ) : (
              asignaciones.map((asignacion) => (
                <TableRow
                  key={asignacion.id}
                  hover
                  selected={selectedAsignaciones.includes(asignacion.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedAsignaciones.includes(asignacion.id)}
                      onChange={() => handleSelectOne(asignacion.id)}
                    />
                  </TableCell>
                  <TableCell>{asignacion.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {asignacion.responsable?.nombre || `ID: ${asignacion.responsable_id}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {asignacion.responsable?.email || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {asignacion.nombre_proveedor}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={asignacion.nit} size="small" />
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
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        aria-modal="true"
        disableEnforceFocus
      >
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
      <Dialog
        open={openBulkDialog}
        onClose={handleCloseBulkDialog}
        maxWidth="md"
        fullWidth
        aria-modal="true"
        disableEnforceFocus
      >
        <DialogTitle>Asignación Masiva de Proveedores</DialogTitle>
        <DialogContent>
          {bulkDialogError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setBulkDialogError(null)}>
              {bulkDialogError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Autocomplete
              options={responsables}
              getOptionLabel={(option) => `${option.nombre} (${option.email})`}
              value={responsables.find((r) => r.id === bulkResponsableId) || null}
              onChange={(_, newValue) => setBulkResponsableId(newValue?.id || null)}
              renderInput={(params) => <TextField {...params} label="Responsable" required />}
            />
            {/* Autocomplete de NITs existentes */}
            <Autocomplete
              multiple
              freeSolo
              disableCloseOnSelect
              disableListWrap
              options={proveedores.map((p) => p.nit)}
              value={bulkProveedores}
              onChange={(_, newValue) => {
                // Procesar NITs (pueden venir pegados con comas o seleccionados)
                const nitsToProcess = newValue.flatMap((item) => {
                  // Si contiene comas, separar múltiples NITs
                  if (item.includes(',')) {
                    return item
                      .split(',')
                      .map((nit) => nit.trim())
                      .filter((nit) => nit.length > 0);
                  }
                  return [item.trim()];
                });

                // Eliminar duplicados
                const nitsUnicos = [...new Set(nitsToProcess)];

                // Validar cada NIT contra proveedores registrados
                const nitsNoEncontrados: string[] = [];
                const nitsValidos = nitsUnicos.filter((nit) => {
                  const existe = proveedores.some((p) => p.nit === nit);
                  if (!existe) {
                    nitsNoEncontrados.push(nit);
                  }
                  return existe;
                });

                // Guardar NITs rechazados en el estado para mostrarlos después
                setBulkNitsRechazados(nitsNoEncontrados);

                if (nitsNoEncontrados.length > 0) {
                  setBulkDialogError(
                    `Los siguientes NITs no están registrados como proveedores: ${nitsNoEncontrados.join(', ')}. Se asignarán solo los NITs válidos.`
                  );
                } else {
                  setBulkDialogError(null);
                }

                setBulkProveedores(nitsValidos);
              }}
              ListboxProps={{
                style: { maxHeight: '300px' },
              }}
              renderTags={(value, getTagProps) =>
                value.map((nit, index) => {
                  const proveedor = proveedores.find((p) => p.nit === nit);

                  return (
                    <Chip
                      {...getTagProps({ index })}
                      key={nit}
                      label={`${nit} - ${proveedor?.razon_social || 'N/A'}`}
                      color="primary"
                      variant="outlined"
                    />
                  );
                })
              }
              renderOption={(props, option, { selected }) => {
                const proveedor = proveedores.find((p) => p.nit === option);
                const { onClick, ...otherProps } = props;

                return (
                  <li
                    {...otherProps}
                    key={option}
                    onClick={(e) => {
                      // Prevenir el scroll automático al inicio
                      e.preventDefault();
                      if (onClick) {
                        onClick(e);
                      }
                    }}
                  >
                    <Checkbox
                      icon={<span style={{ width: 17, height: 17, border: '2px solid #ccc', borderRadius: 3 }} />}
                      checkedIcon={<span style={{ width: 17, height: 17, backgroundColor: '#9c27b0', border: '2px solid #9c27b0', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>✓</span>}
                      checked={selected}
                      sx={{ marginRight: 1 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {option}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {proveedor?.razon_social || 'Sin razón social'}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              componentsProps={{
                paper: {
                  sx: {
                    '& .MuiAutocomplete-listbox': {
                      maxHeight: '300px',
                      paddingBottom: '48px', // Espacio para el botón
                    },
                  },
                },
                popper: {
                  placement: 'bottom-start',
                  modifiers: [
                    {
                      name: 'flip',
                      enabled: false,
                    },
                  ],
                },
              }}
              ListboxComponent={(props) => {
                const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
                  scrollPositionRef.current = e.currentTarget.scrollTop;
                };

                return (
                  <Box>
                    <ul
                      {...props}
                      ref={(node) => {
                        listboxRef.current = node;
                        if (node && scrollPositionRef.current > 0) {
                          // Restaurar posición del scroll
                          node.scrollTop = scrollPositionRef.current;
                        }
                      }}
                      onScroll={handleScroll}
                      style={{ ...props.style, paddingBottom: 0 }}
                    />
                    <Box
                      sx={{
                        position: 'sticky',
                        bottom: 0,
                        backgroundColor: 'background.paper',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        padding: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {bulkProveedores.length} NIT{bulkProveedores.length !== 1 ? 's' : ''} seleccionado
                        {bulkProveedores.length !== 1 ? 's' : ''}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Cerrar el dropdown
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                      >
                        Listo
                      </Button>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar NITs"
                  placeholder="Busque, seleccione o pegue NITs separados por coma"
                  helperText="Puede seleccionar de la lista o pegar múltiples NITs separados por comas (Ej: 900123456-7, 800111222-3, 900333444-5)"
                  onChange={(e) => {
                    // Detectar si hay texto con comas en el input
                    const inputValue = (e.target as HTMLInputElement).value;
                    setHasPendingInput(inputValue.includes(','));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const inputValue = (e.target as HTMLInputElement).value;

                      if (inputValue && inputValue.includes(',')) {
                        // Separar NITs por coma
                        const nits = inputValue
                          .split(',')
                          .map((nit) => nit.trim())
                          .filter((nit) => nit.length > 0);

                        // Validar NITs
                        const nitsNoEncontrados: string[] = [];
                        const nitsValidos = nits.filter((nit) => {
                          const existe = proveedores.some((p) => p.nit === nit);
                          if (!existe) {
                            nitsNoEncontrados.push(nit);
                          }
                          return existe;
                        });

                        // Agregar a los NITs existentes (sin duplicados)
                        const nitsUnicos = [...new Set([...bulkProveedores, ...nitsValidos])];
                        setBulkProveedores(nitsUnicos);

                        // Guardar NITs rechazados (acumular con los existentes)
                        const rechazadosUnicos = [...new Set([...bulkNitsRechazados, ...nitsNoEncontrados])];
                        setBulkNitsRechazados(rechazadosUnicos);

                        // Mostrar alerta si hay NITs no registrados
                        if (nitsNoEncontrados.length > 0) {
                          setBulkDialogError(
                            `Los siguientes NITs no están registrados: ${nitsNoEncontrados.join(', ')}. Se asignarán solo los NITs válidos.`
                          );
                        } else {
                          setBulkDialogError(null);
                        }

                        // Limpiar el input y el estado
                        (e.target as HTMLInputElement).value = '';
                        setHasPendingInput(false);
                      }
                    }
                  }}
                />
              )}
            />

            {bulkProveedores.length > 0 && (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2" fontWeight={500}>
                  {bulkProveedores.length} NIT{bulkProveedores.length !== 1 ? 's' : ''} seleccionado
                  {bulkProveedores.length !== 1 ? 's' : ''} para asignar
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleBulkSubmit} variant="contained" disabled={submitting || (!bulkResponsableId)}>
            {submitting ? (
              <CircularProgress size={24} />
            ) : hasPendingInput ? (
              'Asignar NITs'
            ) : bulkProveedores.length === 0 ? (
              'Asignar NITs'
            ) : (
              `Asignar ${bulkProveedores.length} NIT${bulkProveedores.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Advertencia para NITs no registrados */}
      <Dialog
        open={openWarningDialog}
        onClose={() => setOpenWarningDialog(false)}
        maxWidth="sm"
        fullWidth
        aria-modal="true"
        disableEnforceFocus
        slotProps={{
          paper: {
            sx: {
              borderTop: '4px solid',
              borderColor: 'warning.main',
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
          <Box
            component="span"
            sx={{
              fontSize: '1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'warning.light',
              color: 'warning.dark',
            }}
          >
            ⚠
          </Box>
          <Typography variant="h6" component="span" fontWeight={600}>
            Advertencia: NITs no registrados
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-line',
              lineHeight: 1.8,
              color: 'text.primary',
            }}
          >
            {warningMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenWarningDialog(false)}
            variant="contained"
            color="primary"
            fullWidth
            size="large"
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AsignacionesTab;
