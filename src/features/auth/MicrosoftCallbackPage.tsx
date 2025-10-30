import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Microsoft } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from './authSlice';
import { zentriaColors } from '../../theme/colors';
import { microsoftAuthService } from '../../services/microsoftAuth.service';

/**
 * Microsoft OAuth Callback Page
 * Maneja el callback de Microsoft y completa la autenticación
 */

function MicrosoftCallbackPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener parámetros del callback
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Si hay error en la URL
        if (error) {
          throw new Error(`Error de Microsoft: ${error}`);
        }

        // Validar parámetros
        if (!code || !state) {
          throw new Error('Parámetros de autenticación inválidos');
        }

        // Procesar callback
        const authResponse = await microsoftAuthService.handleCallback(code, state);

        // Guardar credenciales en Redux
        dispatch(
          setCredentials({
            user: authResponse.user,
            token: authResponse.access_token,
          })
        );

        setStatus('success');

        // Redirigir al dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (error: any) {
        console.error('Error en callback de Microsoft:', error);
        setStatus('error');
        setErrorMessage(
          error.message || 'Error al procesar la autenticación con Microsoft'
        );
      }
    };

    handleCallback();
  }, [searchParams, dispatch, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${zentriaColors.violeta.dark} 0%, ${zentriaColors.violeta.main} 40%, ${zentriaColors.naranja.main} 100%)`,
        px: 2,
      }}
    >
      <Card
        elevation={24}
        sx={{
          borderRadius: 5,
          maxWidth: 500,
          width: '100%',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.98)',
          border: `2px solid ${zentriaColors.violeta.main}15`,
          boxShadow: `0 20px 60px ${zentriaColors.violeta.main}40`,
        }}
      >
        <CardContent sx={{ p: 6, textAlign: 'center' }}>
          {/* Estado: Cargando */}
          {status === 'loading' && (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  mb: 3,
                  background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress size={40} sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
                Completando autenticación...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Por favor, espere mientras procesamos su información de Microsoft.
              </Typography>
            </>
          )}

          {/* Estado: Éxito */}
          {status === 'success' && (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  mb: 3,
                  background: `linear-gradient(135deg, ${zentriaColors.verde.main}, ${zentriaColors.verde.dark})`,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'scaleIn 0.4s ease',
                  '@keyframes scaleIn': {
                    '0%': { transform: 'scale(0)' },
                    '100%': { transform: 'scale(1)' },
                  },
                }}
              >
                <CheckCircle sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
                ¡Autenticación exitosa!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Redirigiendo al sistema...
              </Typography>
            </>
          )}

          {/* Estado: Error */}
          {status === 'error' && (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  mb: 3,
                  background: '#F44336',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ErrorIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="error" gutterBottom>
                Error de autenticación
              </Typography>
              <Alert severity="error" sx={{ mt: 3, textAlign: 'left', borderRadius: 2.5 }}>
                {errorMessage}
              </Alert>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  mt: 3,
                  py: 1.8,
                  borderRadius: 3,
                  fontWeight: 700,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
                  boxShadow: `0 8px 24px ${zentriaColors.violeta.main}40`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${zentriaColors.violeta.dark}, ${zentriaColors.naranja.dark})`,
                  },
                }}
              >
                Volver al Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default MicrosoftCallbackPage;
