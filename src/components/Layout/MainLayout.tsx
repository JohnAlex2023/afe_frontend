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
  Store as StoreIcon,
  Email as EmailIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { zentriaColors } from '../../theme/colors';
import { getRoleLabel } from '../../constants/roles';
import { Breadcrumb } from '../Breadcrumb';

const DRAWER_WIDTH = 260;

// Menús base para todos los usuarios
const baseMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'responsable', 'contador', 'viewer'] },
  { text: 'Por Revisar', icon: <DescriptionIcon />, path: '/facturas', roles: ['admin', 'responsable', 'viewer'] },
];


// Menús adicionales para administradores
const adminMenuItems = [
  { text: 'Gestión de Usuarios', icon: <PeopleIcon />, path: '/admin/responsables', roles: ['admin', 'viewer'] },
  { text: 'Gestión de Proveedores', icon: <StoreIcon />, path: '/gestion/proveedores', roles: ['admin', 'viewer'] },
  { text: 'Configuración de Correos', icon: <EmailIcon />, path: '/email-config', roles: ['admin'] },
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
  let allMenuItems = [...baseMenuItems];

  if (user?.rol === 'admin' || user?.rol === 'viewer') {
    allMenuItems = [...allMenuItems, ...adminMenuItems];
  }

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

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1.5,
                minWidth: 280,
                borderRadius: '16px',
                overflow: 'visible',
                background: 'white',
                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.08)',
                border: 'none',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 18,
                  width: 14,
                  height: 14,
                  bgcolor: 'white',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                  boxShadow: '-4px -4px 8px rgba(0, 0, 0, 0.04)',
                },
              },
            }}
          >
            {/* User Info Header - Diseño moderno sin fondo de color */}
            <Box sx={{ px: 3, py: 2.5, pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      background: `linear-gradient(135deg, ${zentriaColors.violeta.main} 0%, ${zentriaColors.violeta.dark} 100%)`,
                      color: 'white',
                      width: 56,
                      height: 56,
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      boxShadow: `0 4px 16px ${zentriaColors.violeta.main}40`,
                    }}
                  >
                    {user?.nombre?.[0] || 'U'}
                  </Avatar>
                  {/* Status indicator - online */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: '#22c55e',
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)',
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: '#1a202c',
                      lineHeight: 1.3,
                      mb: 0.5,
                      fontSize: '1rem',
                    }}
                  >
                    {user?.nombre || 'Usuario'}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: `${zentriaColors.violeta.main}15`,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '8px',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: zentriaColors.violeta.main,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {getRoleLabel(user?.rol || '')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {/* User email */}
            <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc' }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontWeight: 500,
                  display: 'block',
                  fontSize: '0.75rem',
                }}
              >
                {user?.email || 'usuario@zentria.com'}
              </Typography>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {/* Logout Button - Diseño moderno */}
            <Box sx={{ p: 1.5 }}>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  borderRadius: '12px',
                  py: 1.75,
                  px: 2.5,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '2px solid transparent',
                  '&:hover': {
                    bgcolor: '#fef2f2',
                    border: '2px solid #fee2e2',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
                    '& .logout-icon': {
                      transform: 'translateX(4px)',
                    },
                    '& .logout-text': {
                      color: '#dc2626',
                    },
                  },
                }}
              >
                <LogoutIcon
                  className="logout-icon"
                  sx={{
                    mr: 2,
                    color: '#ef4444',
                    fontSize: 24,
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                <Typography
                  className="logout-text"
                  sx={{
                    fontWeight: 700,
                    color: '#ef4444',
                    fontSize: '0.95rem',
                    transition: 'color 0.25s ease',
                  }}
                >
                  Cerrar Sesión
                </Typography>
              </MenuItem>
            </Box>
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

      {/* Main content - Professional padding for natural responsive behavior */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4, lg: '16px 80px', xl: '16px 120px' },
          width: '100%',
          maxWidth: '100%',
          mt: 8,
          backgroundColor: '#FAFAFA',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ width: '100%' }}>
          {/* Breadcrumb Navigation */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumb showHomeIcon maxLabelLength={35} />
          </Box>

          {/* Page Content */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
