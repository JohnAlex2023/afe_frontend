/**
 * RegistroPagoTab - Tab para registrar pagos
 * Aquí se usan los componentes existentes ModalRegistroPago y ModalHistorialPagos
 * Solo agregamos interfaz para seleccionar facturas aprobadas
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Autocomplete,
} from '@mui/material';
import { AddCircle } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { fetchFacturasPendientes } from '../../../features/facturas/facturasSlice';
import type { FacturaPendiente } from '../../../types/factura.types';
import { ModalRegistroPago } from '../../dashboard/components/ModalRegistroPago';

export const RegistroPagoTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { pendientes, loading, error } = useAppSelector((state) => state.facturas);

  // Estados locales
  const [selectedFactura, setSelectedFactura] = useState<FacturaPendiente | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Cargar facturas aprobadas
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFacturasPendientes(user.id));
    }
  }, [dispatch, user?.id]);

  // Filtrar solo facturas aprobadas
  const facturasAprobadas = pendientes.filter(
    (f) => f.estado === 'aprobada' || f.estado === 'aprobada_auto'
  );

  const handleOpenModal = (factura: FacturaPendiente) => {
    setSelectedFactura(factura);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFactura(null);
  };

  const handlePagoSuccess = async () => {
    handleCloseModal();
    // Refrescar lista de facturas
    if (user?.id) {
      dispatch(fetchFacturasPendientes(user.id));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {/* Información */}
      <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }} elevation={0}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            ℹ️ Cómo registrar un pago
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1. Selecciona una factura aprobada del listado
            <br />
            2. Ingresa el monto a pagar, referencia (CHQ-001, TRF-ABC, etc.)
            <br />
            3. Selecciona método de pago (Cheque, Transferencia, Efectivo, Tarjeta)
            <br />
            4. El estado se actualizará automáticamente si la factura queda completamente pagada
          </Typography>
        </CardContent>
      </Card>

      {/* Selector de Factura */}
      {facturasAprobadas.length > 0 ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              options={facturasAprobadas}
              getOptionLabel={(option) =>
                `${option.numero_factura} - ${option.proveedor} - $${option.monto.toLocaleString()}`
              }
              value={selectedFactura}
              onChange={(_, value) => setSelectedFactura(value)}
              renderInput={(params) => (
                <TextField {...params} label="Selecciona una factura aprobada" />
              )}
              noOptionsText="No hay facturas aprobadas disponibles"
            />
          </Grid>

          {selectedFactura && (
            <>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Número de Factura
                    </Typography>
                    <Typography variant="h6">{selectedFactura.numero_factura}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Monto
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#4caf50' }}>
                      ${selectedFactura.monto.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<AddCircle />}
                  onClick={() => handleOpenModal(selectedFactura)}
                  sx={{
                    background: `linear-gradient(135deg, #1976d2, #1565c0)`,
                    width: '100%',
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Registrar Pago para {selectedFactura.numero_factura}
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      ) : (
        <Alert severity="info">
          No hay facturas aprobadas disponibles para registrar pagos.
          <br />
          Las facturas aprobadas aparecerán aquí cuando estén listas para pago.
        </Alert>
      )}

      {/* Modal */}
      {selectedFactura && (
        <ModalRegistroPago
          isOpen={modalOpen}
          onClose={handleCloseModal}
          facturaId={selectedFactura.factura_id}
          facturaNumero={selectedFactura.numero_factura}
          totalFactura={selectedFactura.monto.toString()}
          totalPagado="0"
          pendientePagar={selectedFactura.monto.toString()}
          onPagoSuccess={handlePagoSuccess}
        />
      )}
    </Box>
  );
};

export default RegistroPagoTab;
