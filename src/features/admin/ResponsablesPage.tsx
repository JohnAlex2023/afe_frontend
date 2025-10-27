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
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { zentriaColors } from '../../theme/colors';
import apiClient from '../../services/api';

interface Responsable {
  id: number;
  usuario: string;
  nombre: string;
  email: string;
  area?: string;
  activo: boolean;
  role: {
    id: number;
    nombre: string;
  };
}

interface Role {
  id: number;
  nombre: string;
}

/**
 * ResponsablesPage Component
 * Página de administración de responsables (solo para admin)
 */
function ResponsablesPage() {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    email: '',
    area: '',
    password: '',
    role_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [responsablesRes, rolesRes] = await Promise.all([
        apiClient.get('/responsables/'),
        apiClient.get('/roles/'),
      ]);
      setResponsables(responsablesRes.data);
      setRoles(rolesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (responsable?: Responsable) => {
    if (responsable) {
      setEditingId(responsable.id);
      setFormData({
        usuario: responsable.usuario,
        nombre: responsable.nombre,
        email: responsable.email,
        area: responsable.area || '',
        password: '',
        role_id: responsable.role.id.toString(),
      });
    } else {
      setEditingId(null);
      setFormData({
        usuario: '',
        nombre: '',
        email: '',
        area: '',
        password: '',
        role_id: '',
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
        role_id: parseInt(formData.role_id),
        activo: true,
      };

      if (editingId) {
        // Editar
        if (!payload.password) {
          delete (payload as any).password;
        }
        await apiClient.put(`/responsables/${editingId}`, payload);
      } else {
        // Crear
        await apiClient.post('/responsables/', payload);
      }

      handleCloseDialog();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar responsable');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este responsable?')) return;

    try {
      await apiClient.delete(`/responsables/${id}`);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al eliminar responsable');
    }
  };

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
          Gestión de Responsables
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
            Nuevo Responsable
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: zentriaColors.violeta.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Usuario</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Área</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Rol</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responsables && responsables.length > 0 ? (
              responsables.map((responsable) => (
                <TableRow key={responsable.id} hover>
                  <TableCell>{responsable?.usuario || '-'}</TableCell>
                  <TableCell>{responsable?.nombre || '-'}</TableCell>
                  <TableCell>{responsable?.email || '-'}</TableCell>
                  <TableCell>{responsable?.area || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={responsable?.role?.nombre || 'Sin rol'}
                      size="small"
                      color={responsable?.role?.nombre === 'admin' ? 'error' : 'primary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={responsable?.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={responsable?.activo ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(responsable)}
                      sx={{ color: zentriaColors.naranja.main }}
                      title="Editar responsable"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(responsable.id)}
                      sx={{ color: 'error.main' }}
                      title="Eliminar responsable"
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
                    No hay responsables disponibles
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${zentriaColors.violeta.main}, ${zentriaColors.naranja.main})`,
            color: 'white',
            fontWeight: 700,
          }}
        >
          {editingId ? 'Editar Responsable' : 'Nuevo Responsable'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Usuario"
            value={formData.usuario}
            onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
            margin="normal"
            required
            disabled={!!editingId}
          />
          <TextField
            fullWidth
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Área"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            required={!editingId}
            helperText={editingId ? 'Dejar en blanco para mantener la actual' : ''}
          />
          <TextField
            fullWidth
            select
            label="Rol"
            value={formData.role_id}
            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
            margin="normal"
            required
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.nombre}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              !formData.usuario ||
              !formData.nombre ||
              !formData.email ||
              !formData.role_id ||
              (!editingId && !formData.password)
            }
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

export default ResponsablesPage;
