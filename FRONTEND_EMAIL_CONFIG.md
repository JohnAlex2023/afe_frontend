# 🎨 Frontend - Configuración de Correos

## 📋 Resumen

Frontend profesional y moderno para gestión de configuración de extracción de correos corporativos, construido con:

- ⚛️ **React 19** + **TypeScript**
- 🎨 **Material-UI (MUI)** para componentes
- 🔄 **Redux Toolkit** para estado global
- 📝 **React Hook Form** + **Zod** para formularios
- 🚀 **Vite** para desarrollo y build

## 🎯 Características Implementadas

### ✅ Página Principal - Lista de Cuentas
**Ruta:** `/email-config`

**Características:**
- 📊 **Dashboard con estadísticas globales**
  - Total de cuentas
  - Cuentas activas
  - NITs configurados
  - NITs activos
- 🔍 **Búsqueda en tiempo real**
- 🎛️ **Filtros:**
  - Solo cuentas activas
  - Por organización
- 📱 **Responsive design** (móvil, tablet, desktop)
- ⚡ **Acciones rápidas:**
  - Ver detalles
  - Activar/Desactivar cuenta
  - Eliminar cuenta
- 🎨 **Tarjetas con diseño moderno:**
  - Gradientes de colores
  - Animaciones hover
  - Badges de estado
  - Estadísticas visuales

### ✅ Página de Detalle - Gestión de NITs
**Ruta:** `/email-config/:id`

**Características:**
- 📑 **3 pestañas organizadas:**

  **1. NITs Configurados**
  - Tabla completa de NITs
  - Búsqueda por NIT o nombre de proveedor
  - Filtro de solo activos
  - Acciones: Activar/Desactivar/Eliminar
  - Agregar NIT individual
  - Importar múltiples NITs (bulk)

  **2. Estadísticas**
  - Resumen de últimos 30 días
  - Tasa de éxito
  - Facturas procesadas
  - Tiempo promedio de ejecución
  - Última extracción

  **3. Historial de Extracciones**
  - Tabla con todas las ejecuciones
  - Fecha, correos procesados, facturas encontradas
  - Estado de éxito/error
  - Tiempos de ejecución

- 🎨 **Header con gradiente**
- 📊 **4 tarjetas de métricas rápidas**
- 🔄 **Botón de actualizar datos**

### ✅ Diálogos Profesionales

**1. Crear Nueva Cuenta**
- Formulario completo con validación
- Agregar NITs iniciales (opcional)
- Configuración de límites y días
- Vista previa de NITs agregados

**2. Agregar NIT Individual**
- Formulario simple
- Validación en tiempo real
- Campos opcionales (nombre, notas)

**3. Importar NITs en Bulk**
- Textarea para pegar múltiples NITs
- Soporta formatos:
  - Separados por comas
  - Separados por espacios
  - En líneas diferentes
- Vista previa con validación
- Resultado detallado:
  - NITs agregados
  - NITs duplicados
  - NITs con error

**4. Confirmación de Eliminación**
- Diálogo visual con íconos
- Diferentes estilos según severidad
- Mensajes claros

## 📁 Estructura de Archivos Creados

```
afe_frontend/src/
├── features/email-config/
│   ├── EmailConfigPage.tsx          # Página principal (lista)
│   ├── CuentaDetailPage.tsx         # Página de detalle con tabs
│   ├── emailConfigSlice.ts          # Redux slice
│   └── components/
│       ├── CreateCuentaDialog.tsx   # Dialog crear cuenta
│       ├── AddNitDialog.tsx         # Dialog agregar NIT
│       └── AddNitsBulkDialog.tsx    # Dialog importar bulk
├── services/
│   └── emailConfigService.ts        # Servicio API
├── components/common/
│   └── ConfirmDialog.tsx            # Dialog confirmación reutilizable
├── app/
│   └── store.ts                     # Redux store (actualizado)
├── AppRoutes.tsx                    # Rutas (actualizado)
└── components/Layout/
    └── MainLayout.tsx               # Menú navegación (actualizado)
```

