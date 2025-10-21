/**
 * Dialog para Agregar un NIT Individual
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
  Typography,
  Alert,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAppDispatch } from '../../../app/hooks';
import { crearNit } from '../emailConfigSlice';

const schema = z.object({
  nit: z
    .string()
    .regex(/^\d{5,20}$/, 'El NIT debe contener solo números (5-20 dígitos)')
    .min(5, 'Mínimo 5 dígitos')
    .max(20, 'Máximo 20 dígitos'),
  nombre_proveedor: z.string().optional(),
  notas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  cuentaId: number;
  onSuccess: () => void;
}

const AddNitDialog: React.FC<Props> = ({ open, onClose, cuentaId, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      await dispatch(
        crearNit({
          cuenta_correo_id: cuentaId,
          nit: data.nit,
          nombre_proveedor: data.nombre_proveedor || undefined,
          notas: data.notas || undefined,
        })
      ).unwrap();

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al agregar NIT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth aria-modal="true" disableEnforceFocus>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            ➕ Agregar NIT
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

          <Controller
            name="nit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="NIT *"
                fullWidth
                error={!!errors.nit}
                helperText={errors.nit?.message || 'Solo números, 5-20 dígitos'}
                placeholder="901234567"
                sx={{ mb: 2 }}
                autoFocus
              />
            )}
          />

          <Controller
            name="nombre_proveedor"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre del Proveedor"
                fullWidth
                error={!!errors.nombre_proveedor}
                helperText={errors.nombre_proveedor?.message || 'Opcional'}
                placeholder="Ej: Proveedor ABC S.A."
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="notas"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Notas"
                fullWidth
                multiline
                rows={3}
                error={!!errors.notas}
                helperText={errors.notas?.message || 'Notas adicionales (opcional)'}
                placeholder="Información adicional sobre este proveedor..."
              />
            )}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ minWidth: 120 }}>
            {loading ? 'Agregando...' : 'Agregar NIT'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddNitDialog;
