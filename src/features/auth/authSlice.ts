import { createSlice } from '@reduxjs/toolkit';
import { User } from '../../types/auth.types';

/**
 * Authentication Slice - Multi-Sede Support
 *
 * FASE: Sistema 2-Pasos
 * - PASO 1: Validar credenciales, retornar sedes disponibles
 * - PASO 2: Seleccionar sede, generar token JWT con contexto
 */

interface AuthState {
  user: User | null;
  token: string | null;
  sede_id: number | null;
  empresa_id: number | null;
  empresa_codigo: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const storedUser = localStorage.getItem('user');
const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('access_token'),
  sede_id: localStorage.getItem('sede_id') ? parseInt(localStorage.getItem('sede_id')!, 10) : null,
  empresa_id: localStorage.getItem('empresa_id')
    ? parseInt(localStorage.getItem('empresa_id')!, 10)
    : null,
  empresa_codigo: localStorage.getItem('empresa_codigo'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * setCredentials: Almacenar credenciales completas (usuario + sede context)
     */
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.sede_id = action.payload.sede_id;
      state.empresa_id = action.payload.empresa_id;
      state.empresa_codigo = action.payload.empresa_codigo;
      state.isAuthenticated = true;
      localStorage.setItem('access_token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('sede_id', String(action.payload.sede_id));
      localStorage.setItem('empresa_id', String(action.payload.empresa_id));
      localStorage.setItem('empresa_codigo', action.payload.empresa_codigo || '');
    },

    /**
     * cambiarSede: Actualizar contexto de sede sin hacer logout
     */
    cambiarSede: (state, action) => {
      state.token = action.payload.token;
      state.sede_id = action.payload.sede_id;
      state.empresa_id = action.payload.empresa_id;
      state.empresa_codigo = action.payload.empresa_codigo;
      localStorage.setItem('access_token', action.payload.token);
      localStorage.setItem('sede_id', String(action.payload.sede_id));
      localStorage.setItem('empresa_id', String(action.payload.empresa_id));
      localStorage.setItem('empresa_codigo', action.payload.empresa_codigo || '');
    },

    /**
     * logout: Limpiar toda la información de autenticación
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.sede_id = null;
      state.empresa_id = null;
      state.empresa_codigo = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('sede_id');
      localStorage.removeItem('empresa_id');
      localStorage.removeItem('empresa_codigo');
    },

    /**
     * setLoading: Controlar estado de carga
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, cambiarSede, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
export type { User };
