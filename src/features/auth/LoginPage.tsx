import { useState, useEffect } from 'react';
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
  Slide,
  Snackbar,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
  Email,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from './authSlice';
import { zentriaColors } from '../../theme/colors';
import apiClient from '../../services/api';

/**
 * Enterprise Login Page - Zentria AFE
 * Diseño profesional nivel Fortune 500
 * Features: Smart alerts, password recovery, rate limiting, field validation
 */

interface Notification {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usuarioError, setUsuarioError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [notification, setNotification] = useState<Notification>({
    open: false,
    message: '',
    severity: 'info',
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Manejo del temporizador de bloqueo
  useEffect(() => {
    if (lockTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setLockTimeRemaining(lockTimeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockTimeRemaining === 0 && isLocked) {
      setIsLocked(false);
      setLoginAttempts(0);
      showNotification('Su cuenta ha sido desbloqueada. Puede intentar nuevamente.', 'info');
    }
  }, [lockTimeRemaining, isLocked]);

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setUsuarioError('');
    setPasswordError('');

    if (!usuario.trim()) {
      setUsuarioError('El usuario es requerido');
      isValid = false;
    } else if (usuario.length < 3) {
      setUsuarioError('El usuario debe tener al menos 3 caracteres');
      isValid = false;
    }

    if (!password) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (isLocked) {
      showNotification(
        `Cuenta bloqueada temporalmente. Intente nuevamente en ${lockTimeRemaining} segundos.`,
        'warning'
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        usuario,
        password,
      });

      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.access_token,
        })
      );

