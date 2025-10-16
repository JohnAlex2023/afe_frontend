/**
 * Estado-related helper functions
 */

import type { EstadoFactura } from '../types';
import { ESTADO_COLORS, ESTADO_LABELS } from '../constants';

export const getEstadoColor = (estado: EstadoFactura): 'success' | 'info' | 'error' | 'warning' | 'default' => {
  return ESTADO_COLORS[estado] || 'default';
};

export const getEstadoLabel = (estado: EstadoFactura | 'todos'): string => {
  return ESTADO_LABELS[estado] || estado;
};

/**
 * Normalize estado values (handles aprobado/aprobada variants)
 */
export const isEstadoAprobado = (estado: EstadoFactura): boolean => {
  return estado === 'aprobada' || estado === 'aprobado';
};

export const isEstadoRechazado = (estado: EstadoFactura): boolean => {
  return estado === 'rechazada' || estado === 'rechazado';
};
