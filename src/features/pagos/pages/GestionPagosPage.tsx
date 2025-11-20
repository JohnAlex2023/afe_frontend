/**
 * GestionPagosPage - Página principal del módulo de pagos
 * FASE 2 REFACTORIZADO: Módulo separado y especializado en gestión de pagos
 *
 * Funcionalidades:
 * - Registrar pagos para facturas aprobadas
 * - Ver historial completo de pagos
 * - Resumen de estadísticas de pagos
 * - Control por rol (CONTADOR/ADMIN únicamente)
 */

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Alert,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import { useAppSelector } from '../../../app/hooks';
import { zentriaColors } from '../../../theme/colors';

// Tabs
import { RegistroPagoTab } from '../components/RegistroPagoTab';
import { HistorialPagosTab } from '../components/HistorialPagosTab';
import { ResumenPagosTab } from '../components/ResumenPagosTab';

// Tipos
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel" id={`pagos-tabpanel-${index}`}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

export const GestionPagosPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const user = useAppSelector((state) => state.auth.user);

  // Validar permisos
  const tienePermisosPago = user?.rol === 'contador' || user?.rol === 'admin';

  if (!tienePermisosPago) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          No tienes permisos para acceder a la gestión de pagos. Solo CONTADOR y ADMIN pueden registrar pagos.
        </Alert>
      </Box>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Gestión de Pagos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Registra pagos, consulta historial y visualiza estadísticas de pagos
        </Typography>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: zentriaColors.violeta.main,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: zentriaColors.violeta.main,
              },
            }}
          >
            <Tab label="📝 Registrar Pago" id="tab-registro" />
            <Tab label="📋 Historial de Pagos" id="tab-historial" />
            <Tab label="📊 Resumen" id="tab-resumen" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Tab 1: Registrar Pago */}
          <TabPanel value={tabValue} index={0}>
            <RegistroPagoTab />
          </TabPanel>

          {/* Tab 2: Historial de Pagos */}
          <TabPanel value={tabValue} index={1}>
            <HistorialPagosTab />
          </TabPanel>

          {/* Tab 3: Resumen de Pagos */}
          <TabPanel value={tabValue} index={2}>
            <ResumenPagosTab />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GestionPagosPage;