## 🚀 Instalación y Uso

### 1. Instalar Dependencias

```bash
cd afe_frontend
npm install
```

### 2. Configurar API URL

Crear/editar `.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Iniciar Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 4. Build para Producción

```bash
npm run build
```

## 🎨 Diseño y UX

### Paleta de Colores

**Gradientes Modernos:**
- Violeta (Primary): `#667eea → #764ba2`
- Rosa (Activas): `#f093fb → #f5576c`
- Cyan (Info): `#4facfe → #00f2fe`
- Verde (Success): `#43e97b → #38f9d7`

### Animaciones

- ✨ Hover effects en tarjetas
- 🎭 Transformaciones suaves
- 📊 Transiciones de tabs
- 💫 Loading states

### Responsive Breakpoints

- 📱 **Mobile**: < 600px
- 📲 **Tablet**: 600px - 960px
- 💻 **Desktop**: > 960px
- 🖥️ **Large Desktop**: > 1280px

## 🔗 Navegación

### Menú del Sistema

El nuevo módulo aparece en el menú lateral (solo para administradores):

```
Dashboard
Facturas Pendientes
─────────────────
Responsables (Admin)
Gestión de Proveedores (Admin)
📧 Configuración de Correos (Admin) ← NUEVO
```

### Rutas Protegidas

Todas las rutas requieren autenticación y rol de administrador:

```typescript
/email-config           → Lista de cuentas
/email-config/:id       → Detalle de cuenta
```

## 🔌 Integración con Backend

### Endpoints Utilizados

```typescript
// Cuentas
GET    /api/v1/email-config/cuentas
GET    /api/v1/email-config/cuentas/:id
POST   /api/v1/email-config/cuentas
PUT    /api/v1/email-config/cuentas/:id
DELETE /api/v1/email-config/cuentas/:id
POST   /api/v1/email-config/cuentas/:id/toggle-activa

// NITs
GET    /api/v1/email-config/nits/cuenta/:id
POST   /api/v1/email-config/nits
POST   /api/v1/email-config/nits/bulk
PUT    /api/v1/email-config/nits/:id
DELETE /api/v1/email-config/nits/:id
POST   /api/v1/email-config/nits/:id/toggle-activo

// Historial y Estadísticas
GET    /api/v1/email-config/historial/cuenta/:id
GET    /api/v1/email-config/estadisticas/cuenta/:id
```

### Estado Global (Redux)

```typescript
{
  emailConfig: {
    cuentas: CuentaCorreoSummary[],
    cuentaActual: CuentaCorreoDetalle | null,
    nits: NitConfiguracion[],
    historial: HistorialExtraccion[],
    estadisticas: EstadisticasExtraccion | null,
    filtros: {
      solo_activas: boolean,
      organizacion: string | null,
      busqueda: string
    },
    loading: ...,
    error: string | null
  }
}
```

## 💡 Flujo de Trabajo del Usuario

### Escenario 1: Agregar Nueva Cuenta

1. Usuario entra a `/email-config`
2. Click en "Nueva Cuenta"
3. Completa formulario:
   - Email corporativo
   - Nombre descriptivo
   - Organización
   - Límites y días
   - NITs iniciales (opcional)
4. Click "Crear Cuenta"
5. ✅ Cuenta creada y visible en la lista

### Escenario 2: Gestionar NITs

1. Usuario selecciona cuenta de la lista
2. Click "Ver Detalles"
3. Va a pestaña "NITs Configurados"
4. Opciones:
   - **Agregar uno por uno**: Click "Agregar NIT"
   - **Importar múltiples**: Click "Importar Múltiples"
5. Para importar múltiples:
   - Pega lista de NITs
   - Sistema muestra vista previa
   - Click "Agregar X NITs"
   - Ve resultado detallado
6. ✅ NITs agregados y listos para extracción

### Escenario 3: Ver Estadísticas

1. Usuario entra al detalle de cuenta
2. Va a pestaña "Estadísticas"
3. Ve métricas:
   - Total ejecuciones
   - Tasa de éxito
   - Facturas procesadas
   - Tiempo promedio
