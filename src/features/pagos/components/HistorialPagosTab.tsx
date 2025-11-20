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
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { zentriaColors } from '../../../theme/colors';

export const HistorialPagosTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Cargar historial de pagos desde API
    // dispatch(fetchHistorialPagos())
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Búsqueda */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
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
      </Grid>

      {/* Tabla de Pagos */}
      {pagos.length > 0 ? (
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
              {pagos.map((pago) => (
                <TableRow key={pago.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{pago.numero_factura}</TableCell>
                  <TableCell>{pago.proveedor}</TableCell>
                  <TableCell sx={{ color: zentriaColors.verde.main, fontWeight: 600 }}>
                    ${pago.monto_pagado.toLocaleString()}
                  </TableCell>
                  <TableCell>{pago.referencia_pago}</TableCell>
                  <TableCell>{pago.metodo_pago}</TableCell>
                  <TableCell>{new Date(pago.fecha_pago).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={pago.estado === 'completado' ? 'Completado' : 'Pendiente'}
                      color={pago.estado === 'completado' ? 'success' : 'warning'}
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
