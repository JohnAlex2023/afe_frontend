/**
 * usePaymentModal - Hook para gestionar estado de modales de pago
 *
 * Encapsula la lógica de abrir/cerrar modales de registro e historial de pagos,
 * incluyendo el manejo del estado de la factura seleccionada.
 *
 * Uso:
 * const { registroModalOpen, openRegistroModal, closeRegistroModal } = usePaymentModal();
 */

import { useState, useCallback } from 'react';
import type { Factura } from '../types';

interface PaymentModalState {
  /** Modal de registro de pago */
  registroModalOpen: boolean;
  selectedFacturaForPayment: Factura | null;

  /** Modal de historial de pagos */
  historialModalOpen: boolean;
  selectedFacturaIdForHistory: number | null;
}

/**
 * Hook que proporciona estado y controles para los modales de pago
 *
 * @returns {Object} Estado y funciones para controlar modales
 *
 * @example
 * const {
 *   registroModalOpen,
 *   openRegistroModal,
 *   closeRegistroModal,
 *   historialModalOpen,
 *   openHistorialModal,
 *   closeHistorialModal
 * } = usePaymentModal();
 *
 * return (
 *   <>
 *     <Button onClick={() => openRegistroModal(factura)}>Registrar Pago</Button>
 *     <ModalRegistroPago
 *       isOpen={registroModalOpen}
 *       factura={...}
 *       onClose={closeRegistroModal}
 *     />
 *   </>
 * );
 */
export function usePaymentModal() {
  const [modalState, setModalState] = useState<PaymentModalState>({
    registroModalOpen: false,
    selectedFacturaForPayment: null,
    historialModalOpen: false,
    selectedFacturaIdForHistory: null,
  });

  /**
   * Abre el modal de registro de pago para una factura específica
   */
  const openRegistroModal = useCallback((factura: Factura) => {
    setModalState(prev => ({
      ...prev,
      registroModalOpen: true,
      selectedFacturaForPayment: factura,
    }));
  }, []);

  /**
   * Cierra el modal de registro de pago
   */
  const closeRegistroModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      registroModalOpen: false,
      selectedFacturaForPayment: null,
    }));
  }, []);

  /**
   * Abre el modal de historial de pagos para una factura específica
   */
  const openHistorialModal = useCallback((facturaId: number) => {
    setModalState(prev => ({
      ...prev,
      historialModalOpen: true,
      selectedFacturaIdForHistory: facturaId,
    }));
  }, []);

  /**
   * Cierra el modal de historial de pagos
   */
  const closeHistorialModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      historialModalOpen: false,
      selectedFacturaIdForHistory: null,
    }));
  }, []);

  /**
   * Cierra ambos modales (útil para limpiar estado)
   */
  const closeAllModals = useCallback(() => {
    setModalState({
      registroModalOpen: false,
      selectedFacturaForPayment: null,
      historialModalOpen: false,
      selectedFacturaIdForHistory: null,
    });
  }, []);

  return {
    // Estado del modal de registro
    registroModalOpen: modalState.registroModalOpen,
    selectedFacturaForPayment: modalState.selectedFacturaForPayment,

    // Controles del modal de registro
    openRegistroModal,
    closeRegistroModal,

    // Estado del modal de historial
    historialModalOpen: modalState.historialModalOpen,
    selectedFacturaIdForHistory: modalState.selectedFacturaIdForHistory,

    // Controles del modal de historial
    openHistorialModal,
    closeHistorialModal,

    // Control general
    closeAllModals,
  };
}
