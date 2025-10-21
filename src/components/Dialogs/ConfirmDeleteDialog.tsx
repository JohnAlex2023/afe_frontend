/**
 * Professional confirmation dialog for delete actions
 * Shows a warning before deleting items with detailed information
 */

import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Stack,
  IconButton,
} from '@mui/material';
import { Close, Warning, Delete } from '@mui/icons-material';
import { zentriaColors } from '../../theme/colors';

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  itemName: string;
  itemDetails?: { label: string; value: string }[];
  warningMessage?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  title,
  itemName,
  itemDetails = [],
  warningMessage,
  onClose,
  onConfirm,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-modal="true"
      disableEnforceFocus
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      {/* Header con advertencia */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          color: 'white',
          p: 3,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: 'white',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <Close />
        </IconButton>

        <Stack direction="row" spacing={2} alignItems="center">
          <Warning sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Esta acción no se puede deshacer
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Alert severity="error" icon={<Warning />} sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ¿Estás seguro que deseas eliminar este elemento?
          </Typography>
          {warningMessage && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {warningMessage}
            </Typography>
          )}
        </Alert>

        {/* Detalles del item */}
        <Box
          sx={{
            p: 2,
            backgroundColor: '#f8f9fa',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
            ELEMENTO A ELIMINAR
          </Typography>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {itemName}
          </Typography>

          {itemDetails.length > 0 && (
            <Stack spacing={1} mt={2}>
              {itemDetails.map((detail, index) => (
                <Box key={index}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {detail.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {detail.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Nota:</strong> Esta acción eliminará permanentemente el registro de la base de datos.
            Todos los datos asociados se perderán.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa', gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          disabled={loading}
          sx={{
            minWidth: 120,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'text.secondary',
              backgroundColor: 'action.hover',
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          size="large"
          startIcon={loading ? undefined : <Delete />}
          sx={{
            minWidth: 120,
            background: 'linear-gradient(135deg, #f44336, #d32f2f)',
            boxShadow: '0 4px 14px rgba(244, 67, 54, 0.25)',
            fontWeight: 700,
            textTransform: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(244, 67, 54, 0.35)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&.Mui-disabled': {
              opacity: 0.5,
            },
          }}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
