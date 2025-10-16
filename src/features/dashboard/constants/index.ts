/**
 * Dashboard constants and configurations
 */

import type { EstadoFactura } from '../types';

// Labels sin emojis para mayor profesionalismo
export const ESTADO_LABELS: Record<EstadoFactura | 'todos', string> = {
  todos: 'Todos los estados',
  pendiente: 'Pendiente',
  en_revision: 'En Revisión',
  aprobada: 'Aprobado',
  aprobado: 'Aprobado',
  aprobada_auto: 'Aprobado Automático',
  rechazada: 'Rechazado',
  rechazado: 'Rechazado',
};

export const ESTADO_COLORS: Record<EstadoFactura, 'success' | 'info' | 'error' | 'warning' | 'default'> = {
  aprobado: 'success',
  aprobada: 'success',
  aprobada_auto: 'info',
  rechazado: 'error',
  rechazada: 'error',
  pendiente: 'warning',
  en_revision: 'default',
};

export const DEFAULT_ROWS_PER_PAGE = 10;

export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
