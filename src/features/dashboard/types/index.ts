/**
 * Types and interfaces for Dashboard feature
 */

export interface Factura {
  id: number;
  numero_factura: string;
  cufe?: string;
  nit_emisor: string;
  nombre_emisor: string;
  monto_total: number;
  fecha_emision: string;
  fecha_vencimiento?: string;
  estado: EstadoFactura;
  responsable_id?: number;
  observaciones?: string;
  archivo_adjunto?: string;
}

export type EstadoFactura =
  | 'pendiente'
  | 'en_revision'
  | 'aprobada'
  | 'aprobado'
  | 'aprobada_auto'
  | 'rechazada'
  | 'rechazado';

export interface DashboardStats {
  total: number;
  pendientes: number;
  en_revision: number;
  aprobadas: number;
  aprobadas_auto: number;
  rechazadas: number;
}

export interface FacturaFormData {
  numero_factura: string;
  nit_emisor: string;
  nombre_emisor: string;
  monto_total: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  observaciones: string;
}

export type DialogMode = 'view' | 'edit' | 'create';

export type VistaFacturas = 'todas' | 'asignadas';

export interface FacturasFilters {
  searchTerm: string;
  filterEstado: EstadoFactura | 'todos';
  vistaFacturas: VistaFacturas;
}

export interface PaginationState {
  page: number;
  rowsPerPage: number;
}
