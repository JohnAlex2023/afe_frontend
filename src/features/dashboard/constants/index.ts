/**
 * Dashboard constants and configurations
 */

import type { EstadoFactura } from '../types';

// Labels sin emojis para mayor profesionalismo
// REFACTORIZADO: Eliminado estado 'pendiente'
export const ESTADO_LABELS: Record<EstadoFactura | 'todos', string> = {
  todos: 'Todos los estados',
  en_revision: 'En Revisión',
  aprobada: 'Aprobado',
  aprobado: 'Aprobado',
  aprobada_auto: 'Aprobado Automático',
  rechazada: 'Rechazado',
  rechazado: 'Rechazado',
  pagada: 'Pagada',
};

// Colores mejorados para estados según mejores prácticas UX/UI
// - Verde: Aprobados (éxito confirmado)
// - Verde claro/Cyan: Aprobados automáticamente (éxito automatizado)
// - Amarillo/Ámbar: En revisión (requiere atención/pendiente)
// - Naranja/Rojo: Rechazado (error/negativo)
export const ESTADO_COLORS: Record<EstadoFactura, 'success' | 'info' | 'error' | 'warning' | 'default'> = {
  aprobado: 'success',      // Verde - Aprobado manual
  aprobada: 'success',      // Verde - Aprobado manual
  aprobada_auto: 'info',    // Cyan/Azul claro - Aprobado automático
  rechazado: 'error',       // Rojo/Naranja - Rechazado
  rechazada: 'error',       // Rojo/Naranja - Rechazado
  en_revision: 'warning',   // Amarillo - En revisión/pendiente
  pagada: 'success',        // Verde - Pagada (completado)
};

export const DEFAULT_ROWS_PER_PAGE = 10;

export const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
