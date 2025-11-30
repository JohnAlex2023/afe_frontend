import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Card,
} from '@mui/material';
import {
  Refresh,
  PictureAsPdf,
  CheckCircle,
  Assessment,
  VerifiedUser,
  ReplyAll,
  Close,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNotification } from '../../components/Notifications/NotificationProvider';
import { zentriaColors } from '../../theme/colors';

// Importar axios directamente si api no está disponible
import axios from 'axios';

/**
 * Página PROFESIONAL para Contador: Validación de Facturas
 *
 * RESPONSABILIDAD ÚNICA: Validar facturas aprobadas para Tesorería
 * - Ver facturas en estado: aprobada / aprobada_auto
 * - Validar factura → estado: validada_contabilidad (OK para Tesorería)
 * - Devolver factura → estado: devuelta_contabilidad (requiere corrección)
 *
 * NO TOCA: Pagos, Tesorería, Contabilización
 *
 * REFACTORIZADO: 2025-11-29 (Eliminado módulo de pagos completamente)
 */
interface ContadorFactura {
  id: number;
  numero_factura: string;
  estado: string;
  proveedor: {
    nit: string;
    razon_social: string;
  };
  subtotal: number;
  iva: number;
  total_a_pagar: number;
  aprobado_por_workflow?: string;
  tipo_aprobacion_workflow?: string;
  fecha_aprobacion_workflow?: string;
  usuario?: {
    nombre: string;
    email: string;
  };
}

interface StatsData {
  total_pendiente: number;
  monto_pendiente: number;
  validadas_hoy: number;
}

