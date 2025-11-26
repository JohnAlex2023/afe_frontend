/**
 * Authentication Types - Sistema 2-Pasos Multi-Sede
 */

export interface User {
  id: number;
  nombre: string;
  email: string;
  usuario: string;
  area?: string;
  rol: string;
  activo: boolean;
}

export interface Sede {
  sede_id: number;
  nombre: string;
  empresa_id: number;
  empresa_nombre: string;
  codigo: string;
  ciudad?: string;
}

export interface LoginContext {
  usuario_id: number;
  usuario_nombre: string;
  sedes: Sede[];
  currentSedeId?: number;
  currentEmpresaId?: number;
  currentEmpresaCodigo?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  sede_id: number | null;
  empresa_id: number | null;
  empresa_codigo: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  currentLoginStep: 'paso1' | 'paso2' | null;

  // Métodos
  loginStep1: (usuario: string, password: string) => Promise<LoginContext>;
  loginStep2: (usuario_id: number, sede_id: number) => Promise<void>;
  cambiarSede: (sede_id: number) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  error?: string | null;
}

export interface LoginStep1Response {
  usuario_id: number;
  usuario_nombre: string;
  sedes: Sede[];
  requiere_seleccionar_sede: boolean;
}

export interface LoginStep2Response {
  access_token: string;
  token_type: string;
  user: User;
  sede_id?: number;
  empresa_id?: number;
  empresa_codigo?: string;
}

export interface CambiarSedeResponse {
  access_token: string;
  token_type: string;
  user: User;
  sede_id?: number;
  empresa_id?: number;
  empresa_codigo?: string;
}

export interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
  empresa_id?: number;
  sede_id?: number;
  empresa_codigo?: string;
}
