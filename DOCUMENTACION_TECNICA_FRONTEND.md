# 📱 DOCUMENTACIÓN TÉCNICA - AFE FRONTEND

**Versión:** 2.0
**Estado:** Production Ready
**Framework:** React 19.1.1 + TypeScript

---

## 📑 Tabla de Contenidos

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Arquitectura del Frontend](#arquitectura-del-frontend)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Configuración y Despliegue](#configuración-y-despliegue)
6. [Autenticación y Autorización](#autenticación-y-autorización)
7. [Gestión de Estado (Redux)](#gestión-de-estado-redux)
8. [Componentes Principales](#componentes-principales)
9. [Sistema de Diseño](#sistema-de-diseño)
10. [Servicios y Conexión API](#servicios-y-conexión-api)
11. [Rutas y Navegación](#rutas-y-navegación)
12. [Formularios y Validación](#formularios-y-validación)
13. [Pruebas (Testing)](#pruebas-testing)
14. [Buenas Prácticas](#buenas-prácticas)
15. [Futuras Mejoras](#futuras-mejoras)

---

## 🎯 Resumen del Proyecto

### Descripción General

**AFE Frontend** es una aplicación web moderna para gestión de facturas y proveedores, construida con **React 19 + TypeScript + Redux Toolkit**. Proporciona una interfaz intuitiva y responsiva para:

-  Visualización y gestión de facturas
-  Aprobación/rechazo de facturas con workflows
-  Gestión de proveedores y NITs
-  Configuración de cuentas de correo
-  Estadísticas y análisis en tiempo real
-  Dashboard interactivo con gráficos

**Propósito Principal:** Proporcionar una interfaz amigable que permita a usuarios (admin, responsables, viewers) interactuar con el sistema de automatización de facturas, visualizar datos y tomar decisiones informadas.

### Características Principales

| Característica | Descripción |
|---|---|
| **Autenticación OAuth** | Login con Microsoft Azure AD (SSO corporativo) |
| **Dashboard Inteligente** | KPIs, gráficos y estadísticas en tiempo real |
| **Gestión de Facturas** | CRUD completo con filtros y paginación |
| **Workflow de Aprobación** | Diálogos para aprobar/rechazar con motivos |
| **Validación de NITs** | Validación en tiempo real integrando con backend |
| **Interfaz Responsiva** | Mobile-first, 100% responsive |
| **Tema Corporativo** | Paleta Zentria con Material-UI personalizado |
| **Sistema de Roles** | RBAC con 3 roles: admin, responsable, viewer |

---

## 🏗️ Arquitectura del Frontend

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│               USUARIO (Browser Web)                          │
│           (Chrome, Edge, Firefox, Safari)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│           PRESENTATION LAYER (React Components)              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Pages: LoginPage, DashboardPage, FacturasPage, etc.   │ │
│  │ Components: FacturasTable, Charts, Dialogs, etc.      │ │
│  │ Layouts: MainLayout, AppBar, Sidebar                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │
│  Custom Hooks: useDashboardData, useFacturaDialog, etc.
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│         STATE MANAGEMENT LAYER (Redux Toolkit)               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Slices:                                                 │ │
│  │  • authSlice (user, token, isAuthenticated)           │ │
│  │  • facturasSlice (facturas[], filters, loading)       │ │
│  │  • proveedoresSlice (proveedores[], nits[])           │ │
│  │  • emailConfigSlice (cuentas[], detalle, nits[])      │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │
│  Store: configureStore con middleware personalizado
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│         SERVICES LAYER (API & Business Logic)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ • apiClient (Axios con interceptores)                 │ │
│  │ • nitValidation.service (validación NITs)             │ │
│  │ • microsoftAuth.service (OAuth Microsoft)             │ │
│  │ • emailConfigService (CRUD correos)                   │ │
│  │ • proveedores.api (CRUD proveedores)                  │ │
│  │ • facturas.service (CRUD facturas)                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │
│  Request Interceptors: Agrega JWT token
│  Response Interceptors: Maneja errores 401, etc.
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│           API BACKEND (FastAPI - Node:8000)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ GET /api/v1/facturas         - Listar facturas        │ │
│  │ POST /api/v1/workflow/aprobar - Aprobar factura       │ │
│  │ GET /api/v1/auth/microsoft/authorize - OAuth          │ │
│  │ POST /api/v1/email-config/validate-nit - Validar NIT  │ │
│  │ Y más endpoints...                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│           DATA LAYER (MySQL + External Services)             │
│  ├── MySQL Database                                          │
│  ├── Microsoft Azure AD (OAuth)                             │
│  ├── Microsoft Graph API (Email)                            │
│  └── SMTP Server (Email notifications)                      │
└──────────────────────────────────────────────────────────────┘
```

### Patrones de Arquitectura

#### 1. **Container/Presentational Pattern**
```
Pages (Containers)
  ↓
Features (Custom Hooks + Components)
  ↓
Components (Presentational)
  ↓
Redux Slices (State)
  ↓
Services (API calls)
```

#### 2. **Redux Toolkit with Hooks**
```typescript
// Componente usa dispatch y selector
const MyComponent = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(state => state.slice.data);

  useEffect(() => {
    dispatch(loadData());
  }, []);

  return <div>{/* render */}</div>;
};
```

#### 3. **Custom Hooks para Lógica Reutilizable**
```typescript
// Hook personalizado
const useDashboardData = () => {
  const dispatch = useAppDispatch();
  const facturas = useAppSelector(state => state.facturas);

  useEffect(() => {
    dispatch(fetchFacturas());
  }, []);

  return { facturas };
};

// Uso en componentes
const DashboardPage = () => {
  const { facturas } = useDashboardData();
  return <div>{/* render con facturas */}</div>;
};
```

#### 4. **Composición de Componentes**
```
<MainLayout>
  <DashboardPage>
    <StatsCards />
    <FilterBar />
    <FacturasTable />
    <ChartsSection>
      <BarChartFacturas />
      <LineChartMontos />
      <PieChartEstados />
    </ChartsSection>
  </DashboardPage>
</MainLayout>
```

---

## 📁 Estructura del Proyecto

### Árbol de Directorios

```
afe_frontend/
│
├── src/                              # Código fuente principal
│   │
│   ├── main.tsx                      # Entry point (React render)
│   ├── index.html                    # HTML principal
│   ├── App.tsx                       # Root component con providers
│   ├── AppRoutes.tsx                 # Configuración de rutas
│   ├── App.css
│   ├── index.css
│   │
│   ├── app/                          # Redux store y configuración
│   │   ├── store.ts                  # configureStore
│   │   ├── hooks.ts                  # useAppDispatch, useAppSelector
│   │   └── types.ts                  # RootState, AppDispatch
│   │
│   ├── features/                     # Características organizadas por módulo
│   │   │
│   │   ├── auth/                     # Autenticación
│   │   │   ├── authSlice.ts          # Redux slice para auth
│   │   │   ├── LoginPage.tsx         # Página de login
│   │   │   ├── MicrosoftCallbackPage.tsx # OAuth callback
│   │   │   ├── types.ts              # AuthState interface
│   │   │   └── selectors.ts          # Selectores Redux
│   │   │
│   │   ├── dashboard/                # Dashboard principal
│   │   │   ├── DashboardPage.tsx     # Página principal
│   │   │   ├── components/
│   │   │   │   ├── ChartsSection.tsx
│   │   │   │   ├── StatsCards.tsx
│   │   │   │   ├── EnhancedStatCard.tsx
│   │   │   │   ├── FacturasTable.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   ├── FacturaFormModal.tsx
│   │   │   │   ├── FacturaActionsMenu.tsx
│   │   │   │   ├── charts/
│   │   │   │   │   ├── BarChartFacturas.tsx
│   │   │   │   │   ├── LineChartMontos.tsx
│   │   │   │   │   ├── PieChartEstados.tsx
│   │   │   │   │   └── GaugeChartKPI.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useDashboardData.ts
│   │   │   │   ├── useDashboardStats.ts
│   │   │   │   └── useFacturaDialog.ts
│   │   │   ├── services/
│   │   │   │   └── facturas.service.ts
│   │   │   ├── types/
│   │   │   │   └── dashboard.types.ts
│   │   │   ├── utils/
│   │   │   │   ├── estadoHelpers.ts
│   │   │   │   └── formatters.ts
│   │   │   └── README.md
│   │   │
│   │   ├── facturas/                 # Gestión de facturas
│   │   │   ├── FacturasPage.tsx
│   │   │   ├── facturasSlice.ts
│   │   │   ├── services/
│   │   │   │   └── facturas.service.ts
│   │   │   └── types/
│   │   │       └── factura.types.ts
│   │   │
│   │   ├── proveedores/              # Gestión de proveedores
│   │   │   ├── ProveedoresManagementPage.tsx
│   │   │   ├── proveedoresSlice.ts
│   │   │   ├── tabs/
│   │   │   │   └── AsignacionesTab.tsx
│   │   │   └── services/
│   │   │       └── proveedores.service.ts
│   │   │
│   │   ├── email-config/             # Configuración de emails
│   │   │   ├── EmailConfigPage.tsx
│   │   │   ├── CuentaDetailPage.tsx
│   │   │   ├── emailConfigSlice.ts
│   │   │   ├── components/
│   │   │   │   ├── AddNitDialog.tsx
│   │   │   │   ├── AddNitsBulkDialog.tsx
│   │   │   │   └── CreateCuentaDialog.tsx
│   │   │   └── services/
│   │   │       └── emailConfigService.ts
│   │   │
│   │   └── admin/                    # Panel de administración
│   │       ├── ResponsablesPage.tsx  # Gestión de usuarios
│   │       └── components/
│   │           └── ResponsablesTable.tsx
│   │
│   ├── components/                   # Componentes compartidos
│   │   ├── Layout/
│   │   │   ├── MainLayout.tsx        # Layout principal con AppBar + Sidebar
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── styles.ts
│   │   │
│   │   ├── Auth/
│   │   │   ├── RoleGuard.tsx         # Protección por rol
│   │   │   ├── PrivateRoute.tsx      # Protección por autenticación
│   │   │   └── ReadOnlyWrapper.tsx   # Wrapper para modo viewer
│   │   │
│   │   ├── Notifications/
│   │   │   ├── NotificationProvider.tsx  # Context + Snackbar
│   │   │   ├── useNotification.ts    # Hook para usar notificaciones
│   │   │   └── types.ts
│   │   │
│   │   ├── Dialogs/
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── ConfirmDeleteDialog.tsx
│   │   │   └── BaseDialog.tsx
│   │   │
│   │   ├── Facturas/
│   │   │   ├── ApprovalDialog.tsx    # Diálogo de aprobación
│   │   │   ├── RejectionDialog.tsx   # Diálogo de rechazo
│   │   │   └── FacturaDetailModal.tsx
│   │   │
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── PaginationControls.tsx
│   │   │
│   │   └── ContextoHistorico.tsx    # Componente de contexto histórico
│   │
│   ├── services/                     # Servicios de API
│   │   ├── api.ts                    # Cliente Axios configurado
│   │   ├── interceptors.ts           # Interceptores de request/response
│   │   ├── auth.service.ts           # Servicio de autenticación
│   │   ├── microsoftAuth.service.ts  # OAuth Microsoft
│   │   ├── nitValidation.service.ts  # Validación de NITs
│   │   ├── emailConfigService.ts     # CRUD de correos
│   │   ├── asignacionNit.api.ts      # Asignación de NITs
│   │   ├── proveedores.api.ts        # CRUD de proveedores
│   │   └── types/
│   │       └── api.types.ts          # Interfaces de API
│   │
│   ├── theme/                        # Sistema de diseño
│   │   ├── zentriaTheme.ts           # Tema Material-UI personalizado
│   │   ├── colors.ts                 # Paleta corporativa Zentria
│   │   ├── buttonStyles.ts           # Estilos de botones
│   │   ├── typographies.ts           # Tipografías
│   │   └── README_BUTTON_STYLES.md
│   │
│   ├── constants/                    # Constantes globales
│   │   ├── roles.ts                  # Definiciones de roles
│   │   ├── estados.ts                # Estados de facturas
│   │   └── api.ts                    # Constantes de API
│   │
│   ├── types/                        # TypeScript interfaces globales
│   │   ├── factura.types.ts
│   │   ├── proveedor.types.ts
│   │   ├── user.types.ts
│   │   └── index.ts
│   │
│   ├── utils/                        # Utilidades globales
│   │   ├── logger.ts
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   └── assets/                       # Assets estáticos
│       ├── icons/
│       ├── images/
│       └── logos/
│
├── public/                           # Archivos públicos estáticos
│   ├── favicon.ico
│   ├── robots.txt
│   └── index.html
│
├── dist/                             # Build de producción (generado)
│
├── node_modules/                     # Dependencias instaladas
│
├── .env                              # Variables de entorno
├── .env.example                      # Plantilla de variables
├── .env.development                  # Variables de desarrollo
├── .env.production                   # Variables de producción
│
├── vite.config.ts                    # Configuración Vite
├── tsconfig.json                     # Configuración TypeScript base
├── tsconfig.app.json                 # Configuración TypeScript app
├── tsconfig.node.json                # Configuración TypeScript node
├── eslint.config.js                  # Configuración ESLint
│
├── package.json                      # Dependencias y scripts
├── package-lock.json
│
├── DOCUMENTACION_TECNICA_FRONTEND.md # Este archivo
└── README.md                         # README del proyecto
```

### Convenciones de Nombres

#### Archivos y Carpetas
```
 CORRECTO:
  - components/FacturasTable.tsx      (PascalCase para componentes)
  - features/dashboard/                (kebab-case para carpetas)
  - services/api.ts                    (camelCase para servicios)
  - hooks/useDashboardData.ts          (usePascalCase para custom hooks)
  - types/factura.types.ts             (kebab-case para tipos)

❌ EVITAR:
  - components/facturas_table.tsx      (snake_case)
  - Features/Dashboard/                (PascalCase para carpetas)
  - Services/API.ts                    (PascalCase para servicios)
```

#### Componentes React
```typescript
 CORRECTO:
  const MyComponent: React.FC = () => <div>content</div>;
  const useCustomHook = () => { /* logic */ };
  export default MyComponent;

❌ EVITAR:
  const my_component = () => <div>content</div>;
  function MyComponent() { return null; }  // Sin tipos
```

#### Variables y Funciones
```typescript
 CORRECTO:
  const isLoading = true;
  const facturaId = 123;
  const handleApproveFactura = () => {};

❌ EVITAR:
  const loading = true;                    // Nombres poco claros
  const id = 123;
  const approveFactura = () => {};         // Sin "handle" para eventos
```

---

## 🛠️ Stack Tecnológico

### Dependencias Principales

```json
{
  "dependencies": {
    "react": "^19.1.1",                    # Framework UI
    "react-dom": "^19.1.1",                # DOM rendering
    "react-router-dom": "^7.9.3",          # Routing
    "react-redux": "^9.2.0",               # Redux bindings
    "@reduxjs/toolkit": "^2.9.0",          # Redux utilities
    "@mui/material": "^7.3.4",             # Material Design components
    "@mui/icons-material": "^7.3.4",       # Material icons
    "@emotion/react": "^11.14.0",          # CSS-in-JS
    "@emotion/styled": "^11.14.1",         # Styled components
    "axios": "^1.12.2",                    # HTTP client
    "react-hook-form": "^7.64.0",          # Form management
    "@hookform/resolvers": "^5.2.2",       # Form validation resolvers
    "zod": "^4.1.11",                      # Schema validation
    "recharts": "^3.2.1",                  # Charts library
    "date-fns": "^4.1.0"                   # Date utilities
  },
  "devDependencies": {
    "typescript": "~5.9.3",                # TypeScript
    "vite": "^7.1.7",                      # Build tool
    "@vitejs/plugin-react": "^5.0.4",      # Vite React plugin
    "eslint": "^9.36.0",                   # Linter
    "typescript-eslint": "^8.45.0",        # TypeScript ESLint
    "eslint-plugin-react-hooks": "^5.2.0" # React Hooks rules
  }
}
```

### Versiones Recomendadas

| Dependencia | Versión | Razón |
|---|---|---|
| React | ^19.1.1 | Última versión stable con React Compiler |
| TypeScript | ~5.9 | Soporte completo de tipos modernos |
| Vite | ^7.1 | Build tool rápido y moderno |
| Material-UI | ^7.3 | Componentes UI profesionales |
| Redux Toolkit | ^2.9 | Simplifica Redux, evita boilerplate |
| React Router | ^7.9 | Routing moderno basado en data |

---

## ⚙️ Configuración y Despliegue

### Variables de Entorno

Crear `.env` basado en `.env.example`:

```env
# ============================================
# API BACKEND
# ============================================
VITE_API_URL=http://localhost:8000/api/v1

# ============================================
# AMBIENTE
# ============================================
VITE_ENV=development
```

**Por ambiente:**

`.env.development`:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_ENV=development
VITE_DEBUG=true
```

`.env.production`:
```env
VITE_API_URL=https://api.empresa.com/api/v1
VITE_ENV=production
VITE_DEBUG=false
```

**Uso en código:**
```typescript
const API_URL = import.meta.env.VITE_API_URL;
const isDevelopment = import.meta.env.VITE_ENV === 'development';
```

### Instalación Local

#### Requisitos Previos
```bash
node --version              # Node.js >= 18.0
npm --version               # npm >= 9.0
```

#### Pasos de Instalación

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd afe_frontend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env
cp .env.example .env
# Editar .env con VITE_API_URL del backend local

# 4. Ejecutar servidor de desarrollo
npm run dev
```

**Salida esperada:**
```
VITE v7.1.7  ready in 234 ms

➜  Local:   http://127.0.0.1:5173/
➜  press h + enter to show help
```

**Acceso:**
```
Frontend:  http://localhost:5173
Backend:   http://localhost:8000
Swagger:   http://localhost:8000/docs
```

### Build para Producción

```bash
# 1. Compilar TypeScript
npm run build

# 2. Preview del build
npm run preview

# 3. Archivos generados en /dist
#    - index.html
#    - assets/
#      - *.js (bundles)
#      - *.css (stylesheets)
```

### Despliegue en Producción

#### Opción 1: Nginx

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name app.empresa.com;

    # Redirigir HTTP → HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.empresa.com;

    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;

    # Servir archivos estáticos
    root /var/www/afe-frontend/dist;
    index index.html;

    # SPA: redirigir 404s a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Deploy:**
```bash
# Build local
npm run build

# Copiar dist al servidor
scp -r dist/* user@app.empresa.com:/var/www/afe-frontend/dist/

# Reiniciar Nginx
ssh user@app.empresa.com 'sudo systemctl restart nginx'
```

#### Opción 2: Docker

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build y run:**
```bash
docker build -t afe-frontend:latest .
docker run -p 80:80 -e VITE_API_URL=https://api.empresa.com/api/v1 afe-frontend:latest
```

#### Opción 3: Vercel / Netlify

**Configuración Vercel (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api_url"
  }
}
```

**Deploy:**
```bash
npm install -g vercel
vercel link                # Conectar al proyecto
vercel env add VITE_API_URL https://api.empresa.com/api/v1
vercel deploy --prod       # Deploy a producción
```

---

## 🔐 Autenticación y Autorización

### Flujo OAuth2 Microsoft

```
1. LoginPage: Usuario hace click "Sign in with Microsoft"
   ↓
2. microsoftAuth.service.ts: loginWithMicrosoft()
   ├─ GET /api/v1/auth/microsoft/authorize
   ├─ Backend retorna: { authorization_url, state }
   └─ Guarda state en sessionStorage (CSRF protection)
   ↓
3. Redirige a authorization_url (Microsoft Azure AD)
   └─ Usuario ingresa credenciales Microsoft
   ↓
4. Microsoft redirige a /auth/microsoft/callback?code=XXX&state=YYY
   ↓
5. MicrosoftCallbackPage maneja callback:
   ├─ Extrae code y state de URL
   ├─ Valida state vs sessionStorage
   ├─ GET /api/v1/auth/microsoft/callback?code=XXX
   └─ Backend intercambia por JWT
   ↓
6. Backend retorna: { access_token, user }
   ↓
7. authSlice.setCredentials(user, token)
   └─ Redux actualiza estado
   ↓
8. localStorage:
   ├─ access_token (JWT)
   └─ user (JSON)
   ↓
9. Redirige a /dashboard
```

**Código de Implementación:**

```typescript
// /features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  nombre: string;
  email: string;
  usuario: string;
  rol: 'admin' | 'responsable' | 'viewer';
  activo: boolean;
  area?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      // Guardar en localStorage
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Limpiar localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
```

**Servicio OAuth Microsoft:**

```typescript
// /services/microsoftAuth.service.ts
import apiClient from './api';

export const microsoftAuthService = {
  // Paso 1: Obtener URL de autorización
  async getAuthorizationUrl(): Promise<{
    authorization_url: string;
    state: string;
  }> {
    const response = await apiClient.get(
      '/auth/microsoft/authorize'
    );
    return response.data;
  },

  // Paso 2: Procesar callback
  async handleCallback(code: string, state: string): Promise<{
    access_token: string;
    token_type: string;
    user: User;
  }> {
    const response = await apiClient.get(
      `/auth/microsoft/callback`,
      { params: { code, state } }
    );
    return response.data;
  },

  // Login completo
  async loginWithMicrosoft(): Promise<void> {
    try {
      const { authorization_url, state } = await this.getAuthorizationUrl();

      // Guardar state para CSRF validation
      sessionStorage.setItem('oauth_state', state);

      // Redirigir a Microsoft
      window.location.href = authorization_url;
    } catch (error) {
      console.error('Error iniciar OAuth:', error);
      throw error;
    }
  },
};
```

### Control de Acceso Basado en Roles (RBAC)

**Definición de Roles:**

```typescript
// /constants/roles.ts
export enum Role {
  ADMIN = 'admin',
  RESPONSABLE = 'responsable',
  VIEWER = 'viewer',
}

export const ROLE_PERMISSIONS = {
  admin: {
    // Facturas
    canCreateFactura: true,
    canEditFactura: true,
    canDeleteFactura: true,
    canApproveFactura: true,
    canRejectFactura: true,

    // Usuarios
    canManageUsers: true,
    canCreateUser: true,
    canEditUser: true,
    canDeleteUser: true,

    // Proveedores
    canManageProviders: true,
    canCreateProvider: true,
    canEditProvider: true,
    canDeleteProvider: true,

    // Email
    canConfigureEmail: true,
    canManageEmailAccounts: true,

    // Reportes
    canViewAllReports: true,
  },

  responsable: {
    canViewFactura: true,
    canApproveFactura: true,
    canRejectFactura: true,
    canViewProviders: true,
  },

  viewer: {
    canViewFactura: true,
    canViewUsers: true,
    canViewProviders: true,
    canViewReports: true,
  },
};
```

**Componente RoleGuard:**

```typescript
// /components/Auth/RoleGuard.tsx
import { ReactNode } from 'react';
import { useAppSelector } from '@/app/hooks';
import { Role, ROLE_PERMISSIONS } from '@/constants/roles';
import { Box, Typography } from '@mui/material';

interface RoleGuardProps {
  requiredRoles?: Role[];
  requiredPermission?: keyof typeof ROLE_PERMISSIONS[Role];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard = ({
  requiredRoles,
  requiredPermission,
  children,
  fallback,
}: RoleGuardProps) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return fallback || <Typography color="error">No autorizado</Typography>;
  }

  const userRole = user.rol as Role;
  const userPermissions = ROLE_PERMISSIONS[userRole];

  // Validar rol
  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return fallback || <Typography color="error">Acceso denegado</Typography>;
  }

  // Validar permiso específico
  if (requiredPermission) {
    const hasPermission = userPermissions[
      requiredPermission as keyof typeof userPermissions
    ];
    if (!hasPermission) {
      return fallback || <Typography color="error">Permiso insuficiente</Typography>;
    }
  }

  return <>{children}</>;
};
```

**Uso en Rutas:**

```typescript
// /AppRoutes.tsx
import { RoleGuard } from '@/components/Auth/RoleGuard';

export const AppRoutes = () => (
  <Routes>
    {/* Público */}
    <Route path="/login" element={<LoginPage />} />

    {/* Protegido */}
    <Route
      path="/"
      element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }
    >
      {/* Accesible a todos */}
      <Route path="dashboard" element={<DashboardPage />} />

      {/* Solo admin y responsable */}
      <Route
        path="facturas"
        element={
          <RoleGuard
            requiredRoles={[Role.ADMIN, Role.RESPONSABLE]}
          >
            <FacturasPage />
          </RoleGuard>
        }
      />

      {/* Solo admin */}
      <Route
        path="email-config"
        element={
          <RoleGuard requiredRoles={[Role.ADMIN]}>
            <EmailConfigPage />
          </RoleGuard>
        }
      />
    </Route>
  </Routes>
);
```

---

##  Gestión de Estado (Redux)

### Estructura del Store

```typescript
// /app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import facturasReducer from '@/features/facturas/facturasSlice';
import proveedoresReducer from '@/features/proveedores/proveedoresSlice';
import emailConfigReducer from '@/features/email-config/emailConfigSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    facturas: facturasReducer,
    proveedores: proveedoresReducer,
    emailConfig: emailConfigReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones que contengan datos no-serializables
        ignoredActions: ['facturas/setFacturas'],
        ignoredPaths: ['facturas.items[].fecha'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Slices Redux

#### **authSlice** - Autenticación

```typescript
// /features/auth/authSlice.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Acciones
- setCredentials({ user, token })  // Guardar credenciales
- logout()                          // Cerrar sesión
- setLoading(boolean)               // Control de carga
```

#### **facturasSlice** - Gestión de Facturas

```typescript
interface FacturasState {
  items: Factura[];
  selectedFactura: Factura | null;
  filters: {
    estado?: string;
    proveedor?: number;
    fechaDesde?: string;
    fechaHasta?: string;
  };
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Acciones
- fetchFacturas()                  // Cargar facturas
- setFacturas(facturas)            // Actualizar lista
- updateFactura(factura)           // Actualizar factura
- setFilters(filters)              // Actualizar filtros
- setSelectedFactura(factura)      // Seleccionar una factura
```

#### **emailConfigSlice** - Configuración de Emails

```typescript
interface EmailConfigState {
  cuentas: CuentaEmail[];
  cuentaActual: CuentaDetailDTO | null;
  nits: NitAsignado[];
  historial: HistorialMovimiento[];
  estadisticas: {
    totalEnviados: number;
    totalFallidos: number;
    ultimoEnvio: string;
  };
  filtros: {
    search: string;
    estado: string;
  };
  loading: boolean;
  error: string | null;
}

// Acciones
- cargarCuentas()                  // Listar cuentas
- cargarCuentaDetalle(id)          // Detalle de cuenta
- cargarNits(cuentaId)             // NITs de cuenta
- crearCuenta(data)                // Crear nueva cuenta
- agregarNit(cuentaId, nit)        // Agregar NIT
```

### Selectores Redux

```typescript
// /features/auth/selectors.ts
import { RootState } from '@/app/store';

export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectUserRole = (state: RootState) => state.auth.user?.rol;

// /features/facturas/selectors.ts
export const selectFacturas = (state: RootState) => state.facturas.items;
export const selectFacturasLoading = (state: RootState) => state.facturas.loading;
export const selectFacturaById = (id: number) => (state: RootState) =>
  state.facturas.items.find(f => f.id === id);
export const selectFacturasFilters = (state: RootState) => state.facturas.filters;
```

### Hooks Personalizados

```typescript
// /app/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Hooks tipados
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Hooks de autenticación
export const useAuth = () => {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  const logout = () => {
    dispatch(authSlice.actions.logout());
  };

  return { user, token, isAuthenticated, logout };
};

// Hooks de facturas
export const useFacturas = () => {
  const dispatch = useAppDispatch();
  const facturas = useAppSelector((state) => state.facturas.items);
  const loading = useAppSelector((state) => state.facturas.loading);
  const filters = useAppSelector((state) => state.facturas.filters);

  const setFilters = (newFilters: typeof filters) => {
    dispatch(setFilters(newFilters));
  };

  return { facturas, loading, filters, setFilters };
};
```

---

## 🧩 Componentes Principales

### Layout Principal

```typescript
// /components/Layout/MainLayout.tsx
export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar con navegación */}
      <Sidebar open={sidebarOpen} />

      {/* Contenido principal */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* AppBar superior */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Outlet de react-router */}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>

        {/* NotificationProvider Snackbar */}
      </Box>
    </Box>
  );
};
```

### Tabla de Facturas

```typescript
// /features/dashboard/components/FacturasTable.tsx
interface FacturasTableProps {
  facturas: Factura[];
  loading?: boolean;
  onApprove?: (factura: Factura) => void;
  onReject?: (factura: Factura) => void;
  onView?: (factura: Factura) => void;
}

export const FacturasTable: React.FC<FacturasTableProps> = ({
  facturas,
  loading,
  onApprove,
  onReject,
  onView,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>N° Factura</TableCell>
            <TableCell>Proveedor</TableCell>
            <TableCell align="right">Monto</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Confianza</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {facturas.map((factura) => (
            <TableRow key={factura.id}>
              <TableCell>{factura.numero_factura}</TableCell>
              <TableCell>{factura.proveedor.razon_social}</TableCell>
              <TableCell align="right">
                ${factura.total_a_pagar.toFixed(2)}
              </TableCell>
              <TableCell>
                <Chip
                  label={factura.estado}
                  color={getEstadoColor(factura.estado)}
                />
              </TableCell>
              <TableCell>
                {factura.confianza_automatica && (
                  <Chip
                    label={`${(factura.confianza_automatica * 100).toFixed(0)}%`}
                    variant="outlined"
                  />
                )}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  {onView && (
                    <Button
                      size="small"
                      onClick={() => onView(factura)}
                    >
                      Ver
                    </Button>
                  )}
                  {onApprove && factura.estado === 'en_revision' && (
                    <Button
                      size="small"
                      color="success"
                      onClick={() => onApprove(factura)}
                    >
                      Aprobar
                    </Button>
                  )}
                  {onReject && factura.estado === 'en_revision' && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onReject(factura)}
                    >
                      Rechazar
                    </Button>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

### Diálogo de Aprobación

```typescript
// /components/Facturas/ApprovalDialog.tsx
interface ApprovalDialogProps {
  open: boolean;
  factura: Factura | null;
  loading?: boolean;
  onConfirm: (motivo?: string) => void;
  onCancel: () => void;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  factura,
  loading,
  onConfirm,
  onCancel,
}) => {
  const [motivo, setMotivo] = useState('');

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Aprobar Factura</DialogTitle>
      <DialogContent>
        {factura && (
          <>
            <Typography variant="body2" color="textSecondary">
              ¿Deseas aprobar la siguiente factura?
            </Typography>
            <Box sx={{ mt: 2, p: 1, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
              <Typography><strong>Número:</strong> {factura.numero_factura}</Typography>
              <Typography><strong>Proveedor:</strong> {factura.proveedor.razon_social}</Typography>
              <Typography><strong>Monto:</strong> ${factura.total_a_pagar.toFixed(2)}</Typography>
            </Box>
            <TextField
              fullWidth
              label="Motivo (opcional)"
              multiline
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              sx={{ mt: 2 }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={() => onConfirm(motivo)}
          variant="contained"
          color="success"
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Aprobar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### Gráficos (Charts)

```typescript
// /features/dashboard/components/charts/BarChartFacturas.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartFacturasProps {
  data: Array<{
    nombre: string;
    aprobadas: number;
    rechazadas: number;
    en_revision: number;
  }>;
}

export const BarChartFacturas: React.FC<BarChartFacturasProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="nombre" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="aprobadas" fill="#4CAF50" />
      <Bar dataKey="rechazadas" fill="#F44336" />
      <Bar dataKey="en_revision" fill="#FFC107" />
    </BarChart>
  </ResponsiveContainer>
);

// /features/dashboard/components/charts/PieChartEstados.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  aprobada: '#4CAF50',
  rechazada: '#F44336',
  en_revision: '#FFC107',
  pagada: '#2196F3',
};

interface PieChartEstadosProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export const PieChartEstados: React.FC<PieChartEstadosProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={(entry) => `${entry.name}: ${entry.value}`}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);
```

---

## 🎨 Sistema de Diseño

### Paleta Corporativa Zentria

```typescript
// /theme/colors.ts
export const zentriaColors = {
  violeta: {
    main: '#80006A',      // Morado principal
    light: '#A65C99',     // Morado claro
    dark: '#5C004D',      // Morado oscuro
    darker: '#3D0031',
    lightest: '#C493B2',
  },
  naranja: {
    main: '#FF5F3F',      // Naranja vibrante
    light: '#FFB5A6',
    dark: '#CC4B32',
    darker: '#993623',
  },
  verde: {
    main: '#00B094',      // Verde éxito
    light: '#45E3C9',
    dark: '#008C75',
  },
  azul: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1565C0',
  },
  rojo: {
    main: '#F44336',
    light: '#EF5350',
    dark: '#D32F2F',
  },
  amarillo: {
    main: '#FFF280',
    light: '#FFFABF',
    dark: '#CCC266',
  },
  gris: {
    light: '#F5F5F5',
    main: '#D7D7D7',
    dark: '#757575',
    darker: '#333333',
  },
  blanco: '#FFFFFF',
  negro: '#000000',
};
```

### Tema Material-UI

```typescript
// /theme/zentriaTheme.ts
import { createTheme } from '@mui/material/styles';
import { zentriaColors } from './colors';

export const zentriaTheme = createTheme({
  palette: {
    primary: {
      main: zentriaColors.violeta.main,
      light: zentriaColors.violeta.light,
      dark: zentriaColors.violeta.dark,
      contrastText: '#fff',
    },
    secondary: {
      main: zentriaColors.naranja.main,
      light: zentriaColors.naranja.light,
      dark: zentriaColors.naranja.dark,
    },
    success: {
      main: zentriaColors.verde.main,
      light: zentriaColors.verde.light,
      dark: zentriaColors.verde.dark,
    },
    error: {
      main: zentriaColors.rojo.main,
      light: zentriaColors.rojo.light,
      dark: zentriaColors.rojo.dark,
    },
    warning: {
      main: zentriaColors.amarillo.main,
      light: zentriaColors.amarillo.light,
      dark: zentriaColors.amarillo.dark,
    },
    info: {
      main: zentriaColors.azul.main,
      light: zentriaColors.azul.light,
      dark: zentriaColors.azul.dark,
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: zentriaColors.gris.darker,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: zentriaColors.gris.darker,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: zentriaColors.gris.darker,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${zentriaColors.violeta.dark}, ${zentriaColors.violeta.main})`,
          '&:hover': {
            background: `linear-gradient(135deg, ${zentriaColors.violeta.darker}, ${zentriaColors.violeta.dark})`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
});
```

### Estilos de Componentes

```typescript
// Ejemplo de componente con estilos Material-UI
import { styled } from '@mui/material/styles';
import { Box, Button as MuiButton } from '@mui/material';

export const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

export const PrimaryButton = styled(MuiButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  color: '#fff',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    opacity: 0.9,
  },
}));
```

---

## 🔌 Servicios y Conexión API

### Cliente HTTP (Axios)

```typescript
// /services/api.ts
import axios from 'axios';
import { store } from '@/app/store';
import { logout } from '@/features/auth/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: Agregar JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response: Manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized: Token expirado
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }

    // 403 Forbidden: Sin permisos
    if (error.response?.status === 403) {
      console.error('Acceso denegado');
    }

    // 500+ Server Error
    if (error.response?.status >= 500) {
      console.error('Error del servidor');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### Servicios Específicos

```typescript
// /services/nitValidation.service.ts
import apiClient from './api';

export const nitValidationService = {
  async validateNit(nit: string) {
    const response = await apiClient.post('/email-config/validate-nit', {
      nit,
    });
    return response.data;
  },
};

// /services/emailConfigService.ts
import apiClient from './api';

export const emailConfigService = {
  async getCuentas() {
    const response = await apiClient.get('/email-config');
    return response.data;
  },

  async getCuentaDetalle(cuentaId: number) {
    const response = await apiClient.get(`/email-config/${cuentaId}`);
    return response.data;
  },

  async createCuenta(data: any) {
    const response = await apiClient.post('/email-config', data);
    return response.data;
  },

  async updateCuenta(cuentaId: number, data: any) {
    const response = await apiClient.put(`/email-config/${cuentaId}`, data);
    return response.data;
  },

  async agregarNit(cuentaId: number, nit: string) {
    const response = await apiClient.post(
      `/email-config/${cuentaId}/nits`,
      { nit }
    );
    return response.data;
  },

  async eliminarNit(cuentaId: number, nitId: number) {
    const response = await apiClient.delete(
      `/email-config/${cuentaId}/nits/${nitId}`
    );
    return response.data;
  },
};
```

---

## 🗺️ Rutas y Navegación

### Configuración de Rutas

```typescript
// /AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Role } from '@/constants/roles';
import { RoleGuard } from '@/components/Auth/RoleGuard';
import { MainLayout } from '@/components/Layout/MainLayout';

// Pages
import { LoginPage } from '@/features/auth/LoginPage';
import { MicrosoftCallbackPage } from '@/features/auth/MicrosoftCallbackPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { FacturasPage } from '@/features/facturas/FacturasPage';
import { ProveedoresManagementPage } from '@/features/proveedores/ProveedoresManagementPage';
import { EmailConfigPage } from '@/features/email-config/EmailConfigPage';
import { CuentaDetailPage } from '@/features/email-config/CuentaDetailPage';
import { ResponsablesPage } from '@/features/admin/ResponsablesPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/microsoft/callback" element={<MicrosoftCallbackPage />} />

      {/* Protegidas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* Dashboard - Accesible a todos */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Facturas - admin, responsable, viewer */}
        <Route
          path="facturas"
          element={
            <RoleGuard requiredRoles={[Role.ADMIN, Role.RESPONSABLE, Role.VIEWER]}>
              <FacturasPage />
            </RoleGuard>
          }
        />

        {/* Proveedores - admin, viewer */}
        <Route
          path="gestion/proveedores"
          element={
            <RoleGuard requiredRoles={[Role.ADMIN, Role.VIEWER]}>
              <ProveedoresManagementPage />
            </RoleGuard>
          }
        />

        {/* Email Config - solo admin */}
        <Route
          path="email-config"
          element={
            <RoleGuard requiredRoles={[Role.ADMIN]}>
              <EmailConfigPage />
            </RoleGuard>
          }
        />
        <Route
          path="email-config/:id"
          element={
            <RoleGuard requiredRoles={[Role.ADMIN]}>
              <CuentaDetailPage />
            </RoleGuard>
          }
        />

        {/* Usuarios - admin */}
        <Route
          path="admin/responsables"
          element={
            <RoleGuard requiredRoles={[Role.ADMIN]}>
              <ResponsablesPage />
            </RoleGuard>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
```

### Navegación Sidebar

```typescript
// /components/Layout/Sidebar.tsx
const navigationItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    roles: [Role.ADMIN, Role.RESPONSABLE, Role.VIEWER],
  },
  {
    label: 'Facturas',
    path: '/facturas',
    icon: <ReceiptIcon />,
    roles: [Role.ADMIN, Role.RESPONSABLE, Role.VIEWER],
  },
  {
    label: 'Proveedores',
    path: '/gestion/proveedores',
    icon: <BusinessIcon />,
    roles: [Role.ADMIN, Role.VIEWER],
  },
  {
    label: 'Configuración Email',
    path: '/email-config',
    icon: <MailIcon />,
    roles: [Role.ADMIN],
  },
  {
    label: 'Usuarios',
    path: '/admin/responsables',
    icon: <PeopleIcon />,
    roles: [Role.ADMIN],
  },
];

export const Sidebar = () => {
  const user = useAppSelector(state => state.auth.user);
  const userRole = user?.rol as Role;

  const visibleItems = navigationItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <Drawer variant="permanent">
      <List>
        {visibleItems.map(item => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
```

---

## 📝 Formularios y Validación

### Validación con React Hook Form + Zod

```typescript
// /features/dashboard/components/FacturaFormModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Esquema de validación
const facturaSchema = z.object({
  numero_factura: z.string().min(1, 'Número de factura requerido'),
  fecha_emision: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Fecha inválida'
  ),
  proveedor_id: z.number().positive('Debe seleccionar un proveedor'),
  subtotal: z.number().positive('Subtotal debe ser positivo'),
  iva: z.number().nonnegative('IVA no puede ser negativo'),
  total_a_pagar: z.number().positive('Total debe ser positivo'),
  orden_compra_numero: z.string().optional(),
  cufe: z.string().optional(),
});

type FacturaFormData = z.infer<typeof facturaSchema>;

interface FacturaFormModalProps {
  open: boolean;
  factura?: Factura;
  onClose: () => void;
  onSubmit: (data: FacturaFormData) => Promise<void>;
}

export const FacturaFormModal: React.FC<FacturaFormModalProps> = ({
  open,
  factura,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FacturaFormData>({
    resolver: zodResolver(facturaSchema),
    defaultValues: factura || {
      numero_factura: '',
      fecha_emision: new Date().toISOString().split('T')[0],
      proveedor_id: undefined,
      subtotal: 0,
      iva: 0,
      total_a_pagar: 0,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {factura ? 'Editar Factura' : 'Nueva Factura'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Número de Factura"
            {...register('numero_factura')}
            error={!!errors.numero_factura}
            helperText={errors.numero_factura?.message}
            fullWidth
          />
          <TextField
            label="Fecha Emisión"
            type="date"
            {...register('fecha_emision')}
            error={!!errors.fecha_emision}
            helperText={errors.fecha_emision?.message}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Subtotal"
            type="number"
            inputProps={{ step: '0.01' }}
            {...register('subtotal', { valueAsNumber: true })}
            error={!!errors.subtotal}
            helperText={errors.subtotal?.message}
            fullWidth
          />
          <TextField
            label="IVA"
            type="number"
            inputProps={{ step: '0.01' }}
            {...register('iva', { valueAsNumber: true })}
            error={!!errors.iva}
            helperText={errors.iva?.message}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
```

---

## 🧪 Pruebas (Testing)

### Estructura de Tests (Planeada)

```typescript
// tests/features/dashboard/DashboardPage.test.tsx
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { store } from '@/app/store';

describe('DashboardPage', () => {
  it('debe renderizar el dashboard', () => {
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('debe mostrar tabla de facturas', () => {
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

// tests/services/nitValidation.service.test.ts
import { nitValidationService } from '@/services/nitValidation.service';
import apiClient from '@/services/api';

jest.mock('@/services/api');

describe('nitValidationService', () => {
  it('debe validar un NIT correctamente', async () => {
    const mockResponse = {
      data: {
        is_valid: true,
        nit_normalizado: '123456789-0',
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await nitValidationService.validateNit('123456789-0');

    expect(result.is_valid).toBe(true);
    expect(apiClient.post).toHaveBeenCalledWith('/email-config/validate-nit', {
      nit: '123456789-0',
    });
  });
});
```

**Frameworks Recomendados:**
- **Jest**: Framework de testing
- **Testing Library**: Componentes
- **Vitest**: Testing rápido (alternativa a Jest)
- **Cypress/Playwright**: E2E testing

---

##  Buenas Prácticas

### 1. Estructura de Componentes

```typescript
 CORRECTO:
// /components/MyComponent.tsx
import { FC } from 'react';
import { Box, Button } from '@mui/material';
import { useMyHook } from '@/hooks/useMyHook';

interface MyComponentProps {
  title: string;
  onClick: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onClick }) => {
  const { data, loading } = useMyHook();

  return (
    <Box>
      <h1>{title}</h1>
      <Button onClick={onClick} disabled={loading}>
        Click me
      </Button>
    </Box>
  );
};

❌ EVITAR:
// Componentes sin tipos
export function MyComponent(props) {
  return <div>{props.title}</div>;
}

// Props no tipadas
export const MyComponent = (props) => <div>{props.title}</div>;
```

### 2. Hooks Personalizados

```typescript
 CORRECTO:
// /hooks/useFetch.ts
import { useState, useEffect } from 'react';

interface UseFetchOptions {
  skip?: boolean;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export const useFetch = <T,>(
  url: string,
  options?: UseFetchOptions
): UseFetchReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options?.skip) return;

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options?.skip]);

  return { data, loading, error };
};

// Uso:
const { data: facturas, loading } = useFetch<Factura[]>('/facturas');
```

### 3. Naming Conventions

```typescript
 CORRECTO:
// Eventos
const handleClickButton = () => {};
const handleFormSubmit = () => {};
const handleChangePage = () => {};

// Booleanos
const isLoading = true;
const hasError = false;
const canDelete = true;
const shouldUpdate = false;

// Callbacks
const onApproveFactura = () => {};
const onErrorHandler = () => {};

❌ EVITAR:
const clickButton = () => {};        // Falta "handle"
const loading = true;                // No indica booleano
const canDelete = true;              // Debería ser "can" o "is"
const approveFactura = () => {};     // Falta "on" para callbacks
```

### 4. Organización de Imports

```typescript
 CORRECTO:
// 1. React y librerías externas
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField } from '@mui/material';

// 2. Redux
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchFacturas } from '@/features/facturas/facturasSlice';

// 3. Componentes locales
import { FacturasTable } from './FacturasTable';
import { FilterBar } from './FilterBar';

// 4. Types e interfaces
import type { Factura } from '@/types/factura.types';

// 5. Utilidades y constantes
import { formatDate } from '@/utils/formatters';
import { ROLES } from '@/constants/roles';
```

### 5. Performance

```typescript
 OPTIMIZACIONES:

// Memorizar componentes que no cambian frecuentemente
export const MyComponent = memo(MyComponentBody);

// Memorizar callbacks
const handleApprove = useCallback(() => {
  // ...
}, [dependencies]);

// Selectores memoizados
const selectUserRole = (state: RootState) => state.auth.user?.rol;
const userRole = useAppSelector(selectUserRole);

// Lazy loading de rutas
const LazyDashboard = lazy(() =>
  import('@/features/dashboard/DashboardPage')
);

export const AppRoutes = () => (
  <Routes>
    <Route
      path="dashboard"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <LazyDashboard />
        </Suspense>
      }
    />
  </Routes>
);
```

---

## 🚀 Futuras Mejoras

### Corto Plazo (1-2 meses)

- [ ] Agregar suite completa de tests (Jest + React Testing Library)
- [ ] Implementar dark mode
- [ ] Agregar más validaciones en formularios
- [ ] Mejorar mensajes de error en UI
- [ ] Cacheo inteligente con React Query/SWR
- [ ] Paginación mejorada con cursor-based

### Mediano Plazo (3-6 meses)

- [ ] Internacionalización (i18n) - ES, EN, PT
- [ ] PWA (Progressive Web App)
- [ ] Offline-first capabilities
- [ ] Mejorar performance: code splitting, lazy loading
- [ ] Agregar más tipos de gráficos y análisis
- [ ] Sistema de notificaciones en tiempo real (WebSockets)

### Largo Plazo (6-12 meses)

- [ ] Mobile app (React Native o Flutter)
- [ ] Integración con herramientas de BI (Tableau, Looker)
- [ ] Machine Learning predictions en UI
- [ ] Dashboard personalizable (drag & drop widgets)
- [ ] Soporte para múltiples idiomas y regiones
- [ ] Integración con más proveedores OAuth (Google, GitHub)

### Limitaciones Actuales

1. **Sin Tests**: No hay cobertura de testing automatizado
2. **Sin PWA**: No funciona offline
3. **Sin i18n**: Solo español
4. **Performance**: Sin code-splitting ni lazy loading de rutas
5. **Sin Cacheo**: Cada request va al servidor
6. **Sin Notificaciones RT**: Usa polling en lugar de WebSockets

---

## 📚 Recursos y Referencias

### Documentación Oficial

- [React 19 Documentation](https://react.dev)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [React Router Documentation](https://reactrouter.com)
- [Material-UI Documentation](https://mui.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)

### Herramientas Útiles

- **React DevTools**: Inspeccionar componentes React
- **Redux DevTools**: Inspeccionar estado y acciones
- **ESLint**: Linting de código
- **Prettier**: Formateador de código automático
- **Postman/Insomnia**: Testing de APIs

### Estándares de Código

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [React Best Practices](https://react.dev/learn)

---

## 📞 Contacto y Soporte

| Rol | Contacto | Disponibilidad |
|-----|----------|---|
| **Frontend Lead** | Equipo Frontend | Lun-Vie 8:00-18:00 |
| **Design System** | Design Team | Lun-Vie 9:00-17:00 |
| **Devops** | DevOps Team | 24/7 (on-call) |

---

##  Historial de Cambios

| Versión | Fecha | Cambios |
|---|---|---|
| 2.0 | Nov 2024 | Documentación completa con React 19 |
| 1.0 | Oct 2024 | Versión inicial |

---

**Documento Generado:** Noviembre 2024
**Última Actualización:** 2024-11-06
**Licencia:** MIT

Este documento está bajo licencia MIT y puede ser utilizado libremente en el proyecto AFE.
