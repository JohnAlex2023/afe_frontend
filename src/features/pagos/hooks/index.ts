/**
 * Pagos Module Hooks
 * Exporta todos los hooks especializados para el módulo de pagos
 */

export { usePagos } from './usePagos';
export { usePermisoPagos, useIsCounterOrAdmin, useHasPermiso } from './usePermisoPagos';
export { useRegistroPago } from './useRegistroPago';

export type { RegistroPagoData } from './useRegistroPago';
