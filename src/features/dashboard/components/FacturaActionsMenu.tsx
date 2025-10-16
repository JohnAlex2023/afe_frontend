/**
 * Professional context menu for factura actions
 * Includes Approve, Reject, and Delete options with hover effects
 */

import { Menu, MenuItem, Divider, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircle, Cancel, Delete } from '@mui/icons-material';
import { zentriaColors } from '../../../theme/colors';
import type { Factura } from '../types';

interface FacturaActionsMenuProps {
  anchorEl: HTMLElement | null;
  factura: Factura | null;
  onClose: () => void;
  onApprove: (factura: Factura) => void;
  onReject: (factura: Factura) => void;
  onDelete: (factura: Factura) => void;
}

export const FacturaActionsMenu: React.FC<FacturaActionsMenuProps> = ({
  anchorEl,
  factura,
  onClose,
  onApprove,
  onReject,
  onDelete,
}) => {
  // Siempre permitir aprobar/rechazar (para cambiar estado de facturas ya procesadas)
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          minWidth: 200,
        }
      }}
    >
      <MenuItem
        onClick={() => handleAction(() => factura && onApprove(factura))}
        sx={{
          color: zentriaColors.verde.main,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: `${zentriaColors.verde.main}15`,
            transform: 'translateX(4px)',
          },
        }}
      >
        <ListItemIcon>
          <CheckCircle fontSize="small" sx={{ color: zentriaColors.verde.main }} />
        </ListItemIcon>
        <ListItemText primary="Aprobar" primaryTypographyProps={{ fontWeight: 600 }} />
      </MenuItem>

      <MenuItem
        onClick={() => handleAction(() => factura && onReject(factura))}
        sx={{
          color: zentriaColors.naranja.main,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: `${zentriaColors.naranja.main}15`,
            transform: 'translateX(4px)',
          },
        }}
      >
        <ListItemIcon>
          <Cancel fontSize="small" sx={{ color: zentriaColors.naranja.main }} />
        </ListItemIcon>
        <ListItemText primary="Rechazar" primaryTypographyProps={{ fontWeight: 600 }} />
      </MenuItem>

      <Divider sx={{ my: 1 }} />

      <MenuItem
        onClick={() => handleAction(() => factura && onDelete(factura))}
        sx={{
          color: 'error.main',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#f4433615',
            transform: 'translateX(4px)',
          },
        }}
      >
        <ListItemIcon>
          <Delete fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primary="Eliminar" primaryTypographyProps={{ fontWeight: 600 }} />
      </MenuItem>
    </Menu>
  );
};
