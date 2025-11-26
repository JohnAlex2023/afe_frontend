import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { cambiarSede as cambiarSedeAction } from '../features/auth/authSlice';
import authService from '../services/authService';
import { TokenResponse } from '../services/authService';

/**
 * useCambiarSede Hook
 *
 * Hook para manejar el cambio de sede post-login sin logout
 *
 * Uso en MainLayout:
 * const { cambiarSede, isLoading, error } = useCambiarSede();
 *
 * // En el onClick del SedeSelector:
 * await cambiarSede(nuevaSedeId);
 */

export const useCambiarSede = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const sede_id = useAppSelector((state) => state.auth.sede_id);
  const empresa_id = useAppSelector((state) => state.auth.empresa_id);

  const cambiarSede = async (sedeId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: TokenResponse = await authService.cambiarSede(sedeId);

      // Actualizar Redux state
      dispatch(
        cambiarSedeAction({
          token: response.access_token,
          sede_id: response.sede_id,
          empresa_id: response.empresa_id,
          empresa_codigo: response.empresa_codigo,
        })
      );

      setIsLoading(false);
      return;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Error al cambiar de sede. Intenta de nuevo.';

      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    cambiarSede,
    isLoading,
    error,
    clearError,
    currentSedeId: sede_id,
    currentEmpresaId: empresa_id,
  };
};
