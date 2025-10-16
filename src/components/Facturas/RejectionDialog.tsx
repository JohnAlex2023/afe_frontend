import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { zentriaColors } from '../../theme/colors';
import type { Workflow } from '../../types/factura.types';

interface RejectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string, observaciones: string) => Promise<void>;
  facturaNumero: string;
  workflow?: Workflow | null;
  loading?: boolean;
}

/**
 * Diálogo de confirmación para rechazar facturas
 * Requiere motivo y permite agregar observaciones adicionales
 */
function RejectionDialog({ open, onClose, onConfirm, facturaNumero, workflow, loading = false }: RejectionDialogProps) {
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const motivosRechazo = [
    'Datos incorrectos o incompletos',
    'Monto no coincide con lo esperado',
    'Proveedor no autorizado',
    'Factura duplicada',
    'Fuera de presupuesto',
    'Sin orden de compra asociada',
    'Documentación faltante',
    'Otro (especificar en observaciones)',
  ];

  const handleConfirm = async () => {
    if (!motivo) {
      setError('Debe seleccionar un motivo de rechazo');
      return;
    }

    if (motivo === 'Otro (especificar en observaciones)' && !observaciones.trim()) {
      setError('Debe especificar el motivo en las observaciones');
      return;
    }

    setError('');
    try {
      await onConfirm(motivo, observaciones);
      setMotivo('');
      setObservaciones('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al rechazar la factura');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMotivo('');
      setObservaciones('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Cancel sx={{ color: zentriaColors.naranja.main }} />
          <Typography variant="h6" fontWeight={600}>
            Rechazar Factura
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={2}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Estás a punto de rechazar la factura <strong>{facturaNumero}</strong>
          </Alert>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            El rechazo debe estar justificado. Esta acción quedará registrada en el historial de auditoría.
          </Typography>
        </Box>

        {/* Información de la Factura */}
        {workflow?.factura && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Información de la Factura
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Proveedor:</TableCell>
                  <TableCell>{workflow.factura.proveedor?.razon_social || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>NIT:</TableCell>
                  <TableCell>{workflow.factura.proveedor?.nit || '-'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Subtotal:</TableCell>
                  <TableCell>{formatCurrency(workflow.factura.subtotal)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>IVA:</TableCell>
                  <TableCell>{formatCurrency(workflow.factura.iva)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Total a Pagar:</TableCell>
                  <TableCell>
                    <strong>{formatCurrency(workflow.factura.total_a_pagar)}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Motivo de Rechazo *</InputLabel>
          <Select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            label="Motivo de Rechazo *"
            disabled={loading}
          >
            {motivosRechazo.map((motivoOpcion) => (
              <MenuItem key={motivoOpcion} value={motivoOpcion}>
                {motivoOpcion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label={motivo === 'Otro (especificar en observaciones)' ? 'Especifique el motivo *' : 'Observaciones adicionales (opcional)'}
          placeholder="Agrega detalles sobre el rechazo..."
          multiline
          rows={4}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          disabled={loading}
          required={motivo === 'Otro (especificar en observaciones)'}
          sx={{ mt: 2 }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          * Campo obligatorio
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading || !motivo}
          variant="contained"
          color="error"
          startIcon={loading ? <CircularProgress size={16} /> : <Cancel />}
        >
          {loading ? 'Rechazando...' : 'Confirmar Rechazo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RejectionDialog;
