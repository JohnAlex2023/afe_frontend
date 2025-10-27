/**
 * DashboardPage - Main dashboard container
 * Refactored to use modular components, custom hooks, and services
 */

import { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Chip } from '@mui/material';
import { Refresh, Add } from '@mui/icons-material';
import { useAppSelector } from '../../app/hooks';
import { zentriaColors } from '../../theme/colors';
import apiClient from '../../services/api';

// Feature imports
import {
  StatsCards,
  FilterBar,
  FacturasTable,
  FacturaFormModal,
  FacturaActionsMenu,
  ChartsSection,
} from './components';
import { useDashboardData, useFacturaDialog } from './hooks';
import { facturasService } from './services/facturas.service';
import type { Factura, EstadoFactura, VistaFacturas, FacturaFormData } from './types';
import { DEFAULT_ROWS_PER_PAGE } from './constants';

// Import the professional modals from Facturas feature
import FacturaDetailModal from '../../components/Facturas/FacturaDetailModal';
import ApprovalDialog from '../../components/Facturas/ApprovalDialog';
import RejectionDialog from '../../components/Facturas/RejectionDialog';
import { ConfirmDeleteDialog } from '../../components/Dialogs/ConfirmDeleteDialog';

function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoFactura | 'todos'>('todos');
  const [vistaFacturas, setVistaFacturas] = useState<VistaFacturas>('todas');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFactura, setMenuFactura] = useState<Factura | null>(null);
  const [actionError, setActionError] = useState('');

  // Approval/Rejection dialogs state
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedFacturaForAction, setSelectedFacturaForAction] = useState<Factura | null>(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facturaToDelete, setFacturaToDelete] = useState<Factura | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Custom hooks
  const {
    facturas,
    stats,
    totalTodasFacturas,
    totalAsignadas,
    loading,
    error,
    loadData,
    clearError,
  } = useDashboardData({
    userRole: user?.rol,
    filterEstado,
    vistaFacturas,
  });

  const {
    openDialog,
    dialogMode,
    selectedFactura,
    formData,
    setFormData,
    openDialogWith,
    closeDialog,
  } = useFacturaDialog();

  // Search filter
  const filteredFacturas = facturas.filter(
    (factura) =>
      factura?.numero_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura?.nombre_emisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura?.nit_emisor?.includes(searchTerm)
  );

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, factura: Factura) => {
    setAnchorEl(event.currentTarget);
    setMenuFactura(factura);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuFactura(null);
  };

  const handleFormChange = (field: keyof FacturaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        await facturasService.createFactura(formData);
      } else if (dialogMode === 'edit' && selectedFactura) {
        await facturasService.updateFactura(selectedFactura.id, formData);
      }
      closeDialog();
      await loadData();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Error al guardar factura');
    }
  };

  const handleDelete = (factura: Factura) => {
    setFacturaToDelete(factura);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (!facturaToDelete) return;

    setDeleteLoading(true);
    try {
      await facturasService.deleteFactura(facturaToDelete.id);
      await loadData();
      setDeleteDialogOpen(false);
      setFacturaToDelete(null);
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Error al eliminar factura');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setFacturaToDelete(null);
  };

  const handleApprove = (factura: Factura) => {
    setSelectedFacturaForAction(factura);
    setApprovalDialogOpen(true);
    handleMenuClose();
  };

  const handleReject = (factura: Factura) => {
    setSelectedFacturaForAction(factura);
    setRejectionDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmApproval = async (observaciones?: string) => {
    if (!selectedFacturaForAction) return;

    try {
      // IMPORTANTE: Enviar el nombre completo del usuario, no el username
      const approverName = typeof user?.nombre === 'string' && user.nombre.trim() ? user.nombre : user?.usuario || '';
      await facturasService.approveFactura(selectedFacturaForAction.id, approverName, observaciones);
      setApprovalDialogOpen(false);
      setSelectedFacturaForAction(null);

      // Esperar a que el backend complete la transacción
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mantener el filtro actual - solo recargar datos
      // La factura desaparecerá automáticamente si ya no cumple el filtro
      await loadData();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Error al aprobar factura');
    }
  };

  const handleConfirmRejection = async (motivo: string, detalle?: string) => {
    if (!selectedFacturaForAction) return;

    try {
      // IMPORTANTE: Enviar el nombre completo del usuario, no el username
      const rejectorName = typeof user?.nombre === 'string' && user.nombre.trim() ? user.nombre : user?.usuario || '';
      await facturasService.rejectFactura(selectedFacturaForAction.id, rejectorName, motivo, detalle);
      setRejectionDialogOpen(false);
      setSelectedFacturaForAction(null);

      // Esperar a que el backend complete la transacción
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mantener el filtro actual - solo recargar datos
      // La factura desaparecerá automáticamente si ya no cumple el filtro
      await loadData();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || 'Error al rechazar factura');
    }
  };

  const handleExport = () => {
    const url = facturasService.getExportUrl(
      filterEstado,
      (user?.rol === 'admin' || user?.rol === 'responsable') && vistaFacturas === 'asignadas'
    );
    window.location.href = apiClient.defaults.baseURL + url;
  };

  // Transform dashboard Factura to format expected by FacturaDetailModal
  const transformFacturaForModal = (factura: Factura | null) => {
    if (!factura) return null;

    return {
      factura: {
        id: factura.id,
        numero_factura: factura.numero_factura,
        cufe: factura.cufe || '',
        fecha_emision: factura.fecha_emision,
        fecha_vencimiento: factura.fecha_vencimiento,
        proveedor: {
          nit: factura.nit_emisor,
          razon_social: factura.nombre_emisor,
        },
        proveedor_nombre: factura.nombre_emisor,
        nit: factura.nit_emisor,
        subtotal: factura.monto_total * 0.84, // Aproximación: 84% del total (sin IVA 19%)
        iva: factura.monto_total * 0.16, // Aproximación: 16% del total (IVA 19%)
        total: factura.monto_total,
        total_a_pagar: factura.monto_total,
        estado: factura.estado,
        observaciones: factura.observaciones,
      },
    };
  };

  // Initial loading state (only on first load)
  const isInitialLoad = loading && facturas.length === 0;

  if (isInitialLoad) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} sx={{ color: zentriaColors.violeta.main }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Dashboard de Control
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Gestión completa de facturas • Sistema de aprobación
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={18} /> : <Refresh />}
            onClick={loadData}
            disabled={loading}
            sx={{
              borderColor: zentriaColors.violeta.main + (loading ? '40' : ''),
              color: zentriaColors.violeta.main,
              fontWeight: 600,
              minWidth: 120,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: zentriaColors.violeta.main,
                bgcolor: zentriaColors.violeta.main + '08',
              },
              '&.Mui-disabled': {
                borderColor: zentriaColors.violeta.main + '40',
                color: zentriaColors.violeta.main + '60',
              }
            }}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
          {(user?.rol === 'admin' || user?.rol === 'responsable') && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openDialogWith('create')}
              sx={{
                background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
                boxShadow: '0 4px 14px rgba(128, 0, 106, 0.25)',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(128, 0, 106, 0.35)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                }
              }}
            >
              Nueva Factura
            </Button>
          )}
        </Box>
      </Box>

      {/* Statistics Cards */}
      <StatsCards
        stats={stats}
        onCardClick={(filter) => {
          setFilterEstado(filter as EstadoFactura | 'todos');
          setPage(0);
        }}
      />

      {/* Charts Section - NEW! */}
      <ChartsSection stats={stats} />

      {/* Filters and Search */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        filterEstado={filterEstado}
        onFilterEstadoChange={setFilterEstado}
        vistaFacturas={vistaFacturas}
        onVistaFacturasChange={setVistaFacturas}
        totalTodasFacturas={totalTodasFacturas}
        totalAsignadas={totalAsignadas}
        onExport={handleExport}
        isAdmin={user?.rol === 'admin' || user?.rol === 'responsable'}
      />

      {/* Error Messages */}
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" onClose={() => setActionError('')} sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {/* Facturas Table */}
      <FacturasTable
        facturas={filteredFacturas}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        onOpenDialog={openDialogWith}
        onMenuClick={handleMenuClick}
        isAdmin={user?.rol === 'admin' || user?.rol === 'responsable'}
      />

      {/* Actions Menu */}
      <FacturaActionsMenu
        anchorEl={anchorEl}
        factura={menuFactura}
        onClose={handleMenuClose}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
      />

      {/* Professional Modals */}
      {dialogMode === 'view' ? (
        <FacturaDetailModal
          open={openDialog}
          onClose={closeDialog}
          workflow={transformFacturaForModal(selectedFactura)}
        />
      ) : (
        <FacturaFormModal
          open={openDialog}
          mode={dialogMode}
          formData={formData}
          onFormChange={handleFormChange}
          onClose={closeDialog}
          onSave={handleSave}
          error={actionError}
        />
      )}

      {/* Approval Dialog */}
      <ApprovalDialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        facturaNumero={selectedFacturaForAction?.numero_factura || ''}
        onConfirm={handleConfirmApproval}
      />

      {/* Rejection Dialog */}
      <RejectionDialog
        open={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        facturaNumero={selectedFacturaForAction?.numero_factura || ''}
        onConfirm={handleConfirmRejection}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        title="Eliminar Factura"
        itemName={facturaToDelete?.numero_factura || ''}
        itemDetails={facturaToDelete ? [
          { label: 'Emisor', value: facturaToDelete.nombre_emisor },
          { label: 'NIT', value: facturaToDelete.nit_emisor },
          { label: 'Monto', value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(facturaToDelete.monto_total) },
          { label: 'Estado', value: facturaToDelete.estado },
        ] : []}
        warningMessage="Se eliminarán todos los registros asociados a esta factura (workflow, aprobaciones, etc.)"
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </Box>
  );
}

export default DashboardPage;
