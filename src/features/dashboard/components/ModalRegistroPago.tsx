/**
 * ModalRegistroPago - Modal para registrar pagos
 *
 * Componente modal profesional para registro de pagos de facturas.
 * Valida datos, maneja errores y muestra confirmación de éxito.
 *
 * Funcionalidades:
 * - Formulario con campos: monto, referencia, método de pago
 * - Validación client-side y server-side
 * - Prevención de referencias duplicadas
 * - Mensaje de error detallado
 * - Toast de éxito
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Typography,
  FormHelperText,
  Paper
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PagoRequest, MetodoPago } from '../../../types/payment.types';
import usePayment from './usePayment';

// Zod schema para validación
const PagoSchema = z.object({
  monto_pagado: z
    .string()
    .min(1, 'El monto es requerido')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'El monto debe ser mayor a 0'
    ),
  referencia_pago: z
    .string()
    .min(3, 'La referencia debe tener al menos 3 caracteres')
    .max(100, 'La referencia no puede exceder 100 caracteres')
    .regex(
      /^[A-Z0-9\-_]+$/i,
      'Solo letras, números, guiones y guiones bajos'
    ),
  metodo_pago: z.string().optional()
});

type PagoFormData = z.infer<typeof PagoSchema>;

interface ModalRegistroPagoProps {
  isOpen: boolean;
  onClose: () => void;
  facturaId: number;
  facturaNumero?: string;
  totalFactura: string;
  totalPagado: string;
  pendientePagar: string;
  factura?: Factura;
  onPagoSuccess?: (mensaje?: string) => void | Promise<void>;
  onError?: (error: string) => void;
}

export const ModalRegistroPago: React.FC<ModalRegistroPagoProps> = ({
  isOpen,
  onClose,
  facturaId,
  facturaNumero,
  totalFactura,
  totalPagado,
  pendientePagar,
  factura,
  onPagoSuccess,
  onError
}) => {
  const { registrarPago, isLoading, error, limpiarError } = usePayment();
  const [serverError, setServerError] = useState<string | null>(null);
  const [validandoReferencia, setValidandoReferencia] = useState(false);
  const [referenciaExiste, setReferenciaExiste] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    watch,
    setError: setFormError
  } = useForm<PagoFormData>({
    resolver: zodResolver(PagoSchema),
    defaultValues: {
      monto_pagado: '',
      referencia_pago: '',
      metodo_pago: MetodoPago.TRANSFERENCIA
    }
  });

  const montoIngresado = watch('monto_pagado');
  const referenciaIngresada = watch('referencia_pago');

  // Validar que el monto no exceda el pendiente
  useEffect(() => {
    if (montoIngresado) {
      const monto = parseFloat(montoIngresado);
      const pendiente = parseFloat(pendientePagar);

      if (monto > pendiente) {
        setFormError('monto_pagado', {
          type: 'custom',
          message: `El monto no puede exceder el pendiente de $${pendientePagar}`
        });
      }
    }
  }, [montoIngresado, pendientePagar, setFormError]);

  // Validar referencia única
  useEffect(() => {
    if (referenciaIngresada && referenciaIngresada.length >= 3) {
      // Aquí se podría hacer validación async si el backend lo permite
      // Por ahora solo validamos formato
      setReferenciaExiste(false);
    }
  }, [referenciaIngresada]);

  const onSubmit = async (data: PagoFormData) => {
    setServerError(null);

    try {
      const pagoRequest: PagoRequest = {
        monto_pagado: parseFloat(data.monto_pagado),
        referencia_pago: data.referencia_pago.toUpperCase(),
        metodo_pago: data.metodo_pago || 'otro'
      };

      await registrarPago(facturaId, pagoRequest);

      // Éxito - Ejecutar callback
      const successMessage = `Pago de $${data.monto_pagado} registrado exitosamente. Referencia: ${data.referencia_pago.toUpperCase()}`;

      // Soportar callbacks asincronos (para refresh de datos)
      const result = onPagoSuccess?.(successMessage);
      if (result instanceof Promise) {
        await result;
      }

      reset();
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al registrar pago';
      setServerError(errorMsg);
      onError?.(errorMsg);
    }
  };

  const handleClose = () => {
    reset();
    setServerError(null);
    limpiarError();
    onClose();
  };

  // Calcular monto después del pago
  const montoPagoActual = parseFloat(montoIngresado) || 0;
  const montoTotalActual = parseFloat(totalPagado) + montoPagoActual;
  const pendienteActual = parseFloat(totalFactura) - montoTotalActual;

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 'bold' }}>
        Registrar Pago - Factura {facturaNumero}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Información de la factura */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }} elevation={0}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Factura
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {facturaNumero}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Total Factura
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ${totalFactura}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Ya Pagado
              </Typography>
              <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                ${totalPagado}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Pendiente
              </Typography>
              <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                ${pendientePagar}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Errores */}
        {(serverError || error) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError || error}
          </Alert>
        )}

        {/* Formulario */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* Monto Pagado */}
            <Grid item xs={12}>
              <Controller
                name="monto_pagado"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Monto a Pagar"
                    type="number"
                    fullWidth
                    variant="outlined"
                    placeholder="0.00"
                    inputProps={{
                      step: '0.01',
                      min: '0.01',
                      max: pendientePagar
                    }}
                    error={!!errors.monto_pagado}
                    helperText={errors.monto_pagado?.message}
                    disabled={isLoading}
                  />
                )}
              />
              {montoPagoActual > 0 && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  ✓ Después del pago: Pagado ${montoTotalActual.toFixed(2)} | Pendiente ${Math.max(pendienteActual, 0).toFixed(2)}
                </Typography>
              )}
            </Grid>

            {/* Referencia de Pago */}
            <Grid item xs={12}>
              <Controller
                name="referencia_pago"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Referencia de Pago"
                    fullWidth
                    variant="outlined"
                    placeholder="CHQ-001, TRF-ABC, etc."
                    error={!!errors.referencia_pago || referenciaExiste}
                    helperText={
                      errors.referencia_pago?.message ||
                      (referenciaExiste ? 'Esta referencia ya existe' : 'Ej: CHQ-001, TRF-ABC123')
                    }
                    disabled={isLoading}
                    inputProps={{
                      maxLength: 100,
                      style: { textTransform: 'uppercase' }
                    }}
                  />
                )}
              />
              {validandoReferencia && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption">Validando referencia...</Typography>
                </Box>
              )}
            </Grid>

            {/* Método de Pago */}
            <Grid item xs={12}>
              <Controller
                name="metodo_pago"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Método de Pago</InputLabel>
                    <Select
                      {...field}
                      label="Método de Pago"
                      disabled={isLoading}
                    >
                      <MenuItem value={MetodoPago.CHEQUE}>Cheque</MenuItem>
                      <MenuItem value={MetodoPago.TRANSFERENCIA}>Transferencia</MenuItem>
                      <MenuItem value={MetodoPago.EFECTIVO}>Efectivo</MenuItem>
                      <MenuItem value={MetodoPago.TARJETA}>Tarjeta</MenuItem>
                      <MenuItem value="otro">Otro</MenuItem>
                    </Select>
                    <FormHelperText>Selecciona el método de pago utilizado</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Información de ayuda */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="caption">
                  <strong>Importante:</strong> La referencia de pago debe ser única e identifica este pago de forma específica.
                  Ejemplos: CHQ-001 (cheque), TRF-ABC (transferencia), etc.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading || !!referenciaExiste}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Registrando...
            </>
          ) : (
            'Registrar Pago'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalRegistroPago;
