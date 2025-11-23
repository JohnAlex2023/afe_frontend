/**
 * HistorialPagosTab - Tab para ver historial de pagos
 * Muestra tabla con todos los pagos registrados
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Grid,
  Typography,
  Button,
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { zentriaColors } from '../../../theme/colors';
import paymentService from '../../../services/paymentService';
import { Pago } from '../../../types/payment.types';

interface HistorialPagosTabProps {
  pagoTrigger?: number;
}

export const HistorialPagosTab: React.FC<HistorialPagosTabProps> = ({ pagoTrigger = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarPagos();
  }, [pagoTrigger]);

  const cargarPagos = async () => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await paymentService.obtenerHistorialPagosCompleto();
      if (resultado.pagos && Array.isArray(resultado.pagos)) {
        setPagos(resultado.pagos);
      } else {
        setPagos([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial de pagos');
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Filtrar pagos por búsqueda
  const pagosFiltrados = pagos.filter((pago) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pago.numero_factura?.toLowerCase().includes(searchLower) ||
      pago.referencia_pago?.toLowerCase().includes(searchLower) ||
      pago.proveedor?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box>
      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Búsqueda y controles */}
      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="flex-end">
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            placeholder="Buscar por número de factura, referencia, o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={cargarPagos}
            disabled={loading}
            size="small"
          >
            Actualizar
          </Button>
        </Grid>
      </Grid>

      {/* Tabla de Pagos */}
      {pagosFiltrados.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700 }}>Factura</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Proveedor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Monto Pagado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Referencia</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Método</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagosFiltrados.map((pago) => (
                <TableRow key={pago.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{pago.numero_factura}</TableCell>
                  <TableCell>{pago.proveedor || '-'}</TableCell>
                  <TableCell sx={{ color: zentriaColors.verde.main, fontWeight: 600 }}>
                    ${typeof pago.monto_pagado === 'string' ? parseFloat(pago.monto_pagado).toLocaleString() : pago.monto_pagado.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {pago.referencia_pago}
                  </TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {pago.metodo_pago}
                  </TableCell>
                  <TableCell>
                    {new Date(pago.fecha_pago).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pago.estado_pago === 'completado' ? '✓ Completado' : pago.estado_pago}
                      color={pago.estado_pago === 'completado' ? 'success' : 'warning'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">
          No hay registros de pagos aún. Los pagos que registres aparecerán aquí.
        </Alert>
      )}
    </Box>
  );
};

export default HistorialPagosTab;