4. Va a pestaña "Historial"
5. Ve tabla completa de ejecuciones

## 🎓 Componentes Reutilizables

### ConfirmDialog

```typescript
<ConfirmDialog
  open={open}
  title="¿Eliminar cuenta?"
  message="Esta acción no se puede deshacer..."
  confirmText="Eliminar"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  severity="error"
/>
```

### EmailConfigService

```typescript
// Ejemplo de uso
import emailConfigService from '@/services/emailConfigService';

// Listar cuentas
const cuentas = await emailConfigService.listarCuentas({
  solo_activas: true
});

// Agregar NITs en bulk
const result = await emailConfigService.crearNitsBulk({
  cuenta_correo_id: 1,
  nits: ['123456', '789012']
});
```

## 🐛 Troubleshooting

### Error: "Failed to fetch"

**Problema:** No puede conectar al backend

**Solución:**
1. Verificar que el backend esté corriendo en `http://localhost:8000`
2. Verificar `VITE_API_URL` en `.env`
3. Revisar CORS en el backend

### Error: "401 Unauthorized"

**Problema:** Token expirado o inválido

**Solución:**
1. Hacer logout y login nuevamente
2. El sistema redirige automáticamente al login

### NITs no aparecen después de agregar

**Problema:** Caché desactualizado

**Solución:**
1. Click en botón "Actualizar" (🔄)
2. O recargar la página

## 📱 Screenshots

### Página Principal
```
┌─────────────────────────────────────────────────────────┐
│  📧 Configuración de Correos        [Actualizar] [Nueva]│
├─────────────────────────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                    │
│  │  3  │  │  2  │  │ 75  │  │ 70  │                    │
│  │Total│  │Activ│  │NITs │  │Activ│                    │
│  └─────┘  └─────┘  └─────┘  └─────┘                    │
│                                                          │
│  🔍 Buscar... [Solo activas ☑]                          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ✅ ACTIVA                                          │ │
│  │ 📧 facturacion@empresa.com                         │ │
│  │    Angiografía de Colombia                         │ │
│  │    📊 30 NITs (28 activos)                         │ │
│  │    [Ver Detalles] [Desactivar]                     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Página de Detalle
```
┌─────────────────────────────────────────────────────────┐
│  ← Volver                                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 📧 facturacion@empresa.com                         │ │
│  │    Angiografía de Colombia                         │ │
│  │    [Actualizar] [Editar]                           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [NITs] [Estadísticas] [Historial]                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🔍 Buscar... [Solo activos] [+NIT] [Importar]     │ │
│  │                                                     │ │
│  │ NIT         Proveedor     Estado    Acciones       │ │
│  │ 17343874   Proveedor ABC  ✅ Activo  [⚙️] [❌]     │ │
│  │ 47425554   Empresa XYZ    ✅ Activo  [⚙️] [❌]     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🔒 Seguridad

- ✅ Rutas protegidas con autenticación
- ✅ Solo usuarios con rol "admin" pueden acceder
- ✅ Tokens JWT en headers automáticos
- ✅ Validación de formularios en cliente y servidor
- ✅ Confirmación para acciones destructivas

## 🚀 Próximas Mejoras (Opcionales)

- [ ] Exportar configuración a JSON
- [ ] Importar configuración desde JSON
- [ ] Duplicar cuenta existente
- [ ] Gráficos de estadísticas (charts)
- [ ] Notificaciones en tiempo real
- [ ] Drag & drop para ordenar NITs
- [ ] Etiquetas/tags para NITs
- [ ] Búsqueda avanzada con múltiples filtros

## 📞 Soporte

**Archivos principales a revisar:**
- Redux State: `src/features/email-config/emailConfigSlice.ts`
- API Service: `src/services/emailConfigService.ts`
- Componentes: `src/features/email-config/`

---

**Última actualización:** 2025-10-11
**Versión:** 1.0
**Autor:** Frontend AFE - Email Config Module
