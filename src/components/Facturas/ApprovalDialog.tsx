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
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { zentriaColors } from '../../theme/colors';

interface ApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (observaciones: string) => Promise<void>;
  facturaNumero: string;
  loading?: boolean;
}

/**
 * Diálogo de confirmación para aprobar facturas
 * Permite agregar observaciones opcionales
 */
function ApprovalDialog({ open, onClose, onConfirm, facturaNumero, loading = false }: ApprovalDialogProps) {
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');

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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
