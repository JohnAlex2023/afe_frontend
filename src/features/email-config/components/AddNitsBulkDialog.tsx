/**
 * Dialog para Agregar Múltiples NITs (Bulk)
 * Permite pegar lista de NITs separados por comas, espacios o saltos de línea
 */

import React, { useState } from 'react';
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
  Chip,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../../app/hooks';
import { crearNitsBulk } from '../emailConfigSlice';

interface Props {
  open: boolean;
  onClose: () => void;
  cuentaId: number;
  onSuccess: () => void;
}

const AddNitsBulkDialog: React.FC<Props> = ({ open, onClose, cuentaId, onSuccess }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [nitsTexto, setNitsTexto] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setNitsTexto('');
    setResultado(null);
    setError(null);
    onClose();
  };

  const procesarNits = (texto: string): string[] => {
    // Separar por comas, espacios, saltos de línea
    return texto
      .split(/[\s,\n\r]+/)
      .map((nit) => nit.trim())
      .filter((nit) => nit.length > 0);
  };

  const handleAgregar = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const nitsArray = procesarNits(nitsTexto);

      if (nitsArray.length === 0) {
        setError('Debes ingresar al menos un NIT');
        setLoading(false);
        return;
      }

      // Validar formato de NITs
      const nitsInvalidos = nitsArray.filter((nit) => !/^\d{5,20}$/.test(nit));
      if (nitsInvalidos.length > 0) {
        setError(
          `NITs inválidos encontrados: ${nitsInvalidos.join(', ')}. Solo se permiten números de 5-20 dígitos.`
        );
        setLoading(false);
        return;
      }

      const result = await dispatch(
        crearNitsBulk({
          cuenta_correo_id: cuentaId,
          nits: nitsArray,
        })
      ).unwrap();

      setResultado(result);

      // Si hubo éxito parcial o total, llamar a onSuccess
      if (result.nits_agregados > 0) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al agregar NITs');
    } finally {
      setLoading(false);
    }
  };

  const nitsPreview = procesarNits(nitsTexto);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth aria-modal="true" disableEnforceFocus>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            📤 Importar Múltiples NITs
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {resultado ? (
          // Mostrar resultados
          <Box>
            <Alert
              severity={
                resultado.nits_fallidos > 0
                  ? 'warning'
                  : resultado.nits_duplicados > 0
                  ? 'info'
                  : 'success'
              }
              sx={{ mb: 3 }}
            >
              <Typography variant="body1" gutterBottom>
                <strong>Proceso completado</strong>
              </Typography>
              <Typography variant="body2">
                • {resultado.nits_agregados} NITs agregados correctamente
              </Typography>
              {resultado.nits_duplicados > 0 && (
                <Typography variant="body2">
                  • {resultado.nits_duplicados} NITs duplicados (ignorados)
                </Typography>
              )}
              {resultado.nits_fallidos > 0 && (
                <Typography variant="body2">
                  • {resultado.nits_fallidos} NITs fallidos
                </Typography>
              )}
            </Alert>

            <Typography variant="subtitle2" gutterBottom>
              Detalle de NITs:
            </Typography>
            <List dense>
              {resultado.detalles.map((detalle: any, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {detalle.status === 'agregado' && <SuccessIcon color="success" />}
                    {detalle.status === 'duplicado' && <WarningIcon color="warning" />}
                    {detalle.status === 'error' && <ErrorIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={detalle.nit}
                    secondary={
                      detalle.status === 'agregado'
                        ? 'Agregado correctamente'
                        : detalle.status === 'duplicado'
                        ? 'Ya existe en esta cuenta'
                        : detalle.mensaje || 'Error'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          // Formulario de entrada
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Instrucciones:</strong>
              </Typography>
              <Typography variant="body2">
                • Pega los NITs separados por comas, espacios o en líneas diferentes
              </Typography>
              <Typography variant="body2">
                • Solo se permiten números de 5-20 dígitos
              </Typography>
              <Typography variant="body2">
                • Los NITs duplicados se ignorarán automáticamente
              </Typography>
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={10}
              label="Lista de NITs"
              placeholder={`Ejemplo:\n901234567\n901234568, 901234569\n901234570 901234571`}
              value={nitsTexto}
              onChange={(e) => setNitsTexto(e.target.value)}
              disabled={loading}
              helperText={`${nitsPreview.length} NIT${nitsPreview.length !== 1 ? 's' : ''} detectado${nitsPreview.length !== 1 ? 's' : ''}`}
            />

            {nitsPreview.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Vista previa:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {nitsPreview.slice(0, 20).map((nit, index) => (
                    <Chip
                      key={index}
                      label={nit}
                      size="small"
                      color={/^\d{5,20}$/.test(nit) ? 'primary' : 'error'}
                      variant="outlined"
                    />
                  ))}
                  {nitsPreview.length > 20 && (
                    <Chip
                      label={`+${nitsPreview.length - 20} más`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!resultado ? (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleAgregar}
              disabled={loading || nitsPreview.length === 0}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Agregando...' : `Agregar ${nitsPreview.length} NIT${nitsPreview.length !== 1 ? 's' : ''}`}
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={handleClose}>
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddNitsBulkDialog;
