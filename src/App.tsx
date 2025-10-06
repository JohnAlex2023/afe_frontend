import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { zentriaTheme } from './theme/zentriaTheme';
import { store } from './app/store';
import AppRoutes from './AppRoutes';
import { NotificationProvider } from './components/Notifications/NotificationProvider';

/**
 * App Component
 * Componente principal con todos los providers
 */

function App() {
  console.log('[app] App componente renderizado')
  return (
    <Provider store={store}>
      <ThemeProvider theme={zentriaTheme}>
        <CssBaseline />
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
