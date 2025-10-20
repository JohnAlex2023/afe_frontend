/**
 * Dialog para Crear Nueva Cuenta de Correo
 * Formulario validado con React Hook Form + Zod
 */

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Alert,
  Box,
  Chip,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../../app/hooks';
import { crearCuenta } from '../emailConfigSlice';

// Validación con Zod
const schema = z.object({
  email: z.string().email('Email inválido').min(5, 'Email requerido'),
  nombre_descriptivo: z.string().optional(),
  fetch_limit: z.number().min(1).max(1000).default(500),
  fetch_days: z.number().min(1).max(365).default(90),
  organizacion: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCuentaDialog: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nits, setNits] = useState<string[]>([]);
  const [nitInput, setNitInput] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fetch_limit: 500,
      fetch_days: 90,
    },
  });

  const handleClose = () => {
    reset();
    setNits([]);
    setNitInput('');
    setError(null);
    onClose();
  };

  const handleAgregarNit = () => {
    const nitLimpio = nitInput.trim();

    // Validar NIT
    if (!nitLimpio) return;

    if (!/^\d{5,20}$/.test(nitLimpio)) {
      setError('El NIT debe contener solo números (5-20 dígitos)');
      return;
    }

    if (nits.includes(nitLimpio)) {
      setError('Este NIT ya está en la lista');
      return;
    }

    setNits([...nits, nitLimpio]);
    setNitInput('');
    setError(null);
  };

  const handleEliminarNit = (nit: string) => {
    setNits(nits.filter((n) => n !== nit));
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      await dispatch(
        crearCuenta({
          email: data.email,
          nombre_descriptivo: data.nombre_descriptivo || undefined,
          fetch_limit: data.fetch_limit,
          fetch_days: data.fetch_days,
          organizacion: data.organizacion || undefined,
          nits: nits.length > 0 ? nits : undefined,
        })
      ).unwrap();

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            📧 Nueva Cuenta de Correo
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Información Básica */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Información Básica
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Corporativo *"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message || 'Email de Microsoft Graph'}
                    placeholder="facturacion@empresa.com"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="nombre_descriptivo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre Descriptivo"
                    fullWidth
                    error={!!errors.nombre_descriptivo}
                    helperText={errors.nombre_descriptivo?.message || 'Nombre amigable (opcional)'}
                    placeholder="Angiografía de Colombia"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="organizacion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Organización"
                    fullWidth
                    error={!!errors.organizacion}
                    helperText={errors.organizacion?.message || 'Ej: ANGIOGRAFIA, AVIDANTI'}
                    placeholder="ANGIOGRAFIA"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {/* Placeholder para alineación */}
            </Grid>

            {/* Configuración de Extracción */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Configuración de Extracción
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="fetch_limit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Límite de Correos"
                    fullWidth
                    error={!!errors.fetch_limit}
                    helperText={errors.fetch_limit?.message || 'Correos a procesar por ejecución (1-1000)'}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="fetch_days"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Días Retroactivos"
                    fullWidth
                    error={!!errors.fetch_days}
                    helperText={errors.fetch_days?.message || 'Días hacia atrás para buscar (1-365)'}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>

            {/* NITs Iniciales */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                NITs Iniciales (Opcional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Puedes agregar NITs ahora o después desde la página de detalle
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  label="Agregar NIT"
                  value={nitInput}
                  onChange={(e) => setNitInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAgregarNit();
                    }
                  }}
                  placeholder="Ej: 901234567"
                  helperText="Solo números, 5-20 dígitos. Presiona Enter para agregar"
                />
                <Button
                  variant="contained"
                  onClick={handleAgregarNit}
                  startIcon={<AddIcon />}
                  sx={{ minWidth: 120 }}
                >
                  Agregar
                </Button>
              </Stack>
            </Grid>

            {nits.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'grey.50',
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    NITs agregados ({nits.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {nits.map((nit) => (
                      <Chip
                        key={nit}
                        label={nit}
                        onDelete={() => handleEliminarNit(nit)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Creando...' : 'Crear Cuenta'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateCuentaDialog;
