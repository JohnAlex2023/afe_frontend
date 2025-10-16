import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Collapse,
  Paper,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Search,
  FilterList,
  Download,
  Refresh,
  Clear,
  FileDownload,
  PictureAsPdf,
  TableChart,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchFacturasPendientes, fetchFacturaDetalle, aprobarFactura, rechazarFactura } from './facturasSlice';
import { zentriaColors } from '../../theme/colors';
import { actionButtonStyles, tooltipProps } from '../../theme/buttonStyles';
import FacturaDetailModal from '../../components/Facturas/FacturaDetailModal';
import ApprovalDialog from '../../components/Facturas/ApprovalDialog';
import RejectionDialog from '../../components/Facturas/RejectionDialog';
import { useNotification } from '../../components/Notifications/NotificationProvider';
import type { Workflow } from '../../types/factura.types';

/**
 * Facturas Page - Enterprise Level
 * Página de facturas con filtros avanzados, búsqueda, paginación y exportación
 */

function FacturasPage() {
  console.log('[FacturasPage] Componente renderizado');

  const dispatch = useAppDispatch();
  const facturasState = useAppSelector((state) => state.facturas);
  const { pendientes = [], loading = false } = facturasState || {};
  const user = useAppSelector((state) => state.auth.user);
  const { showNotification } = useNotification();

  console.log('[FacturasPage] Estado:', {
    pendientes: pendientes?.length,
    loading,
    user: user?.id,
    facturasState
  });

  // Estados de modales y acciones
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados de filtros y búsqueda
  const [searchText, setSearchText] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [similitudFilter, setSimilitudFilter] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFacturasPendientes(user.id));
    }
  }, [dispatch, user]);

  // Filtrado y búsqueda de facturas
  const filteredFacturas = useMemo(() => {
    console.log('[FacturasPage] Filtrando facturas:', pendientes?.length);
    if (!Array.isArray(pendientes)) {
      console.warn('[FacturasPage] pendientes no es un array:', pendientes);
      return [];
    }

    let result = [...pendientes];

    // Filtro de búsqueda por texto
    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(
        (f) =>
          f.numero_factura?.toLowerCase().includes(search) ||
          f.proveedor?.toLowerCase().includes(search) ||
          f.nit?.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    if (estadoFilter !== 'todos') {
      result = result.filter((f) => f.estado === estadoFilter);
    }

    // Filtro por similitud
    if (similitudFilter !== 'todos') {
      if (similitudFilter === 'alta') {
        result = result.filter((f) => (f.porcentaje_similitud || 0) >= 95);
      } else if (similitudFilter === 'media') {
        result = result.filter((f) => (f.porcentaje_similitud || 0) >= 80 && (f.porcentaje_similitud || 0) < 95);
      } else if (similitudFilter === 'baja') {
        result = result.filter((f) => (f.porcentaje_similitud || 0) < 80);
      }
    }

    return result;
  }, [pendientes, searchText, estadoFilter, similitudFilter]);

  // Paginación
  const paginatedFacturas = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredFacturas.slice(start, start + rowsPerPage);
  }, [filteredFacturas, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setEstadoFilter('todos');
    setSimilitudFilter('todos');
    setPage(0);
  };

  const handleRefresh = () => {
    if (user?.id) {
      dispatch(fetchFacturasPendientes(user.id));
      showNotification('Datos actualizados', 'success');
    }
  };

  // Funciones de exportación
  const handleExportExcel = () => {
    try {
      console.log('[FacturasPage] Exportando a Excel:', filteredFacturas.length);
      // Crear CSV manualmente
      const headers = ['Factura', 'Proveedor', 'NIT', 'Monto', 'Estado', 'Similitud %'];
      const rows = filteredFacturas.map((f) => [
        f.numero_factura || '',
        f.proveedor || '',
        f.nit || '',
        f.monto || 0,
        f.estado || '',
        f.porcentaje_similitud?.toFixed(1) || 'N/A',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `facturas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification('Archivo Excel exportado exitosamente', 'success');
    } catch (error) {
      showNotification('Error al exportar a Excel', 'error');
    }
    setExportMenuAnchor(null);
  };

  const handleExportPDF = () => {
    showNotification('Exportación a PDF en desarrollo', 'info');
    setExportMenuAnchor(null);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobada_auto':
      case 'aprobada_manual':
        return 'success';
      case 'rechazada':
        return 'error';
      case 'pendiente_revision':
      case 'en_revision':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewDetails = async (workflow: Workflow) => {
    try {
      // @ts-ignore - FacturaPendiente tiene factura_id
      const facturaId = workflow.factura_id || workflow.factura?.id;

      if (!facturaId) {
        showNotification('No se pudo obtener el ID de la factura', 'error');
        return;
      }

      // Cargar detalles completos de la factura
      const detalles = await dispatch(fetchFacturaDetalle(facturaId)).unwrap();

      console.log('[handleViewDetails] Detalles recibidos:', detalles);

      // Combinar factura y workflow en un solo objeto para el modal
      // Mapear factura_mes_anterior a factura_referencia para compatibilidad con el modal
      const workflowCompleto = {
        ...(detalles.workflow || {}),
        factura: detalles.factura,
        factura_referencia: detalles.workflow?.factura_mes_anterior,
        contexto_historico: detalles.contexto_historico
      };

      console.log('[handleViewDetails] Workflow completo:', workflowCompleto);

      setSelectedWorkflow(workflowCompleto);
      setDetailModalOpen(true);
    } catch (error: any) {
      console.error('Error al cargar detalles de factura:', error);
      showNotification('Error al cargar detalles de la factura', 'error');
    }
  };

  const handleOpenApproval = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setApprovalDialogOpen(true);
  };

  const handleOpenRejection = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setRejectionDialogOpen(true);
  };

  const handleApprove = async (observaciones: string) => {
    if (!selectedWorkflow || !user?.id) return;

    setActionLoading(true);
    try {
      // @ts-ignore - FacturaPendiente tiene workflow_id
      const workflowId = selectedWorkflow.workflow_id || selectedWorkflow.id;
      await dispatch(
        aprobarFactura({
          workflowId,
          data: {
            aprobado_por: String(user.id),
            observaciones: observaciones || undefined,
          },
        })
      ).unwrap();

      showNotification(
        `✅ Factura ${selectedWorkflow.factura?.numero_factura} aprobada exitosamente`,
        'success'
      );

      setApprovalDialogOpen(false);
      setSelectedWorkflow(null);

      // Refrescar lista
      if (user?.id) {
        dispatch(fetchFacturasPendientes(user.id));
      }
    } catch (error: any) {
      console.error('Error al aprobar factura:', error);
      showNotification(
        `❌ Error al aprobar factura: ${error.message || 'Error desconocido'}`,
        'error'
      );
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (motivo: string, observaciones: string) => {
    if (!selectedWorkflow || !user?.id) return;

    setActionLoading(true);
    try {
      // @ts-ignore - FacturaPendiente tiene workflow_id
      const workflowId = selectedWorkflow.workflow_id || selectedWorkflow.id;
      await dispatch(
        rechazarFactura({
          workflowId,
          data: {
            rechazado_por: String(user.id),
            motivo: motivo,
            detalle: observaciones || undefined,
          },
        })
      ).unwrap();

      showNotification(
        `🚫 Factura ${selectedWorkflow.factura?.numero_factura} rechazada`,
        'warning'
      );

      setRejectionDialogOpen(false);
      setSelectedWorkflow(null);

      // Refrescar lista
      if (user?.id) {
        dispatch(fetchFacturasPendientes(user.id));
      }
    } catch (error: any) {
      console.error('Error al rechazar factura:', error);
      showNotification(
        `❌ Error al rechazar factura: ${error.message || 'Error desconocido'}`,
        'error'
      );
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px" gap={2}>
        <CircularProgress size={60} sx={{ color: zentriaColors.violeta.main }} />
        <Typography variant="h6" color="text.secondary">Cargando facturas...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Gestión de Facturas
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mt={1} flexWrap="wrap">
            <Chip
              label={`${filteredFacturas.length} de ${pendientes.length} facturas`}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {(searchText || estadoFilter !== 'todos' || similitudFilter !== 'todos') && (
              <Chip
                label="Filtros activos"
                color="warning"
                size="small"
                onDelete={handleClearFilters}
                deleteIcon={<Clear />}
              />
            )}
          </Box>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Tooltip title="Actualizar datos">
            <IconButton
              onClick={handleRefresh}
              sx={{
                background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
                color: 'white',
                '&:hover': {
                  background: `linear-gradient(135deg, ${zentriaColors.violeta.dark}, ${zentriaColors.naranja.dark})`,
                },
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            sx={{
              background: `linear-gradient(135deg, ${zentriaColors.verde.main}, ${zentriaColors.verde.dark})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${zentriaColors.verde.dark}, ${zentriaColors.verde.main})`,
              },
            }}
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por factura, proveedor o NIT..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: zentriaColors.violeta.main }} />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchText('')}>
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderRadius: 2,
                  ...(showFilters && {
                    background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
                  }),
                }}
              >
                Filtros Avanzados
              </Button>
              {(estadoFilter !== 'todos' || similitudFilter !== 'todos') && (
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={handleClearFilters}
                  sx={{ borderRadius: 2 }}
                >
                  Limpiar
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Panel de filtros expandible */}
        <Collapse in={showFilters}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={estadoFilter}
                  label="Estado"
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="todos">Todos los estados</MenuItem>
                  <MenuItem value="pendiente_revision">Pendiente Revisión</MenuItem>
                  <MenuItem value="en_revision">En Revisión</MenuItem>
                  <MenuItem value="aprobada_auto">Aprobada Automática</MenuItem>
                  <MenuItem value="aprobada_manual">Aprobada Manual</MenuItem>
                  <MenuItem value="rechazada">Rechazada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Nivel de Similitud</InputLabel>
                <Select
                  value={similitudFilter}
                  label="Nivel de Similitud"
                  onChange={(e) => setSimilitudFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="todos">Todas las similitudes</MenuItem>
                  <MenuItem value="alta">Alta (≥95%)</MenuItem>
                  <MenuItem value="media">Media (80-95%)</MenuItem>
                  <MenuItem value="baja">Baja (&lt;80%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      <Card sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 650, sm: 750, md: 900 } }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Factura</strong>
                </TableCell>
                <TableCell>
                  <strong>Proveedor</strong>
                </TableCell>
                <TableCell>
                  <strong>NIT</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Monto</strong>
                </TableCell>
                <TableCell>
                  <strong>Estado</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Similitud</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Ver</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFacturas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box py={6}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No se encontraron facturas
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchText || estadoFilter !== 'todos' || similitudFilter !== 'todos'
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'No hay facturas pendientes en este momento'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFacturas.map((factura) => (
                  <TableRow key={factura.workflow_id} hover>
                    <TableCell>{factura.numero_factura}</TableCell>
                    <TableCell>{factura.proveedor}</TableCell>
                    <TableCell>{factura.nit}</TableCell>
                    <TableCell align="right">{formatCurrency(factura.monto)}</TableCell>
                    <TableCell>
                      <Chip
                        label={factura.estado.replace('_', ' ')}
                        color={getEstadoColor(factura.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {factura.porcentaje_similitud ? (
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={factura.porcentaje_similitud >= 95 ? zentriaColors.verde.main : zentriaColors.naranja.main}
                          >
                            {factura.porcentaje_similitud.toFixed(1)}%
                          </Typography>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`Ver detalles de la factura ${factura.numero_factura}`} {...tooltipProps}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(factura)}
                          sx={actionButtonStyles.view}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={1} justifyContent="center">
                        <Tooltip title={`Aprobar factura ${factura.numero_factura}`} {...tooltipProps}>
                          <span>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleOpenApproval(factura)}
                              disabled={actionLoading}
                              sx={{
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 4px 12px ${zentriaColors.verde.main}60`,
                                },
                                '&:active': {
                                  transform: 'translateY(0)',
                                },
                              }}
                            >
                              Aprobar
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip title={`Rechazar factura ${factura.numero_factura}`} {...tooltipProps}>
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => handleOpenRejection(factura)}
                              disabled={actionLoading}
                              sx={{
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 12px #f4433660',
                                  bgcolor: '#f4433608',
                                },
                                '&:active': {
                                  transform: 'translateY(0)',
                                },
                              }}
                            >
                              Rechazar
                            </Button>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={filteredFacturas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{
            borderTop: `1px solid ${zentriaColors.cinza}`,
            '& .MuiTablePagination-toolbar': {
              px: 2,
            },
          }}
        />
      </Card>

      {/* Menú de Exportación */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <TableChart sx={{ color: zentriaColors.verde.main }} />
          </ListItemIcon>
          <ListItemText>Exportar a Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <ListItemIcon>
            <PictureAsPdf sx={{ color: zentriaColors.naranja.main }} />
          </ListItemIcon>
          <ListItemText>Exportar a PDF</ListItemText>
        </MenuItem>
      </Menu>

      {/* Modales y Diálogos */}
      <FacturaDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        workflow={selectedWorkflow}
        contextoHistorico={selectedWorkflow?.contexto_historico}
      />

      <ApprovalDialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        onConfirm={handleApprove}
        facturaNumero={selectedWorkflow?.factura?.numero_factura || selectedWorkflow?.numero_factura || ''}
        workflow={selectedWorkflow}
        loading={actionLoading}
      />

      <RejectionDialog
        open={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        onConfirm={handleReject}
        facturaNumero={selectedWorkflow?.factura?.numero_factura || selectedWorkflow?.numero_factura || ''}
        workflow={selectedWorkflow}
        loading={actionLoading}
      />
    </Box>
  );
}

export default FacturasPage;
