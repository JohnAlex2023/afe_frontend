/**
 * Tab de Vista por Proveedor
 * Muestra responsables asignados a un proveedor seleccionado
 */
import React, { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Button,
  Autocomplete,
  TextField,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useAppSelector } from '../../../app/hooks';
import { selectProveedoresList } from '../proveedoresSlice';
import { getResponsablesDeProveedor } from '../../../services/responsableProveedor.api';

function PorProveedorTab() {
  const proveedores = useAppSelector(selectProveedoresList);
  const [selectedProveedorId, setSelectedProveedorId] = useState<number | null>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLoadData = async () => {
    if (!selectedProveedorId) return;

    setLoading(true);
    try {
      const data = await getResponsablesDeProveedor(selectedProveedorId);
      setViewData(data);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Card sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Autocomplete
              options={proveedores}
              getOptionLabel={(option) => `${option.razon_social} (${option.nit})`}
              value={proveedores.find((p) => p.id === selectedProveedorId) || null}
              onChange={(_, newValue) => {
                setSelectedProveedorId(newValue?.id || null);
                setViewData(null);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Seleccionar Proveedor" />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleLoadData}
              disabled={!selectedProveedorId || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Consultar Responsables'}
            </Button>
          </Grid>
        </Grid>

        {viewData && (
          <Box mt={3}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Responsables asignados a: {viewData.proveedor.razon_social}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              NIT: {viewData.proveedor.nit} | Total: {viewData.total} responsables
            </Typography>

            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Usuario</strong></TableCell>
                    <TableCell><strong>Nombre</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewData.responsables.map((resp: any) => (
                    <TableRow key={resp.asignacion_id} hover>
                      <TableCell>{resp.usuario}</TableCell>
                      <TableCell>{resp.nombre}</TableCell>
                      <TableCell>{resp.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={resp.activo ? 'Activo' : 'Inactivo'}
                          color={resp.activo ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Card>
    </Box>
  );
}

export default PorProveedorTab;
