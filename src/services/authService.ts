import apiClient from './api';

/**
 * Auth Service - Manejo de autenticación 2 pasos
 *
 * PASO 1: Validar credenciales y retornar sedes disponibles
 * PASO 2: Seleccionar sede y generar token JWT
 */

export interface SedeInfo {
  sede_id: number;
  nombre: string;
  empresa_id: number;
  empresa_nombre: string;
  codigo: string;
  ciudad?: string;
}

export interface LoginStep1Request {
  usuario: string;
  password: string;
}

export interface LoginStep1Response {
  usuario_id: number;
  usuario_nombre: string;
  sedes: SedeInfo[];
  requiere_seleccionar_sede: boolean;
}

export interface LoginStep2Request {
  usuario_id: number;
  sede_id: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    usuario: string;
    area?: string;
    rol: string;
    activo: boolean;
  };
  sede_id?: number;
  empresa_id?: number;
  empresa_codigo?: string;
}

export interface CambiarSedeRequest {
  sede_id: number;
}

class AuthService {
  /**
   * PASO 1: Validar credenciales y retornar sedes disponibles
   */
  async loginStep1(usuario: string, password: string): Promise<LoginStep1Response> {
    try {
      const response = await apiClient.post<LoginStep1Response>(
        '/auth/login-step-1',
        { usuario, password }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PASO 2: Seleccionar sede y generar token JWT
   */
  async loginStep2(usuario_id: number, sede_id: number): Promise<TokenResponse> {
    try {
      const response = await apiClient.post<TokenResponse>(
        '/auth/login-step-2',
        { usuario_id, sede_id }
      );

      // Guardar token y user en localStorage
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('sede_id', String(response.data.sede_id));
        localStorage.setItem('empresa_id', String(response.data.empresa_id));
        localStorage.setItem('empresa_codigo', response.data.empresa_codigo || '');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambiar sede post-login sin necesidad de re-autenticar
   */
  async cambiarSede(sede_id: number): Promise<TokenResponse> {
    try {
      const response = await apiClient.post<TokenResponse>(
        '/auth/cambiar-sede',
        { sede_id }
      );

      // Actualizar tokens y contexto en localStorage
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('sede_id', String(response.data.sede_id));
        localStorage.setItem('empresa_id', String(response.data.empresa_id));
        localStorage.setItem('empresa_codigo', response.data.empresa_codigo || '');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuario actual desde localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Obtener sede actual desde localStorage
   */
  getCurrentSedeId(): number | null {
    const sedeId = localStorage.getItem('sede_id');
    return sedeId ? parseInt(sedeId, 10) : null;
  }

  /**
   * Obtener empresa actual desde localStorage
   */
  getCurrentEmpresaId(): number | null {
    const empresaId = localStorage.getItem('empresa_id');
    return empresaId ? parseInt(empresaId, 10) : null;
  }

  /**
   * Obtener código de empresa desde localStorage
   */
  getCurrentEmpresaCodigo(): string | null {
    return localStorage.getItem('empresa_codigo');
  }

  /**
   * Obtener token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  /**
   * Verificar si el token está expirado (decodificar JWT)
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decodificar JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() >= expirationTime;
    } catch {
      return true;
    }
  }

  /**
   * Logout - Limpiar localStorage
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('sede_id');
    localStorage.removeItem('empresa_id');
    localStorage.removeItem('empresa_codigo');
  }

  /**
   * Decodificar JWT para obtener claims
   */
  getTokenClaims(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