function FacturasPendientesPage() {
  const { showNotification } = useNotification();

  // Estado de datos
  const [facturas, setFacturas] = useState<ContadorFactura[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales
  const [validacionModalOpen, setValidacionModalOpen] = useState(false);
  const [devolucionModalOpen, setDevolucionModalOpen] = useState(false);
  const [detallesModalOpen, setDetallesModalOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<ContadorFactura | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para formularios
  const [validacionObs, setValidacionObs] = useState('');
  const [devolucionObs, setDevolucionObs] = useState('');
  const [notificarResponsable, setNotificarResponsable] = useState(true);

  // Cargar facturas aprobadas pendientes de validación
  const loadFacturas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/accounting/facturas/por-revisar', {
        params: { pagina: 1, limit: 100, solo_pendientes: true }
      });
      setFacturas(response.data.facturas);
      setStats(response.data.estadisticas);
    } catch (err: any) {
      console.error('Error cargando facturas:', err);
      setError(
        err.response?.data?.detail ||
          'Error al cargar facturas pendientes de validación'
      );
      showNotification('Error al cargar facturas pendientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Validar factura (aprobada → validada_contabilidad)
  const handleValidarFactura = async () => {
    if (!selectedFactura) return;

    setActionLoading(true);
    try {
      await axios.post(`/api/v1/accounting/facturas/${selectedFactura.id}/validar`, {
        observaciones: validacionObs || undefined
      });

      showNotification(`Factura ${selectedFactura.numero_factura} validada exitosamente. Lista para Tesorería.`, 'success');

      // Remover factura de la tabla
      setFacturas(facturas.filter(f => f.id !== selectedFactura.id));
      // Actualizar estadísticas
      if (stats) {
        setStats({
          ...stats,
          total_pendiente: stats.total_pendiente - 1,
          validadas_hoy: stats.validadas_hoy + 1
        });
      }

      // Cerrar modal
      setValidacionModalOpen(false);
      setSelectedFactura(null);
      setValidacionObs('');
    } catch (err: any) {
      console.error('Error validando factura:', err);
      showNotification(err.response?.data?.detail || 'Error al validar factura', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Devolver factura (aprobada → devuelta_contabilidad)
  const handleDevolverFactura = async () => {
    if (!selectedFactura || !devolucionObs.trim()) {
      showNotification('Debe especificar observaciones para devolver la factura', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      await axios.post(`/api/v1/accounting/facturas/${selectedFactura.id}/devolver`, {
        observaciones: devolucionObs,
        notificar_responsable: notificarResponsable
      });

      showNotification(`Factura ${selectedFactura.numero_factura} devuelta. Responsable ha sido notificado.`, 'success');

      // Remover factura de la tabla
      setFacturas(facturas.filter(f => f.id !== selectedFactura.id));
      // Actualizar estadísticas
      if (stats) {
        setStats({
          ...stats,
          total_pendiente: stats.total_pendiente - 1
        });
      }

      // Cerrar modal
      setDevolucionModalOpen(false);
      setSelectedFactura(null);
      setDevolucionObs('');
      setNotificarResponsable(true);
    } catch (err: any) {
      console.error('Error devolviendo factura:', err);
      showNotification(err.response?.data?.detail || 'Error al devolver factura', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadFacturas();
  }, []);

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Esta función ya no es necesaria - usamos el modal de detalles en su lugar
  // Mantiene compatibilidad si se necesita en el futuro

  // Chip para tipo de aprobación
  const getTipoAprobacionChip = (tipo?: string) => {
    if (tipo === 'automatica') {
      return (
        <Chip
          label="Automática"
          size="small"
          sx={{
            backgroundColor: zentriaColors.verde.light,
            color: zentriaColors.verde.dark,
            fontWeight: 600
          }}
        />
      );
    }
    return (
      <Chip
        label="Manual"
        size="small"
        sx={{
          backgroundColor: zentriaColors.naranja.light,
          color: zentriaColors.naranja.dark,
          fontWeight: 600
        }}
      />
    );
  };

  // Abrir modal de validación
  const handleAbrirValidacion = (factura: ContadorFactura) => {
    setSelectedFactura(factura);
    setValidacionObs('');
    setValidacionModalOpen(true);
  };

  // Abrir modal de devolución
  const handleAbrirDevolucion = (factura: ContadorFactura) => {
    setSelectedFactura(factura);
    setDevolucionObs('');
    setNotificarResponsable(true);
    setDevolucionModalOpen(true);
  };

  // Abrir modal de detalles
  const handleAbrirDetalles = (factura: ContadorFactura) => {
    setSelectedFactura(factura);
    setDetallesModalOpen(true);
  };

  return (
    <Box>
      {/* HEADER PROFESIONAL */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${zentriaColors.violeta.main} 0%, ${zentriaColors.violeta.dark} 100%)`,
          color: 'white',
          p: 4,
          borderRadius: 2,
          mb: 3,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <VerifiedUser sx={{ fontSize: 40 }} />
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700}>
              Validación de Facturas
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Revisa y valida facturas aprobadas. Solo facturas validadas llegan a Tesorería.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ESTADÍSTICAS */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', boxShadow: 1 }}>
              <Typography variant="h6" fontWeight={700} color="primary">
                {stats.total_pendiente}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendientes de Validar
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', boxShadow: 1 }}>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {formatCurrency(stats.monto_pendiente)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monto Total
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', boxShadow: 1 }}>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {stats.validadas_hoy}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Validadas Hoy
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* TOOLBAR */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          {facturas.length === 0
            ? 'No hay facturas pendientes'
            : `${facturas.length} factura${facturas.length !== 1 ? 's' : ''} por validar`}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadFacturas}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {/* CONTENIDO PRINCIPAL */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : facturas.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: 2,
          }}
        >
          <CheckCircle sx={{ fontSize: 80, color: zentriaColors.verde.main, mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            ¡Todo validado!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay facturas pendientes de validación en este momento
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 700 }}>Factura</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Proveedor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>NIT</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Monto
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Aprobada por</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facturas.map((factura) => (
                <TableRow
                  key={factura.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ cursor: 'pointer', color: zentriaColors.violeta.main }}
                      onClick={() => handleAbrirDetalles(factura)}
                    >
                      {factura.numero_factura}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {factura.proveedor?.razon_social || 'Sin proveedor'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{factura.proveedor?.nit || '-'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(factura.total_a_pagar)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {factura.aprobado_por_workflow || 'Sistema'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getTipoAprobacionChip(factura.tipo_aprobacion_workflow)}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Validar factura">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleAbrirValidacion(factura)}
                        >
                          <VerifiedUser />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Devolver factura">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleAbrirDevolucion(factura)}
                        >
                          <ReplyAll />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleAbrirDetalles(factura)}
                        >
                          <Assessment />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* MODAL: VALIDACIÓN */}
      <Dialog open={validacionModalOpen} onClose={() => setValidacionModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedUser color="success" />
            Validar Factura
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFactura && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {selectedFactura.numero_factura}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedFactura.proveedor?.razon_social}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="primary" sx={{ mt: 1 }}>
                  {formatCurrency(selectedFactura.total_a_pagar)}
                </Typography>
              </Box>

              <TextField
                label="Observaciones (opcional)"
                multiline
                rows={4}
                value={validacionObs}
                onChange={(e) => setValidacionObs(e.target.value)}
                fullWidth
                placeholder="Ej: Verificada contra registros contables..."
                variant="outlined"
              />

              <Alert severity="info" sx={{ mt: 3 }}>
                La factura pasará a estado <strong>validada_contabilidad</strong> y estará lista para Tesorería.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidacionModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleValidarFactura}
            variant="contained"
            color="success"
            disabled={actionLoading}
          >
            {actionLoading ? 'Validando...' : 'Validar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: DEVOLUCIÓN */}
      <Dialog open={devolucionModalOpen} onClose={() => setDevolucionModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReplyAll color="error" />
            Devolver Factura
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFactura && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {selectedFactura.numero_factura}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedFactura.proveedor?.razon_social}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="primary" sx={{ mt: 1 }}>
                  {formatCurrency(selectedFactura.total_a_pagar)}
                </Typography>
              </Box>

              <TextField
                label="Observaciones (requerido)"
                multiline
                rows={4}
                value={devolucionObs}
                onChange={(e) => setDevolucionObs(e.target.value)}
                fullWidth
                placeholder="Ej: Falta especificar centro de costos..."
                variant="outlined"
                error={devolucionObs.length > 0 && devolucionObs.length < 10}
                helperText={devolucionObs.length > 0 && devolucionObs.length < 10 ? 'Mínimo 10 caracteres' : ''}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={notificarResponsable}
                    onChange={(e) => setNotificarResponsable(e.target.checked)}
                  />
                }
                label="Notificar al Responsable que aprobó"
                sx={{ mt: 2 }}
              />

              <Alert severity="warning" sx={{ mt: 3 }}>
                La factura volverá a estado <strong>en_revision</strong> para que el Responsable la corrija.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDevolucionModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleDevolverFactura}
            variant="contained"
            color="error"
            disabled={actionLoading || !devolucionObs.trim() || devolucionObs.length < 10}
          >
            {actionLoading ? 'Devolviendo...' : 'Devolver'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: DETALLES */}
      <Dialog open={detallesModalOpen} onClose={() => setDetallesModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Detalles de Factura
          <IconButton onClick={() => setDetallesModalOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedFactura && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Información General
              </Typography>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Factura:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedFactura.numero_factura}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Proveedor:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedFactura.proveedor?.razon_social}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">NIT:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedFactura.proveedor?.nit}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Montos
              </Typography>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(selectedFactura.subtotal)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">IVA:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(selectedFactura.iva)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #ddd' }}>
                  <Typography variant="body2" fontWeight={600}>
                    TOTAL:
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="primary">
                    {formatCurrency(selectedFactura.total_a_pagar)}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Aprobación
              </Typography>
              <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Aprobada por:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {selectedFactura.aprobado_por_workflow || 'Sistema'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Tipo:</Typography>
                  {getTipoAprobacionChip(selectedFactura.tipo_aprobacion_workflow)}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default FacturasPendientesPage;
