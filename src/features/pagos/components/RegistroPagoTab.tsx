/**
 * RegistroPagoTab - Tab para registrar pagos
 * Interfaz simplificada que dirige al usuario a Facturas Pendientes
 */

import React from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  Paper,
} from '@mui/material';
import { AddCircle, ArrowForward, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { zentriaColors } from '../../../theme/colors';

interface RegistroPagoTabProps {
  onPagoRegistrado?: () => void;
}

export const RegistroPagoTab: React.FC<RegistroPagoTabProps> = ({ onPagoRegistrado }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          maxWidth: 600,
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%)',
        }}
      >
        {/* Icono */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: `${zentriaColors.violeta.main}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <AddCircle
              sx={{
                fontSize: 80,
                color: zentriaColors.violeta.main,
              }}
            />
          </Box>
        </Box>

        {/* Título */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: zentriaColors.violeta.main }}>
          Registrar Pagos
        </Typography>

        {/* Descripción */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          Para registrar un pago, dirígete a <strong>Facturas Pendientes</strong> donde podrás:
        </Typography>

        {/* Pasos */}
        <Stack spacing={2} sx={{ mb: 4, textAlign: 'left' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <CheckCircle sx={{ color: zentriaColors.verde.main, flexShrink: 0, mt: 0.5 }} />
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Ver todas las facturas aprobadas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Listado completo de facturas listas para pagar
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <CheckCircle sx={{ color: zentriaColors.verde.main, flexShrink: 0, mt: 0.5 }} />
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Seleccionar una factura y registrar el pago
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ingresa monto, método y otros detalles
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <CheckCircle sx={{ color: zentriaColors.verde.main, flexShrink: 0, mt: 0.5 }} />
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Confirmación automática de estado
              </Typography>
              <Typography variant="caption" color="text.secondary">
                El estado se actualiza automáticamente en todo el sistema
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* Botón de acción */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          endIcon={<ArrowForward />}
          onClick={() => navigate('/facturas-pendientes')}
          sx={{
            background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.violeta.dark})`,
            py: 1.5,
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            },
          }}
        >
          Ir a Facturas Pendientes
        </Button>
      </Paper>
    </Box>
  );
};

export default RegistroPagoTab;
