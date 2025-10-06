import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  TablePagination,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { zentriaColors } from '../../theme/colors';
import apiClient from '../../services/api';

interface Proveedor {
  id: number;
  nit: string;
  razon_social: string;
  direccion?: string;
  telefono?: string;
  contacto_email?: string;
  activo: boolean;
}

/**
 * ProveedoresPage Component
 * Página de administración de proveedores (solo para admin)
 */
function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    nit: '',
    razon_social: '',
    direccion: '',
    telefono: '',
    contacto_email: '',
    activo: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/proveedores/');
      setProveedores(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (proveedor?: Proveedor) => {
    if (proveedor) {
      setEditingId(proveedor.id);
      setFormData({
        nit: proveedor.nit,
        razon_social: proveedor.razon_social,
        direccion: proveedor.direccion || '',
        telefono: proveedor.telefono || '',
        contacto_email: proveedor.contacto_email || '',
        activo: proveedor.activo,
      });
    } else {
      setEditingId(null);
      setFormData({
        nit: '',
        razon_social: '',
        direccion: '',
        telefono: '',
        contacto_email: '',
        activo: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setError('');
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
      };

      if (editingId) {
        // Editar
        await apiClient.put(`/proveedores/${editingId}`, payload);
      } else {
        // Crear
        await apiClient.post('/proveedores/', payload);
      }

      handleCloseDialog();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar proveedor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este proveedor?')) return;

    try {
      await apiClient.delete(`/proveedores/${id}`);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar proveedor');
    }
  };

  const filteredProveedores = proveedores.filter(
    (proveedor) =>
      proveedor?.nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700} color={zentriaColors.violeta.main}>
          Gestión de Proveedores
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ borderColor: zentriaColors.violeta.main, color: zentriaColors.violeta.main }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
            }}
          >
            Nuevo Proveedor
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Búsqueda */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Buscar por NIT o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: zentriaColors.violeta.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>NIT</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Razón Social</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Dirección</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Teléfono</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProveedores && filteredProveedores.length > 0 ? (
              filteredProveedores
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((proveedor) => (
                  <TableRow key={proveedor.id} hover>
                    <TableCell>{proveedor?.nit || '-'}</TableCell>
                    <TableCell>{proveedor?.razon_social || '-'}</TableCell>
                    <TableCell>{proveedor?.direccion || '-'}</TableCell>
                    <TableCell>{proveedor?.telefono || '-'}</TableCell>
                    <TableCell>{proveedor?.contacto_email || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={proveedor?.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={proveedor?.activo ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(proveedor)}
                        sx={{ color: zentriaColors.naranja.main }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(proveedor.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" py={4}>
                    No hay proveedores disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredProveedores.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Filas por página:"
      />

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
            color: 'white',
            fontWeight: 700,
          }}
        >
          {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="NIT"
            value={formData.nit}
            onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
            margin="normal"
            required
            disabled={!!editingId}
          />
          <TextField
            fullWidth
            label="Razón Social"
            value={formData.razon_social}
            onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email de Contacto"
            type="email"
            value={formData.contacto_email}
            onChange={(e) => setFormData({ ...formData, contacto_email: e.target.value })}
            margin="normal"
          />
          {editingId && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.activo}
                label="Estado"
                onChange={(e) => setFormData({ ...formData, activo: e.target.value as boolean })}
              >
                <MenuItem value={true as any}>Activo</MenuItem>
                <MenuItem value={false as any}>Inactivo</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.nit || !formData.razon_social}
            sx={{
              background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProveedoresPage;
