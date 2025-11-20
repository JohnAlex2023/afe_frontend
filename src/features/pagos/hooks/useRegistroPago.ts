/**
 * useRegistroPago - Hook for handling payment registration operations
 * Manages payment form state and submission logic
 */

import { useState, useCallback } from 'react';
import apiClient from '../../../services/api';

export interface RegistroPagoData {
  facturaId: number;
  referencia: string;
  monto: number;
  metodo_pago: 'cheque' | 'transferencia' | 'efectivo' | 'tarjeta';
  observaciones?: string;
}

interface RegistroPagoError {
  message: string;
  details?: string;
  field?: string;
}

interface RegistroPagoState {
  loading: boolean;
  error: RegistroPagoError | null;
  success: boolean;
}

export const useRegistroPago = () => {
  const [state, setState] = useState<RegistroPagoState>({
    loading: false,
    error: null,
    success: false,
  });

  /**
   * Registra un nuevo pago
   * @param data - Datos del pago a registrar
   * @returns Promise que se resuelve si el pago se registra exitosamente
   */
  const registrarPago = useCallback(
    async (data: RegistroPagoData): Promise<{ success: boolean; message: string }> => {
      setState({ loading: true, error: null, success: false });

      try {
        // Validar que el monto sea positivo
        if (data.monto <= 0) {
          throw new Error('El monto debe ser mayor a 0');
        }

        // Validar que la referencia no esté vacía
        if (!data.referencia.trim()) {
          throw new Error('La referencia es requerida');
        }

        // Hacer la llamada al API
        const response = await apiClient.post('/pagos/registrar', {
          factura_id: data.facturaId,
          referencia: data.referencia,
          monto: data.monto,
          metodo_pago: data.metodo_pago,
          observaciones: data.observaciones || '',
        });

        setState({ loading: false, error: null, success: true });
        return {
          success: true,
          message: response.data?.message || 'Pago registrado exitosamente',
        };
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Error al registrar el pago';

        const errorDetails =
          err.response?.data?.details || err.response?.data?.error_details || undefined;

        const error: RegistroPagoError = {
          message: errorMessage,
          details: errorDetails,
          field: err.response?.data?.field,
        };

        setState({ loading: false, error, success: false });
        throw error;
      }
    },
    []
  );

  /**
   * Valida una referencia de pago (unicidad)
   * @param referencia - Referencia a validar
   * @param facturaId - ID de la factura (opcional, para contexto)
   * @returns Promise que se resuelve con resultado de validación
   */
  const validarReferencia = useCallback(
    async (referencia: string, facturaId?: number): Promise<{ valida: boolean; message?: string }> => {
      try {
        if (!referencia.trim()) {
          return { valida: false, message: 'La referencia no puede estar vacía' };
        }

        const response = await apiClient.get('/pagos/validar-referencia', {
          params: { referencia, factura_id: facturaId },
        });

        return {
          valida: response.data?.valida ?? true,
          message: response.data?.message,
        };
      } catch (err: any) {
        // En caso de error del servidor, asumimos que la referencia es válida
        // para permitir que el usuario continúe (error no es culpa del usuario)
        console.error('Error validando referencia:', err);
        return { valida: true };
      }
    },
    []
  );

  /**
   * Limpia el estado de éxito/error
   */
  const clearState = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return {
    registrarPago,
    validarReferencia,
    clearState,
    ...state,
  };
};

export default useRegistroPago;
