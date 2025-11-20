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
} from '@mui/material';
import {
  Refresh,
  PictureAsPdf,
  CheckCircle,
  Assessment,
} from '@mui/icons-material';
import { facturasService, type FacturaPendiente } from './services/facturas.service';
import { zentriaColors } from '../../theme/colors';

/**
 * Página exclusiva para contadores: lista de facturas aprobadas pendientes de procesar
 *
 * Esta página muestra todas las facturas que fueron aprobadas (manual o automáticamente)
 * y están listas para que contabilidad las procese.
 *
 * NUEVO 2025-11-18
 */
function FacturasPendientesPage() {
  const [facturas, setFacturas] = useState<FacturaPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFacturas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await facturasService.getFacturasPendientes();
      setFacturas(response.facturas);
    } catch (err: any) {
      console.error('Error cargando facturas pendientes:', err);
      setError(
        err.response?.data?.detail ||
          'Error al cargar las facturas pendientes. Por favor intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacturas();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleVerPDF = async (facturaId: number) => {
    try {
      await facturasService.openPdfInNewTab(facturaId, false);
    } catch (error) {
      console.error('Error abriendo PDF:', error);
      setError('Error al abrir el PDF. Por favor intente nuevamente.');
    }
  };

  const getEstadoChip = (estado: string) => {
    if (estado === 'aprobada_auto') {
      return (
        <Chip
          label="Aprobada Automática"
          color="success"
          size="small"
          icon={<CheckCircle />}
          sx={{ fontWeight: 600 }}
        />
      );
    }
    return (
      <Chip
        label="Aprobada Manual"
        color="info"
        size="small"
        icon={<CheckCircle />}
        sx={{ fontWeight: 600 }}
      />
    );
  };

  return (
    <Box>
      {/* Header */}
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
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <Assessment sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Facturas Pendientes
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Facturas aprobadas listas para procesar por contabilidad
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Toolbar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          {facturas.length === 0
            ? 'No hay facturas pendientes'
            : `${facturas.length} factura${facturas.length !== 1 ? 's' : ''} pendiente${facturas.length !== 1 ? 's' : ''}`}
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

      {/* Content */}
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
            ¡Todo al día!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay facturas aprobadas pendientes de procesar en este momento
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 700 }}>Número</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Proveedor</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Monto
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha Emisión</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
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
                    <Typography variant="body2" fontWeight={600}>
                      {factura.numero_factura}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {factura.proveedor || 'Sin proveedor'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {formatCurrency(factura.monto)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(factura.fecha_emision)}
                    </Typography>
                  </TableCell>
                  <TableCell>{getEstadoChip(factura.estado)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver PDF Original">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleVerPDF(factura.id)}
                      >
                        <PictureAsPdf />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default FacturasPendientesPage;
