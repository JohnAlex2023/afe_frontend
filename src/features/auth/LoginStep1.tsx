import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Fade,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person, Error as ErrorIcon } from '@mui/icons-material';
import { zentriaColors } from '../../theme/colors';

/**
 * LoginStep1 Component
 *
 * PASO 1: Validar credenciales y retornar sedes disponibles
 *
 * Props:
 * - onSubmit: Callback cuando el usuario envía credenciales
 * - isLoading: Estado de carga
 * - error: Mensaje de error a mostrar
 * - onErrorClear: Callback para limpiar error
 */

interface LoginStep1Props {
  onSubmit: (usuario: string, password: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
  onErrorClear?: () => void;
}

export const LoginStep1 = ({
  onSubmit,
  isLoading,
  error,
  onErrorClear,
}: LoginStep1Props) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usuarioError, setUsuarioError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUsuarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsuario(value);
    if (usuarioError && value.trim()) {
      setUsuarioError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError && value.trim()) {
      setPasswordError('');
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!usuario.trim()) {
      setUsuarioError('El usuario es requerido');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    }

    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpiar error anterior
    if (onErrorClear) {
      onErrorClear();
    }

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(usuario, password);
    } catch {
      // El error será mostrado en el componente padre
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${zentriaColors.bg.primary}99 0%, ${zentriaColors.bg.card}99 100%)`,
          border: `1px solid ${zentriaColors.border.light}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          maxWidth: '450px',
          mx: 'auto',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Encabezado */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: zentriaColors.text.primary,
                mb: 1,
              }}
            >
              Iniciar Sesión
            </Typography>
            <Typography variant="body2" sx={{ color: zentriaColors.text.secondary }}>
              Ingresa tus credenciales para continuar
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

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Campo Usuario */}
            <TextField
              label="Usuario"
              type="text"
              fullWidth
              value={usuario}
              onChange={handleUsuarioChange}
              disabled={isLoading}
              error={!!usuarioError}
              helperText={usuarioError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person
                      sx={{
                        color: zentriaColors.text.secondary,
                        fontSize: '1.25rem',
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: zentriaColors.bg.input,
                  borderColor: zentriaColors.border.light,
                  '&:hover fieldset': {
                    borderColor: zentriaColors.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: zentriaColors.primary,
                  },
                },
                '& .MuiInputBase-input': {
                  color: zentriaColors.text.primary,
                },
              }}
              autoComplete="username"
            />

            {/* Campo Contraseña */}
            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock
                      sx={{
                        color: zentriaColors.text.secondary,
                        fontSize: '1.25rem',
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLoading}
                      sx={{
                        color: zentriaColors.text.secondary,
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: zentriaColors.bg.input,
                  borderColor: zentriaColors.border.light,
                  '&:hover fieldset': {
                    borderColor: zentriaColors.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: zentriaColors.primary,
                  },
                },
                '& .MuiInputBase-input': {
                  color: zentriaColors.text.primary,
                },
              }}
              autoComplete="current-password"
            />

            {/* Botón Continuar */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !usuario.trim() || !password.trim()}
              sx={{
                mt: 2,
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
                  Validando...
                </Box>
              ) : (
                'Continuar'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default LoginStep1;
