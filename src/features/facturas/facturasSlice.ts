import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { FacturaPendiente, DashboardMetrics, FacturaConWorkflow, ContextoHistorico } from '../../types/factura.types';
import apiClient from '../../services/api';

/**
 * Facturas Slice
 */

interface FacturasState {
  pendientes: FacturaPendiente[];
  selectedFactura: FacturaConWorkflow | null;
  contextoHistorico: ContextoHistorico | null;
  dashboard: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
}

const initialState: FacturasState = {
  pendientes: [],
  selectedFactura: null,
  contextoHistorico: null,
  dashboard: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchFacturasPendientes = createAsyncThunk(
  'facturas/fetchPendientes',
  async (responsableId: number) => {
    const response = await apiClient.get(`/workflow/mis-facturas-pendientes?responsable_id=${responsableId}&limite=100`);
    return response.data.facturas_pendientes;
  }
);

export const fetchFacturaDetalle = createAsyncThunk(
  'facturas/fetchDetalle',
  async (facturaId: number) => {
    const response = await apiClient.get(`/workflow/factura-detalle/${facturaId}`);
    return response.data;
  }
);

export const fetchDashboard = createAsyncThunk(
  'facturas/fetchDashboard',
  async (responsableId: number) => {
    const response = await apiClient.get(`/workflow/dashboard?responsable_id=${responsableId}`);
    return response.data;
  }
);

export const aprobarFactura = createAsyncThunk(
  'facturas/aprobar',
  async ({ workflowId, data }: { workflowId: number; data: { aprobado_por: string; observaciones?: string } }) => {
    const response = await apiClient.post(`/workflow/aprobar/${workflowId}`, data);
    return response.data;
  }
);

export const rechazarFactura = createAsyncThunk(
  'facturas/rechazar',
  async ({ workflowId, data }: { workflowId: number; data: { rechazado_por: string; motivo: string; detalle?: string } }) => {
    const response = await apiClient.post(`/workflow/rechazar/${workflowId}`, data);
    return response.data;
  }
);

const facturasSlice = createSlice({
  name: 'facturas',
  initialState,
  reducers: {
    clearSelectedFactura: (state) => {
      state.selectedFactura = null;
      state.contextoHistorico = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pendientes
      .addCase(fetchFacturasPendientes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacturasPendientes.fulfilled, (state, action) => {
        state.loading = false;
        state.pendientes = action.payload;
      })
      .addCase(fetchFacturasPendientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar facturas';
      })
      // Fetch detalle
      .addCase(fetchFacturaDetalle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacturaDetalle.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFactura = action.payload;
        state.contextoHistorico = action.payload.contexto_historico || null;
      })
      .addCase(fetchFacturaDetalle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar detalle';
      })
      // Fetch dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error al cargar dashboard';
      })
      // Aprobar
      .addCase(aprobarFactura.fulfilled, (state) => {
        state.selectedFactura = null;
      })
      // Rechazar
      .addCase(rechazarFactura.fulfilled, (state) => {
        state.selectedFactura = null;
      });
  },
});

export const { clearSelectedFactura, clearError } = facturasSlice.actions;
export default facturasSlice.reducer;
