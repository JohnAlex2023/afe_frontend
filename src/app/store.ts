import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import facturasReducer from '../features/facturas/facturasSlice';

/**
 * Redux Store Configuration
 * Store centralizado para el estado global de la aplicación
 */

export const store = configureStore({
  reducer: {
    auth: authReducer,
    facturas: facturasReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar estas rutas para verificación de serialización
        ignoredActions: ['facturas/setFacturas'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
