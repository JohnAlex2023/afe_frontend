/**
 * Tab de Asignaciones - CRUD completo
 *
 * @version 2.0 - Migrado a asignacion-nit
 * @date 2025-10-19
 */
import React, { useState, useEffect } from 'react';
import { normalizarNit, validarNit } from '../../../utils/nit';
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
  Stack,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, DeleteSweep as DeleteSweepIcon, Warning as WarningIcon, Close } from '@mui/icons-material';
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
import { zentriaColors } from '../../../theme/colors';

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
  const [duplicateNit, setDuplicateNit] = useState<string | null>(null); // NIT duplicado para mostrar
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
    dispatch(fetchAsignaciones({ skip: 0, limit: 1000 }));
    dispatch(fetchProveedores({ skip: 0, limit: 1000 }));
  }, [dispatch]);

  // Cargar responsables solo una vez al montar el componente
  useEffect(() => {
    loadResponsables();
  }, []);

  const loadResponsables = async () => {
    try {
      const data = await getResponsables({ limit: 1000 });
      console.log('Responsables cargados:', data);
      setResponsables(data);
    } catch (err) {
      console.error('Error cargando responsables:', err);
      setError(`Error al cargar responsables: ${err instanceof Error ? err.message : String(err)}`);
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
      // Manejar errores específicos del backend de manera empresarial
      // Con .unwrap(), el error lanzado puede ser un string (del rejectWithValue) o un Error object
      const detail = typeof err === 'string' ? err : (err.message || JSON.stringify(err));

      // Detectar si el error es por NIT duplicado/ya asignado
      // Patrones de error que indican duplicado:
      // - "ya tiene asignado el NIT"
      // - "ya existe"
      // - "activa"
      const isDuplicateError =
        detail.toLowerCase().includes('ya') &&
        (detail.toLowerCase().includes('asignado') ||
         detail.toLowerCase().includes('existe') ||
         detail.toLowerCase().includes('activa'));

      if (isDuplicateError) {
        // Mostrar advertencia elegante para duplicados
        const nitMatch = detail.match(/(\d{1,9}-\d)/);
        const nitDisplay = nitMatch ? nitMatch[1] : '';

        setDuplicateNit(nitDisplay);
        setWarningMessage('NIT ya registrado');
        setOpenWarningDialog(true);
      } else {
        // Otros errores se muestran como error
        setError(detail || 'Error al crear la asignación');
      }
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

        // Validar y normalizar NITs
        const nitsNoEncontrados: string[] = [];
        const nitsValidos = nits.filter((nitInput) => {
          try {
            // Normalizar el NIT ingresado (calcula DV automáticamente)
            const nitNormalizado = normalizarNit(nitInput);

            // Buscar en proveedores con el NIT normalizado
            const existe = proveedores.some((p) => p.nit === nitNormalizado);
            if (!existe) {
              nitsNoEncontrados.push(nitInput);
            }
            return existe ? nitNormalizado : false;
          } catch (error) {
            // Si hay error al normalizar, agregar a rechazados
            nitsNoEncontrados.push(nitInput);
            return false;
          }
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
      // Manejar errores específicos del backend de manera empresarial
      // El error puede venir como string (del rejectWithValue) o como Error object
      const detail = typeof err === 'string' ? err : (err.message || JSON.stringify(err));

      // Detectar si el error es por NITs duplicados/ya asignados
      const isDuplicateError =
        detail.toLowerCase().includes('ya') &&
        (detail.toLowerCase().includes('asignado') ||
         detail.toLowerCase().includes('existe') ||
         detail.toLowerCase().includes('activa'));

      if (isDuplicateError) {
        // Extraer NITs del mensaje si es posible
        const nitsMatch = detail.match(/(\d{1,9}-\d)/g);
        const nitsDisplay = nitsMatch ? nitsMatch.join(', ') : '';

        setDuplicateNit(nitsDisplay);
        setWarningMessage('NITs ya registrados');
        setOpenWarningDialog(true);
      } else {
        setError(detail || 'Error al crear asignaciones masivas');
      }
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
              getOptionLabel={(option) => `${option.razon_social} - ${option.nit}`}
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
              getOptionLabel={(option) => option}
              value={bulkProveedores}
              onChange={(_, newValue) => {
                // Procesar NITs (pueden venir pegados con comas o seleccionados)
                const nitsToProcess = newValue.flatMap((nit) => {
                  // Si contiene comas, separar múltiples NITs
                  if (nit.includes(',')) {
                    return nit
                      .split(',')
                      .map((n) => n.trim())
                      .filter((n) => n.length > 0);
                  }
                  return [nit.trim()];
                });

                // Eliminar duplicados
                const nitsUnicos = [...new Set(nitsToProcess)];

                // Validar y normalizar cada NIT contra proveedores registrados
                const nitsNoEncontrados: string[] = [];
                const nitsDuplicados: string[] = [];
                const nitsValidos = nitsUnicos.filter((nitInput) => {
                  try {
                    // Normalizar el NIT ingresado (calcula DV automáticamente)
                    const nitNormalizado = normalizarNit(nitInput);

                    // Verificar si el NIT ya está asignado a este responsable
                    if (bulkResponsableId) {
                      const yaAsignado = asignaciones.some(
                        (a) => a.nit === nitNormalizado && a.responsable_id === bulkResponsableId && a.activo
                      );
                      if (yaAsignado) {
                        nitsDuplicados.push(nitNormalizado);
                        return false;
                      }
                    }

                    // Buscar en proveedores con el NIT normalizado
                    const existe = proveedores.some((p) => p.nit === nitNormalizado);
                    if (!existe) {
                      nitsNoEncontrados.push(nitInput);
                    }
                    return existe ? nitNormalizado : false;
                  } catch (error) {
                    // Si hay error al normalizar, agregar a rechazados
                    nitsNoEncontrados.push(nitInput);
                    return false;
                  }
                });

                // Guardar NITs rechazados en el estado para mostrarlos después
                setBulkNitsRechazados([...nitsNoEncontrados, ...nitsDuplicados]);

                // Construir mensaje de error
                const mensajesParte = [];
                if (nitsNoEncontrados.length > 0) {
                  mensajesParte.push(
                    `Los siguientes NITs no están registrados como proveedores: ${nitsNoEncontrados.join(', ')}`
                  );
                }
                if (nitsDuplicados.length > 0) {
                  mensajesParte.push(
                    `Los siguientes NITs ya están asignados a este responsable: ${nitsDuplicados.join(', ')}`
                  );
                }

                if (mensajesParte.length > 0) {
                  setBulkDialogError(mensajesParte.join('. '));
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
                // option es siempre un string (NIT)
                const nit = option;
                const proveedor = proveedores.find((p) => p.nit === nit);
                const { onClick, ...otherProps } = props;

                return (
                  <li
                    {...otherProps}
                    key={nit}
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
                        {nit}
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
                  placeholder="Busque o digite NITs separados por coma"
                  helperText="Puede seleccionar de la lista o digitar múltiples NITs separados por comas (Ej: 900123456, 800111222, 900333444)"
                  InputProps={{
                    ...params.InputProps,
                  }}
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

                        // Validar y normalizar NITs
                        const nitsNoEncontrados: string[] = [];
                        const nitsDuplicados: string[] = [];
                        const nitsValidos = nits.filter((nitInput) => {
                          try {
                            // Normalizar el NIT ingresado (calcula DV automáticamente)
                            const nitNormalizado = normalizarNit(nitInput);

                            // Verificar si el NIT ya está asignado a este responsable
                            if (bulkResponsableId) {
                              const yaAsignado = asignaciones.some(
                                (a) => a.nit === nitNormalizado && a.responsable_id === bulkResponsableId && a.activo
                              );
                              if (yaAsignado) {
                                nitsDuplicados.push(nitNormalizado);
                                return false;
                              }
                            }

                            // Buscar en proveedores con el NIT normalizado
                            const existe = proveedores.some((p) => p.nit === nitNormalizado);
                            if (!existe) {
                              nitsNoEncontrados.push(nitInput);
                            }
                            return existe ? nitNormalizado : false;
                          } catch (error) {
                            // Si hay error al normalizar, agregar a rechazados
                            nitsNoEncontrados.push(nitInput);
                            return false;
                          }
                        });

                        // Agregar a los NITs existentes (sin duplicados)
                        const nitsUnicos = [...new Set([...bulkProveedores, ...nitsValidos])];
                        setBulkProveedores(nitsUnicos);

                        // Guardar NITs rechazados (acumular con los existentes)
                        const rechazadosUnicos = [...new Set([...bulkNitsRechazados, ...nitsNoEncontrados, ...nitsDuplicados])];
                        setBulkNitsRechazados(rechazadosUnicos);

                        // Construir mensaje de error
                        const mensajesParte = [];
                        if (nitsNoEncontrados.length > 0) {
                          mensajesParte.push(
                            `Los siguientes NITs no están registrados: ${nitsNoEncontrados.join(', ')}`
                          );
                        }
                        if (nitsDuplicados.length > 0) {
                          mensajesParte.push(
                            `Los siguientes NITs ya están asignados a este responsable: ${nitsDuplicados.join(', ')}`
                          );
                        }

                        if (mensajesParte.length > 0) {
                          setBulkDialogError(mensajesParte.join('. '));
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
          }
        }}
      >
        {/* Header con Gradiente Corporativo Naranja - Mejor contraste */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${zentriaColors.naranja.main} 0%, ${zentriaColors.naranja.dark} 100%)`,
            color: 'white',
            p: 3,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" flex={1}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <WarningIcon sx={{ fontSize: 28, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white">
                {warningMessage.includes('NITs') ? 'NITs Ya Registrados' : 'NIT Ya Registrado'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Esta asignación ya existe
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={() => {
              setOpenWarningDialog(false);
              setDuplicateNit(null);
              setWarningMessage('');
            }}
            aria-label="Cerrar advertencia"
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 4, backgroundColor: '#fafafa', textAlign: 'center' }}>
          {/* NIT Duplicado - Mostrar de forma clara y profesional */}
          {duplicateNit && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                NIT ya registrado:
              </Typography>
              <Box
                sx={{
                  backgroundColor: 'white',
                  border: `2px solid ${zentriaColors.naranja.main}`,
                  borderRadius: 2,
                  p: 2.5,
                  display: 'inline-block',
                  minWidth: 200,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: zentriaColors.naranja.main,
                    fontFamily: 'monospace',
                    letterSpacing: 1,
                  }}
                >
                  {duplicateNit}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Mensaje descriptivo */}
          <Alert
            severity="info"
            sx={{
              backgroundColor: `${zentriaColors.verde.light}15`,
              border: `1.5px solid ${zentriaColors.verde.light}`,
              borderRadius: 2,
              textAlign: 'left',
              '& .MuiAlert-message': {
                color: '#222',
              },
            }}
          >
            <Typography variant="body2" color="#222">
              {warningMessage.includes('NITs')
                ? 'Estos NITs ya están asignados a este responsable. Selecciona otros NITs para continuar.'
                : 'Este NIT ya está asignado a este responsable. Selecciona otro NIT para continuar.'}
            </Typography>
          </Alert>
        </DialogContent>

        {/* Footer de Acciones */}
        <Box
          sx={{
            backgroundColor: '#f5f5f5',
            p: 3,
            borderTop: `1px solid ${zentriaColors.cinza}`,
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
          <Button
            onClick={() => {
              setOpenWarningDialog(false);
              setDuplicateNit(null);
              setWarningMessage('');
            }}
            variant="contained"
            size="large"
            sx={{
              minWidth: 160,
              background: `linear-gradient(135deg, ${zentriaColors.naranja.main} 0%, ${zentriaColors.naranja.dark} 100%)`,
              color: 'white',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: `0 4px 15px ${zentriaColors.naranja.main}40`,
              '&:hover': {
                boxShadow: `0 6px 20px ${zentriaColors.naranja.main}60`,
              },
            }}
          >
            Entendido
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}

export default AsignacionesTab;
