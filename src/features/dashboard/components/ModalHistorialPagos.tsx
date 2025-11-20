/**
 * ModalHistorialPagos - Modal para visualizar historial de pagos
 *
 * Componente modal que muestra el historial completo de pagos de una factura,
 * incluyendo detalles como fecha, monto, referencia, método y estado.
 *
 * Funcionalidades:
 * - Lista de pagos ordenados por fecha
 * - Resumen de montos pagados vs pendiente
 * - Información del contador que registró el pago
 * - Indicador visual si factura está completamente pagada
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { Pago, FacturaConPagos } from '../../../types/payment.types';
import usePayment from './usePayment';

interface ModalHistorialPagosProps {
  isOpen: boolean;
  onClose: () => void;
  factura: FacturaConPagos | null;
  facturaId: number;
}

const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const obtenerColorEstado = (estado: string): 'success' | 'error' | 'warning' | 'default' => {
  switch (estado) {
    case 'completado':
      return 'success';
    case 'fallido':
      return 'error';
    case 'cancelado':
      return 'warning';
    default:
      return 'default';
  }
};

export const ModalHistorialPagos: React.FC<ModalHistorialPagosProps> = ({
  isOpen,
  onClose,
  factura,
  facturaId
}) => {
  const { obtenerHistorial, isLoading, error } = usePayment();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState(false);

  // Cargar historial cuando se abre el modal
  useEffect(() => {
    if (isOpen && facturaId) {
      cargarHistorial();
    }
  }, [isOpen, facturaId]);

  const cargarHistorial = async () => {
    setCargando(true);
    try {
      const resultado = await obtenerHistorial(facturaId);
      setPagos(resultado);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setCargando(false);
    }
  };

  if (!factura) {
    return null;
  }

  const totalFactura = parseFloat(factura.total_calculado);
  const totalPagado = parseFloat(factura.total_pagado);
  const pendiente = parseFloat(factura.pendiente_pagar);
  const estaPagada = factura.esta_completamente_pagada;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 'bold' }}>
        Historial de Pagos - {factura.numero_factura}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Estado y Resumen */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: estaPagada ? '#e8f5e9' : '#fff3e0' }} elevation={0}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm="auto">
              {estaPagada ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 32 }} />
                  <Typography variant="h6" sx={{ color: '#2e7d32' }}>
                    Completamente Pagada
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PendingIcon sx={{ color: '#ff9800', fontSize: 32 }} />
                  <Typography variant="h6" sx={{ color: '#e65100' }}>
                    Pago Pendiente
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="textSecondary">
                Total Factura
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                ${totalFactura.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="textSecondary">
                Total Pagado
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#4caf50' }}
              >
                ${totalPagado.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="textSecondary">
                Pendiente
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#ff9800' }}
              >
                ${pendiente.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="textSecondary">
                % Pagado
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {totalFactura > 0 ? ((totalPagado / totalFactura) * 100).toFixed(1) : 0}%
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Errores */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabla de Pagos */}
        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : pagos.length === 0 ? (
          <Alert severity="info">
            No hay pagos registrados para esta factura
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Monto
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Referencia</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Método</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Procesado por</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagos.map((pago, index) => (
                  <TableRow key={pago.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                    <TableCell>{formatearFecha(pago.fecha_pago)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                      ${parseFloat(pago.monto_pagado).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {pago.referencia_pago}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {pago.metodo_pago}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pago.estado_pago}
                        size="small"
                        color={obtenerColorEstado(pago.estado_pago)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="textSecondary">
                        {pago.procesado_por}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Información adicional */}
        {pagos.length > 0 && (
          <Alert severity="success">
            <Typography variant="body2">
              {pagos.filter(p => p.estado_pago === 'completado').length} de {pagos.length} pagos completados
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalHistorialPagos;
