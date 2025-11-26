import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Box,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { Business, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { zentriaColors } from '../../theme/colors';

/**
 * SedeSelector Component
 *
 * Diálogo para cambiar de sede post-login sin hacer logout
 *
 * Props:
 * - open: Si el diálogo debe estar visible
 * - sedes: Lista de sedes disponibles
 * - currentSedeId: ID de la sede actual
 * - onSelectSede: Callback cuando el usuario selecciona una sede
 * - onClose: Callback para cerrar el diálogo
 * - isLoading: Estado de carga
 * - error: Mensaje de error a mostrar
 */

export interface Sede {
  sede_id: number;
  nombre: string;
  empresa_id: number;
  empresa_nombre: string;
  codigo: string;
  ciudad?: string;
}

interface SedeSelectorProps {
  open: boolean;
  sedes: Sede[];
  currentSedeId: number | null;
  onSelectSede: (sedeId: number) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const SedeSelector = ({
  open,
  sedes,
  currentSedeId,
  onSelectSede,
  onClose,
  isLoading,
  error,
}: SedeSelectorProps) => {
  const [selectedSedeId, setSelectedSedeId] = useState<number | null>(null);

  const handleSelectSede = async () => {
    if (!selectedSedeId) return;

    try {
      await onSelectSede(selectedSedeId);
      onClose();
    } catch {
      // El error será mostrado en el diálogo
    }
  };

  const handleClose = () => {
    setSelectedSedeId(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: zentriaColors.bg.card,
          borderRadius: '12px',
          border: `1px solid ${zentriaColors.border.light}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: `${zentriaColors.primary}10`,
          borderBottom: `1px solid ${zentriaColors.border.light}`,
          fontWeight: 700,
          color: zentriaColors.text.primary,
        }}
      >
        Cambiar Sede
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Alert de error */}
        {error && (
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{
              mb: 2,
              backgroundColor: `${zentriaColors.status.error}15`,
              color: zentriaColors.status.error,
              border: `1px solid ${zentriaColors.status.error}40`,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Mensaje informativo */}
        <Typography variant="body2" sx={{ color: zentriaColors.text.secondary, mb: 2 }}>
          Selecciona la sede con la que deseas trabajar:
        </Typography>

        {/* Lista de sedes */}
        <List sx={{ width: '100%' }}>
          {sedes.map((sede) => (
            <ListItem
              key={sede.sede_id}
              disablePadding
              sx={{
                mb: 1,
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor:
                  selectedSedeId === sede.sede_id
                    ? `${zentriaColors.primary}15`
                    : zentriaColors.bg.input,
                border:
                  selectedSedeId === sede.sede_id
                    ? `2px solid ${zentriaColors.primary}`
                    : `1px solid ${zentriaColors.border.light}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor:
                    selectedSedeId === sede.sede_id
                      ? `${zentriaColors.primary}20`
                      : `${zentriaColors.primary}08`,
                  borderColor: zentriaColors.primary,
                },
              }}
            >
              <ListItemButton
                onClick={() => setSelectedSedeId(sede.sede_id)}
                disabled={isLoading}
                sx={{
                  p: 2,
                }}
              >
                {/* Icono */}
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      backgroundColor:
                        currentSedeId === sede.sede_id
                          ? `${zentriaColors.success}30`
                          : selectedSedeId === sede.sede_id
                            ? zentriaColors.primary
                            : zentriaColors.border.light,
                      color:
                        currentSedeId === sede.sede_id
                          ? zentriaColors.success
                          : selectedSedeId === sede.sede_id
                            ? '#fff'
                            : zentriaColors.text.secondary,
                    }}
                  >
                    {currentSedeId === sede.sede_id ? <CheckCircle /> : <Business />}
                  </Box>
                </ListItemIcon>

                {/* Información de la sede */}
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: zentriaColors.text.primary,
                        }}
                      >
                        {sede.nombre}
                      </Typography>
                      {currentSedeId === sede.sede_id && (
                        <Typography
                          variant="caption"
                          sx={{
                            backgroundColor: `${zentriaColors.success}20`,
                            color: zentriaColors.success,
                            px: 1,
                            py: 0.25,
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}
                        >
                          Actual
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" sx={{ color: zentriaColors.text.secondary }}>
                        {sede.empresa_nombre}
                      </Typography>
                      {sede.ciudad && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            color: zentriaColors.text.secondary,
                            mt: 0.25,
                          }}
                        >
                          {sede.ciudad}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Estado de carga */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: `1px solid ${zentriaColors.border.light}`,
          p: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            color: zentriaColors.text.secondary,
            textTransform: 'none',
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSelectSede}
          disabled={!selectedSedeId || isLoading || selectedSedeId === currentSedeId}
          variant="contained"
          sx={{
            backgroundColor: zentriaColors.primary,
            color: '#fff',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: zentriaColors.primary,
              boxShadow: `0 4px 12px ${zentriaColors.primary}40`,
            },
          }}
        >
          {isLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Cambiar Sede'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SedeSelector;
