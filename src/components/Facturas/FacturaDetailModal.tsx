import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Alert,
} from '@mui/material';
import { Close, CheckCircle, Warning } from '@mui/icons-material';
import type { Workflow } from '../../types/factura.types';
import { zentriaColors } from '../../theme/colors';

interface FacturaDetailModalProps {
  open: boolean;
  onClose: () => void;
  workflow: Workflow | null;
}

/**
 * Modal para mostrar detalles completos de una factura
 * con comparación lado a lado cuando hay similitud
 */
function FacturaDetailModal({ open, onClose, workflow }: FacturaDetailModalProps) {
  if (!workflow || !workflow.factura) {
    return null;
  }

  const { factura, es_identica_mes_anterior, porcentaje_similitud, diferencias_detectadas, factura_referencia } = workflow;

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Factura {factura.numero_factura}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              CUFE: {factura.cufe}
            </Typography>
          </Box>
          <Button onClick={onClose} color="inherit">
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Análisis de Similitud */}
        {porcentaje_similitud !== null && porcentaje_similitud !== undefined && (
          <Box mb={3}>
            <Alert
              severity={es_identica_mes_anterior ? 'success' : porcentaje_similitud >= 95 ? 'info' : 'warning'}
              icon={es_identica_mes_anterior ? <CheckCircle /> : <Warning />}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {es_identica_mes_anterior
                  ? '✅ Factura idéntica al mes anterior'
                  : `Similitud con factura anterior: ${porcentaje_similitud.toFixed(1)}%`}
              </Typography>
              {diferencias_detectadas && diferencias_detectadas.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Se detectaron {diferencias_detectadas.length} diferencia(s)
                </Typography>
              )}
            </Alert>
          </Box>
        )}

        {/* Información del Proveedor */}
        <Box mb={3}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Información del Proveedor
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Proveedor
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {factura.proveedor?.razon_social || factura.proveedor_nombre || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                NIT
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {factura.proveedor?.nit || factura.nit || '-'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Comparación Lado a Lado */}
        {factura_referencia ? (
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Comparación con Factura Anterior
            </Typography>
            <Grid container spacing={3}>
              {/* Factura Actual */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `2px solid ${zentriaColors.violeta.main}`,
                    backgroundColor: `${zentriaColors.violeta.main}08`,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                    📄 Factura Actual
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <strong>Número</strong>
                        </TableCell>
                        <TableCell>{factura.numero_factura}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Fecha</strong>
                        </TableCell>
                        <TableCell>{formatDate(factura.fecha_emision)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Subtotal</strong>
                        </TableCell>
                        <TableCell>{formatCurrency(factura.subtotal)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>IVA</strong>
                        </TableCell>
                        <TableCell>{formatCurrency(factura.iva)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Total</strong>
                        </TableCell>
                        <TableCell>
                          <strong>{formatCurrency(factura.total)}</strong>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Total a Pagar</strong>
                        </TableCell>
                        <TableCell>
                          <strong>{formatCurrency(factura.total_a_pagar)}</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Grid>

              {/* Factura Referencia */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `2px solid ${zentriaColors.verde.main}`,
                    backgroundColor: `${zentriaColors.verde.main}08`,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: zentriaColors.verde.dark }} gutterBottom>
                    📋 Factura Anterior
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <strong>Número</strong>
                        </TableCell>
                        <TableCell>{factura_referencia.numero_factura}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Fecha</strong>
                        </TableCell>
                        <TableCell>{formatDate(factura_referencia.fecha_emision)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Subtotal</strong>
                        </TableCell>
                        <TableCell>{formatCurrency(factura_referencia.subtotal)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>IVA</strong>
                        </TableCell>
                        <TableCell>{formatCurrency(factura_referencia.iva)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Total</strong>
                        </TableCell>
                        <TableCell>
                          <strong>{formatCurrency(factura_referencia.total)}</strong>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Total a Pagar</strong>
                        </TableCell>
                        <TableCell>
                          <strong>{formatCurrency(factura_referencia.total_a_pagar)}</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </Grid>
            </Grid>

            {/* Diferencias Detectadas */}
            {diferencias_detectadas && diferencias_detectadas.length > 0 && (
              <Box mt={3}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Diferencias Detectadas
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {diferencias_detectadas.map((diff, index) => (
                    <Chip
                      key={index}
                      label={`${diff.campo}: ${diff.valor_anterior} → ${diff.valor_actual}`}
                      color="warning"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          /* Detalles Sin Comparación */
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Detalles de la Factura
            </Typography>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <strong>Número de Factura</strong>
                  </TableCell>
                  <TableCell>{factura.numero_factura}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Fecha de Emisión</strong>
                  </TableCell>
                  <TableCell>{formatDate(factura.fecha_emision)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Subtotal</strong>
                  </TableCell>
                  <TableCell>{formatCurrency(factura.subtotal)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>IVA</strong>
                  </TableCell>
                  <TableCell>{formatCurrency(factura.iva)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Total</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{formatCurrency(factura.total)}</strong>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Total a Pagar</strong>
                  </TableCell>
                  <TableCell>
                    <strong>{formatCurrency(factura.total_a_pagar)}</strong>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <strong>Estado</strong>
                  </TableCell>
                  <TableCell>
                    <Chip label={factura.estado} size="small" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Observaciones */}
        {factura.observaciones && (
          <Box mt={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Observaciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {factura.observaciones}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FacturaDetailModal;
