import { useEffect } from 'react';
import { Box, Container, Fade, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { LoginStep1 } from './LoginStep1';
import { LoginStep2 } from './LoginStep2';
import { useLogin } from '../../hooks/useLogin';
import { zentriaColors } from '../../theme/colors';
import { Sede } from './LoginStep2';

/**
 * LoginPage - Sistema 2-Pasos Multi-Sede
 *
 * Integra:
 * - PASO 1: Validar credenciales y retornar sedes disponibles
 * - PASO 2: Seleccionar sede y generar token JWT
 *
 * Características:
 * - Flujo profesional de login
 * - Auto-avance si hay solo una sede
 * - Manejo robusto de errores
 * - Microsoft OAuth (integración futura)
 */

function LoginPageNew() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const {
    currentStep,
    usuario,
    password,
    usuarioId,
    usuarioNombre,
    sedes,
    selectedSede,
    error,
    isLoading,
    handleLoginStep1,
    handleLoginStep2,
    clearError,
    reset,
  } = useLogin();

  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleStep1Submit = async (usr: string, pwd: string) => {
    try {
      await handleLoginStep1(usr, pwd);
    } catch {
      // El error es manejado en el hook
    }
  };

  const handleStep2Submit = async (sedeId: number) => {
    if (!usuarioId) return;

    try {
      await handleLoginStep2(usuarioId, sedeId);
    } catch {
      // El error es manejado en el hook
    }
  };

  const handleBackToStep1 = () => {
    reset();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: zentriaColors.bg.primary,
        backgroundImage: `linear-gradient(135deg, ${zentriaColors.bg.primary} 0%, ${zentriaColors.bg.secondary} 100%)`,
        padding: 2,
        overflow: 'auto',
        position: 'relative',

        // Efecto de fondo animado (opcional)
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, ${zentriaColors.primary}10 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, ${zentriaColors.secondary}10 0%, transparent 50%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Stack spacing={4}>
          {/* Logo/Encabezado (opcional) */}
          {/* Puedes agregar aquí tu logo o marca */}

          {/* Contenedor principal */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* PASO 1: Validación de Credenciales */}
            {currentStep === null && (
              <Fade in={true} timeout={600}>
                <div style={{ width: '100%' }}>
                  <LoginStep1
                    onSubmit={handleStep1Submit}
                    isLoading={isLoading}
                    error={error}
                    onErrorClear={clearError}
                  />
                </div>
              </Fade>
            )}

            {/* PASO 2: Selección de Sede */}
            {currentStep === 'paso2' && usuarioId && (
              <Fade in={true} timeout={600}>
                <div style={{ width: '100%' }}>
                  <LoginStep2
                    usuarioNombre={usuarioNombre}
                    sedes={sedes as Sede[]}
                    onSubmit={handleStep2Submit}
                    onBack={handleBackToStep1}
                    isLoading={isLoading}
                    error={error}
                    onErrorClear={clearError}
                  />
                </div>
              </Fade>
            )}
          </Box>

          {/* Pie de página (opcional) */}
          {/* Puedes agregar aquí links a ayuda, términos, etc. */}
        </Stack>
      </Container>
    </Box>
  );
}

export default LoginPageNew;
