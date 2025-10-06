import { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Logout as LogoutIcon,
  AccountCircle,
  People as PeopleIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  Link as LinkIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { zentriaColors } from '../../theme/colors';

const DRAWER_WIDTH = 260;

// Menús base para todos los usuarios
const baseMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'responsable'] },
  { text: 'Facturas Pendientes', icon: <DescriptionIcon />, path: '/facturas', roles: ['admin', 'responsable'] },
];

// Menús adicionales para administradores
const adminMenuItems = [
  { text: 'Responsables', icon: <PeopleIcon />, path: '/admin/responsables', roles: ['admin'] },
  { text: 'Proveedores', icon: <BusinessIcon />, path: '/admin/proveedores', roles: ['admin'] },
];

// Menús de gestión avanzada
const gestionMenuItems = [
  { text: 'Gestión de Proveedores', icon: <StoreIcon />, path: '/gestion/proveedores', roles: ['admin'] },
  { text: 'Asignaciones', icon: <LinkIcon />, path: '/gestion/asignaciones', roles: ['admin'] },
];

/**
 * Main Layout Component
 * Layout principal con AppBar, Sidebar y content area
 */

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Filtrar menús según el rol del usuario
  const allMenuItems = user?.rol === 'admin'
    ? [...baseMenuItems, ...adminMenuItems, ...gestionMenuItems]
    : baseMenuItems;
  const filteredMenuItems = allMenuItems.filter(item => user && item.roles.includes(user.rol));

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          background: `linear-gradient(135deg, ${zentriaColors.violeta.main} 0%, ${zentriaColors.violeta.dark} 100%)`,
          color: 'white',
        }}
      >
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          ZENTRIA AFE
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ mt: 2 }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? `${zentriaColors.violeta.main}15` : 'transparent',
                  color: isActive ? zentriaColors.violeta.main : 'inherit',
                  '&:hover': {
                    backgroundColor: isActive
                      ? `${zentriaColors.violeta.main}25`
                      : `${zentriaColors.violeta.main}10`,
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? zentriaColors.violeta.main : 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          background: 'white',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
            <Avatar sx={{ bgcolor: zentriaColors.violeta.main, width: 36, height: 36 }}>
              {user?.nombre?.[0] || 'U'}
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>
              <AccountCircle sx={{ mr: 1 }} />
              {user?.nombre || 'Usuario'}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          maxWidth: '100%',
          mt: 8,
          backgroundColor: '#FAFAFA',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
