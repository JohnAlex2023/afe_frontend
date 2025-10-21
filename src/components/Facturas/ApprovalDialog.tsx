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
  Table,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { zentriaColors } from '../../theme/colors';
import type { Workflow } from '../../types/factura.types';

interface ApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (observaciones: string) => Promise<void>;
  facturaNumero: string;
  workflow?: Workflow | null;
  loading?: boolean;
}

/**
 * Diálogo de confirmación para aprobar facturas
 * Permite agregar observaciones opcionales
 */
function ApprovalDialog({ open, onClose, onConfirm, facturaNumero, workflow, loading = false }: ApprovalDialogProps) {
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

  const handleConfirm = async () => {
    setError('');
    try {
      await onConfirm(observaciones);
      setObservaciones('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al aprobar la factura');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setObservaciones('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth aria-modal="true" disableEnforceFocus>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CheckCircle sx={{ color: zentriaColors.verde.main }} />
          <Typography variant="h6" fontWeight={600}>
            Aprobar Factura
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={2}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Estás a punto de aprobar la factura <strong>{facturaNumero}</strong>
          </Alert>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Al aprobar esta factura, el workflow avanzará automáticamente según las reglas configuradas.
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

        <TextField
          fullWidth
          label="Observaciones (opcional)"
          placeholder="Agrega cualquier comentario o nota sobre esta aprobación..."
          multiline
          rows={4}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          disabled={loading}
          sx={{ mt: 2 }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Las observaciones quedarán registradas en el historial de auditoría
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          color="success"
          startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}
        >
          {loading ? 'Aprobando...' : 'Confirmar Aprobación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ApprovalDialog;