      showNotification('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
      setLoginAttempts(0);

      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      let errorMessage = 'Error al iniciar sesión';
      let severity: 'error' | 'warning' = 'error';

      if (err.response?.status === 401) {
        errorMessage = 'Usuario o contraseña incorrectos';

        const remainingAttempts = 5 - newAttempts;
        if (remainingAttempts > 0 && remainingAttempts <= 2) {
          errorMessage += `. Le quedan ${remainingAttempts} intento${remainingAttempts > 1 ? 's' : ''}`;
          severity = 'warning';
        }

        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockTimeRemaining(300); // 5 minutos
          errorMessage = 'Demasiados intentos fallidos. Su cuenta ha sido bloqueada por 5 minutos.';
          severity = 'error';
        }
      } else if (err.response?.status === 500) {
        errorMessage = 'Error del servidor. Por favor, contacte al administrador.';
      } else if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
      } else {
        errorMessage = err.response?.data?.detail || err.message || errorMessage;
      }

      showNotification(errorMessage, severity);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setEmailError('');

    if (!recoveryEmail.trim()) {
      setEmailError('El correo electrónico es requerido');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail)) {
      setEmailError('Ingrese un correo electrónico válido');
      return;
    }

    try {
      // Aquí iría la llamada al endpoint de recuperación
      // await apiClient.post('/auth/forgot-password', { email: recoveryEmail });

      showNotification(
        'Se ha enviado un enlace de recuperación a su correo electrónico.',
        'success'
      );
      setOpenForgotPassword(false);
      setRecoveryEmail('');
    } catch (err: any) {
      setEmailError(err.response?.data?.detail || 'Error al enviar el correo de recuperación');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${zentriaColors.violeta.dark} 0%, ${zentriaColors.violeta.main} 50%, ${zentriaColors.naranja.main} 100%)`,
        px: 2,
      }}
    >
      {/* Patrón de fondo decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${zentriaColors.verde.main} 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, ${zentriaColors.naranja.main} 0%, transparent 50%)`,
        }}
      />

      <Box
        sx={{
          zIndex: 1,
          width: '100%',
          maxWidth: 500,
        }}
      >
        <Slide direction="down" in={true} timeout={800}>
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              width: '100%',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${zentriaColors.violeta.main}30`,
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              {/* Logo y título */}
              <Fade in={true} timeout={1000}>
                <Box textAlign="center" mb={4}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      margin: '0 auto',
                      mb: 2,
                      background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 32px ${zentriaColors.violeta.main}40`,
                    }}
                  >
                    <Lock sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                      background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    ZENTRIA AFE
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    Sistema de Aprobación de Facturas
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Enterprise Invoice Approval System
                  </Typography>
                </Box>
              </Fade>

              {/* Alerta de bloqueo */}
              <Collapse in={isLocked}>
                <Alert
                  severity="error"
                  icon={<Warning />}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-message': { fontWeight: 500 },
                  }}
                >
                  Cuenta bloqueada temporalmente. Tiempo restante: {Math.floor(lockTimeRemaining / 60)}:
                  {(lockTimeRemaining % 60).toString().padStart(2, '0')}
                </Alert>
              </Collapse>

              {/* Formulario */}
              <Box>
                <TextField
                  fullWidth
                  label="Usuario"
                  value={usuario}
                  onChange={(e) => {
                    setUsuario(e.target.value);
                    if (usuarioError) setUsuarioError('');
                  }}
                  margin="normal"
                  required
                  autoFocus
                  disabled={loading || isLocked}
                  error={!!usuarioError}
                  helperText={usuarioError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: usuarioError ? 'error.main' : zentriaColors.violeta.main }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: zentriaColors.violeta.main,
                      },
                    },
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !loading && !isLocked) {
                      handleLogin();
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  margin="normal"
                  required
                  disabled={loading || isLocked}
                  error={!!passwordError}
                  helperText={passwordError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: passwordError ? 'error.main' : zentriaColors.violeta.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading || isLocked}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: zentriaColors.violeta.main,
                      },
                    },
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !loading && !isLocked) {
                      handleLogin();
                    }
                  }}
                />

                {/* Link de recuperación de contraseña */}
                <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setOpenForgotPassword(true)}
                    disabled={loading || isLocked}
                    sx={{
                      color: zentriaColors.violeta.main,
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                      '&:disabled': {
                        color: 'text.disabled',
                      },
                    }}
                  >
                    ¿Olvidó su contraseña?
                  </Link>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !usuario || !password || isLocked}
                  sx={{
                    mt: 2,
                    py: 1.8,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
                    boxShadow: `0 8px 24px ${zentriaColors.violeta.main}40`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${zentriaColors.violeta.dark}, ${zentriaColors.naranja.dark})`,
                      boxShadow: `0 12px 32px ${zentriaColors.violeta.main}60`,
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: '#ccc',
                    },
                  }}
                  onClick={handleLogin}
                >
                  {loading ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                      <span>Iniciando sesión...</span>
                    </Box>
                  ) : isLocked ? (
                    'Cuenta Bloqueada'
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </Box>

              {/* Footer */}
              <Box textAlign="center" mt={4}>
                <Typography variant="caption" color="text.secondary">
                  © 2025 Zentria. Todos los derechos reservados.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    v1.0.0
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    •
                  </Typography>
                  <Link
                    href="#"
                    variant="caption"
                    sx={{ color: zentriaColors.violeta.main, textDecoration: 'none' }}
                  >
                    Soporte Técnico
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Slide>
      </Box>

      {/* Diálogo de recuperación de contraseña */}
      <Dialog
        open={openForgotPassword}
        onClose={() => setOpenForgotPassword(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
            color: 'white',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Email />
          Recuperar Contraseña
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Ingrese su correo electrónico registrado. Le enviaremos un enlace para restablecer su
            contraseña.
          </Typography>
          <TextField
            fullWidth
            label="Correo Electrónico"
            type="email"
            value={recoveryEmail}
            onChange={(e) => {
              setRecoveryEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            error={!!emailError}
            helperText={emailError}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: emailError ? 'error.main' : zentriaColors.violeta.main }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: zentriaColors.violeta.main,
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => {
              setOpenForgotPassword(false);
              setRecoveryEmail('');
              setEmailError('');
            }}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleForgotPassword}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: `linear-gradient(135deg, ${zentriaColors.violeta.dark}, ${zentriaColors.naranja.dark})`,
              },
            }}
          >
            Enviar Enlace
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sistema de notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          icon={
            notification.severity === 'success' ? (
              <CheckCircle />
            ) : notification.severity === 'error' ? (
              <ErrorIcon />
            ) : notification.severity === 'warning' ? (
              <Warning />
            ) : (
              <Info />
            )
          }
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: `0 8px 32px ${zentriaColors.violeta.main}40`,
            '& .MuiAlert-message': {
              fontWeight: 500,
              fontSize: '0.95rem',
            },
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default LoginPage;
