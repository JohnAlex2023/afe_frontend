/**
 * Tab de Vista por Responsable
 * Muestra proveedores asignados a un responsable seleccionado
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
import { getProveedoresDeResponsable } from '../../../services/responsableProveedor.api';
import apiClient from '../../../services/api';

interface Responsable {
  id: number;
  usuario: string;
  nombre: string;
}

function PorResponsableTab() {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [selectedResponsableId, setSelectedResponsableId] = useState<number | null>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadResponsables();
  }, []);

  const loadResponsables = async () => {
    try {
      const response = await apiClient.get('/responsables/');
      setResponsables(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLoadData = async () => {
    if (!selectedResponsableId) return;

    setLoading(true);
    try {
      const data = await getProveedoresDeResponsable(selectedResponsableId);
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
              options={responsables}
              getOptionLabel={(option) => `${option.nombre} (${option.usuario})`}
              value={responsables.find((r) => r.id === selectedResponsableId) || null}
              onChange={(_, newValue) => {
                setSelectedResponsableId(newValue?.id || null);
                setViewData(null);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Seleccionar Responsable" />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleLoadData}
              disabled={!selectedResponsableId || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Consultar Proveedores'}
            </Button>
          </Grid>
        </Grid>

        {viewData && (
          <Box mt={3}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Proveedores asignados a: {viewData.responsable.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total: {viewData.total} proveedores
            </Typography>

            <TableContainer sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>NIT</strong></TableCell>
                    <TableCell><strong>Razón Social</strong></TableCell>
                    <TableCell><strong>Área</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewData.proveedores.map((prov: any) => (
                    <TableRow key={prov.asignacion_id} hover>
                      <TableCell>{prov.nit}</TableCell>
                      <TableCell>{prov.razon_social}</TableCell>
                      <TableCell>{prov.area || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={prov.activo ? 'Activo' : 'Inactivo'}
                          color={prov.activo ? 'success' : 'default'}
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

export default PorResponsableTab;
