import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Fade,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Divider,
} from '@mui/material';
import {
  Business,
  Location,
  Error as ErrorIcon,
  CheckCircle,
  ArrowBack,
} from '@mui/icons-material';
import { zentriaColors } from '../../theme/colors';

/**
 * LoginStep2 Component
 *
 * PASO 2: Seleccionar sede de entre las disponibles
 *
 * Props:
 * - usuarioNombre: Nombre del usuario que se va a autenticar
 * - sedes: Lista de sedes disponibles
 * - onSubmit: Callback cuando el usuario selecciona una sede
 * - onBack: Callback para volver al PASO 1
 * - isLoading: Estado de carga
 * - error: Mensaje de error a mostrar
 * - onErrorClear: Callback para limpiar error
 */

export interface Sede {
  sede_id: number;
  nombre: string;
  empresa_id: number;
  empresa_nombre: string;
  codigo: string;
  ciudad?: string;
}

interface LoginStep2Props {
  usuarioNombre: string;
  sedes: Sede[];
  onSubmit: (sedeId: number) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error?: string | null;
  onErrorClear?: () => void;
}

export const LoginStep2 = ({
  usuarioNombre,
  sedes,
  onSubmit,
  onBack,
  isLoading,
  error,
  onErrorClear,
}: LoginStep2Props) => {
  const [selectedSedeId, setSelectedSedeId] = useState<number | null>(
    sedes.length === 1 ? sedes[0].sede_id : null
  );

  const handleSubmit = async () => {
    // Limpiar error anterior
    if (onErrorClear) {
      onErrorClear();
    }

    if (!selectedSedeId) {
      return;
    }

    try {
      await onSubmit(selectedSedeId);
    } catch {
      // El error será mostrado en el componente padre
    }
  };

  const selectedSede = sedes.find((s) => s.sede_id === selectedSedeId);

  return (
    <Fade in={true} timeout={800}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${zentriaColors.bg.primary}99 0%, ${zentriaColors.bg.card}99 100%)`,
          border: `1px solid ${zentriaColors.border.light}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          maxWidth: '500px',
          mx: 'auto',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Encabezado */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: zentriaColors.text.primary,
                mb: 0.5,
              }}
            >
              Seleccionar Sede
            </Typography>
            <Typography variant="body2" sx={{ color: zentriaColors.text.secondary }}>
              Bienvenido {usuarioNombre}. Selecciona la sede con la que deseas trabajar
            </Typography>
          </Box>

          {/* Alert de error */}
          {error && (
            <Fade in={true}>
              <Alert
                severity="error"
                icon={<ErrorIcon />}
                sx={{
                  mb: 3,
                  backgroundColor: `${zentriaColors.status.error}15`,
                  color: zentriaColors.status.error,
                  border: `1px solid ${zentriaColors.status.error}40`,
                  borderRadius: '8px',
                  '& .MuiAlert-icon': {
                    color: zentriaColors.status.error,
                  },
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Lista de sedes */}
          <Box sx={{ mb: 4 }}>
            <RadioGroup
              value={selectedSedeId?.toString() || ''}
              onChange={(e) => setSelectedSedeId(parseInt(e.target.value, 10))}
            >
              <Stack spacing={2}>
                {sedes.map((sede) => (
                  <FormControlLabel
                    key={sede.sede_id}
                    value={sede.sede_id.toString()}
                    control={
                      <Radio
                        disabled={isLoading}
                        sx={{
                          color: zentriaColors.text.secondary,
                          '&.Mui-checked': {
                            color: zentriaColors.primary,
                          },
                        }}
                      />
                    }
                    label={
                      <Paper
                        sx={{
                          p: 2,
                          flex: 1,
                          backgroundColor:
                            selectedSedeId === sede.sede_id
                              ? `${zentriaColors.primary}15`
                              : zentriaColors.bg.input,
                          border:
                            selectedSedeId === sede.sede_id
                              ? `2px solid ${zentriaColors.primary}`
                              : `1px solid ${zentriaColors.border.light}`,
                          borderRadius: '8px',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: zentriaColors.primary,
                            boxShadow: `0 4px 12px ${zentriaColors.primary}20`,
                          },
                          width: '100%',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 2,
                            width: '100%',
                          }}
                        >
                          {/* Icono */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: '8px',
                              backgroundColor:
                                selectedSedeId === sede.sede_id
                                  ? zentriaColors.primary
                                  : zentriaColors.border.light,
                              color:
                                selectedSedeId === sede.sede_id
                                  ? '#fff'
                                  : zentriaColors.text.secondary,
                            }}
                          >
                            <Business />
                          </Box>

                          {/* Información de la sede */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: zentriaColors.text.primary,
                              }}
                            >
                              {sede.nombre}
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                color: zentriaColors.text.secondary,
                                display: 'block',
                                mt: 0.5,
                              }}
                            >
                              Empresa: {sede.empresa_nombre}
                            </Typography>

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mt: 0.5,
                              }}
                            >
                              <Location
                                sx={{
                                  fontSize: '0.875rem',
                                  color: zentriaColors.text.secondary,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: zentriaColors.text.secondary }}
                              >
                                {sede.ciudad ? `${sede.ciudad}` : 'Ubicación no especificada'}
                              </Typography>
                            </Box>

                            <Typography
                              variant="caption"
                              sx={{
                                color: zentriaColors.text.secondary,
                                display: 'block',
                                mt: 0.5,
                                fontSize: '0.75rem',
                              }}
                            >
                              Código: {sede.codigo}
                            </Typography>
                          </Box>

                          {/* Checkmark si está seleccionada */}
                          {selectedSedeId === sede.sede_id && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <CheckCircle
                                sx={{
                                  color: zentriaColors.primary,
                                  fontSize: '1.5rem',
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    }
                    sx={{
                      m: 0,
                      width: '100%',
                      alignItems: 'flex-start',
                    }}
                  />
                ))}
              </Stack>
            </RadioGroup>
          </Box>

          {/* Información de la sede seleccionada */}
          {selectedSede && (
            <Fade in={!!selectedSede}>
              <Paper
                sx={{
                  p: 2,
                  mb: 4,
                  backgroundColor: `${zentriaColors.primary}10`,
                  border: `1px solid ${zentriaColors.primary}40`,
                  borderRadius: '8px',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: zentriaColors.text.primary,
                    fontWeight: 600,
                  }}
                >
                  Sede seleccionada:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: zentriaColors.text.secondary,
                    mt: 0.5,
                  }}
                >
                  {selectedSede.empresa_nombre} - {selectedSede.nombre}
                </Typography>
              </Paper>
            </Fade>
          )}

          <Divider sx={{ my: 3, borderColor: zentriaColors.border.light }} />

          {/* Botones de acción */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Botón Atrás */}
            <Button
              onClick={onBack}
              disabled={isLoading}
              startIcon={<ArrowBack />}
              sx={{
                flex: 1,
                py: 1.5,
                color: zentriaColors.text.primary,
                borderColor: zentriaColors.border.light,
                textTransform: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                '&:hover': {
                  borderColor: zentriaColors.primary,
                  backgroundColor: `${zentriaColors.primary}08`,
                },
              }}
              variant="outlined"
            >
              Atrás
            </Button>

            {/* Botón Continuar */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedSedeId}
              fullWidth
              variant="contained"
              sx={{
                py: 1.5,
                backgroundColor: zentriaColors.primary,
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: zentriaColors.primary,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${zentriaColors.primary}40`,
                },
                '&:disabled': {
                  backgroundColor: zentriaColors.border.light,
                  color: zentriaColors.text.secondary,
                },
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: '#fff' }} />
                  Iniciando sesión...
                </Box>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default LoginStep2;
