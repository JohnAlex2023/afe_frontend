/**
 * Facturas API service para Por Revisar
 * Handles all API calls related to facturas
 */

import apiClient from '../../../services/api';

export const facturasService = {
  /**
   * Approve a factura
   */
  async approveFactura(id: number, aprobadoPor: string, observaciones?: string): Promise<void> {
    await apiClient.post(`/facturas/${id}/aprobar`, {
      aprobado_por: aprobadoPor,
      observaciones: observaciones || undefined,
    });
  },

  /**
   * Reject a factura
   */
  async rejectFactura(id: number, rechazadoPor: string, motivo: string, detalle?: string): Promise<void> {
    await apiClient.post(`/facturas/${id}/rechazar`, {
      rechazado_por: rechazadoPor,
      motivo,
      detalle: detalle || undefined,
    });
  },
};
