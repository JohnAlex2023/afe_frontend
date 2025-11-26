import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { setCredentials, setLoading, cambiarSede } from '../features/auth/authSlice';
import authService from '../services/authService';
import { LoginStep1Response, TokenResponse } from '../services/authService';

/**
 * useLogin Hook - Lógica del login 2-pasos
 *
 * Maneja:
 * - PASO 1: Validar credenciales y retornar sedes
 * - PASO 2: Seleccionar sede y generar token
 * - Cambio de sede post-login
 */

export interface LoginState {
  currentStep: 'paso1' | 'paso2' | null;
  usuario: string;
  password: string;
  usuarioId: number | null;
  usuarioNombre: string;
  sedes: any[];
  selectedSede: any | null;
  error: string | null;
  isLoading: boolean;
  requiresSedeSelection: boolean;
}

const initialState: LoginState = {
  currentStep: null,
  usuario: '',
  password: '',
  usuarioId: null,
  usuarioNombre: '',
  sedes: [],
  selectedSede: null,
  error: null,
  isLoading: false,
  requiresSedeSelection: true,
};

export const useLogin = () => {
  const [state, setState] = useState<LoginState>(initialState);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  /**
   * PASO 1: Validar credenciales
   */
  const handleLoginStep1 = async (usuario: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    dispatch(setLoading(true));

    try {
      const response: LoginStep1Response = await authService.loginStep1(usuario, password);

      // Guardar datos del PASO 1
      setState((prev) => ({
        ...prev,
        currentStep: 'paso2',
        usuarioId: response.usuario_id,
        usuarioNombre: response.usuario_nombre,
        sedes: response.sedes,
        usuario,
        password,
        requiresSedeSelection: response.requiere_seleccionar_sede,
        isLoading: false,
      }));

      // Si solo hay una sede, auto-avanzar a PASO 2
      if (response.sedes.length === 1 && response.requiere_seleccionar_sede) {
        await handleLoginStep2(response.usuario_id, response.sedes[0].sede_id);
      }

      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Error en la validación de credenciales. Intenta de nuevo.';

      setState((prev) => ({
        ...prev,
        currentStep: null,
        error: errorMessage,
        isLoading: false,
      }));
      dispatch(setLoading(false));

      throw err;
    }
  };

  /**
   * PASO 2: Seleccionar sede y generar token
   */
  const handleLoginStep2 = async (usuarioId: number, sedeId: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    dispatch(setLoading(true));

    try {
      const response: TokenResponse = await authService.loginStep2(usuarioId, sedeId);

      // Actualizar Redux state
      dispatch(
        setCredentials({
          user: response.user,
          token: response.access_token,
          sede_id: response.sede_id,
          empresa_id: response.empresa_id,
          empresa_codigo: response.empresa_codigo,
        })
      );

      // Actualizar state local
      const selectedSedeData = state.sedes.find((s) => s.sede_id === sedeId);
      setState((prev) => ({
        ...prev,
        currentStep: null,
        selectedSede: selectedSedeData,
        isLoading: false,
      }));

      // Navegar al dashboard
      navigate('/dashboard');

      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Error al seleccionar sede. Intenta de nuevo.';

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      dispatch(setLoading(false));

      throw err;
    }
  };

  /**
   * Cambiar sede post-login sin necesidad de hacer logout
   */
  const handleCambiarSede = async (sedeId: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    dispatch(setLoading(true));

    try {
      const response: TokenResponse = await authService.cambiarSede(sedeId);

      // Actualizar Redux state
      dispatch(
        cambiarSede({
          token: response.access_token,
          sede_id: response.sede_id,
          empresa_id: response.empresa_id,
          empresa_codigo: response.empresa_codigo,
        })
      );

      const selectedSedeData = state.sedes.find((s) => s.sede_id === sedeId);
      setState((prev) => ({
        ...prev,
        selectedSede: selectedSedeData,
        isLoading: false,
      }));

      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Error al cambiar de sede. Intenta de nuevo.';

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      dispatch(setLoading(false));

      throw err;
    }
  };

  /**
   * Limpiar error
   */
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  /**
   * Reset del estado
   */
  const reset = () => {
    setState(initialState);
  };

  return {
    ...state,
    handleLoginStep1,
    handleLoginStep2,
    handleCambiarSede,
    clearError,
    reset,
  };
};
