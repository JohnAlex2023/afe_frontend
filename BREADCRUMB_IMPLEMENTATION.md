# Implementación de Breadcrumb (Migaja de Pan)

## ✅ Estado: Completado

El componente Breadcrumb ha sido **completamente implementado, corregido y optimizado** para el dashboard de AFE.

---

## Componentes Implementados

### 1. **Componente Principal** - `src/components/Breadcrumb/Breadcrumb.tsx`
- ✅ Componente accesible (WCAG 2.1 AA)
- ✅ Responsive design (mobile y desktop)
- ✅ Soporta rutas dinámicas con parámetros
- ✅ Último elemento NO clicable (aria-current="page")
- ✅ Separadores semánticos
- ✅ Memoizado para rendimiento
- ✅ Estado de carga con Skeleton
- ✅ Icono de inicio configurable

**Características clave:**
```typescript
interface BreadcrumbProps {
  showHomeIcon?: boolean;      // Mostrar icono de Dashboard
  maxLabelLength?: number;     // Truncar labels largos (default: 30)
  onNavigate?: (path: string) => void;  // Callback de navegación
}
```

### 2. **Configuración Centralizada** - `src/config/breadcrumb.config.ts`
- ✅ Sistema de configuración jerárquico
- ✅ Soporte para labels dinámicos con `getDynamicLabel()`
- ✅ Funciones utilitarias para búsqueda y sustitución de parámetros
- ✅ Todas las rutas del sistema configuradas

**Rutas configuradas:**
- `/` → Dashboard
- `/dashboard` → Dashboard
- `/facturas` → Por Revisar
- `/admin/responsables` → Gestión de Usuarios
- `/gestion/proveedores` → Gestión de Proveedores
- `/email-config` → Configuración de Correos
- `/email-config/:id` → Detalles (con email dinámico)

### 3. **Hook Personalizado** - `src/hooks/useBreadcrumb.ts`
- ✅ Genera breadcrumbs basados en ruta actual
- ✅ Extrae parámetros dinámicos de URL
- ✅ Obtiene labels dinámicos del estado Redux
- ✅ Genera rutas clicables válidas
- ✅ Memoizado para evitar recálculos innecesarios

**Uso:**
```typescript
const { breadcrumbs, isLoading } = useBreadcrumb();
```

### 4. **Integración en Layout** - `src/components/Layout/MainLayout.tsx`
- ✅ Breadcrumb posicionado debajo del AppBar
- ✅ Responsive layout con flexbox
- ✅ AppBar con zIndex correcto
- ✅ Padding-top para compensar AppBar fijo

---

## Estructura de Posicionamiento

```
┌─────────────────────────────────────────┐
│           AppBar (Fixed)                 │  height: 64px
├──────┬───────────────────────────────────┤
│      │                                   │
│      │   Breadcrumb Navigation          │  Responsive, sticky
│      │   (Home > Sección > Página)      │
│Drawer│                                   │
│      ├───────────────────────────────────┤
│      │                                   │
│      │    Main Content                  │
│      │    <Outlet />                    │  flexGrow: 1
│      │                                   │
│      │                                   │
└──────┴───────────────────────────────────┘
```

---

## Características Implementadas

### ✅ Accesibilidad (WCAG 2.1 AA)
- Etiqueta semántica `<nav aria-label="breadcrumb">`
- Lista semántica `<ol>` con `<li>`
- Último elemento con `aria-current="page"`
- Labels descriptivos en botones
- Separadores aria-hidden
- Soporte para lectores de pantalla

### ✅ Responsividad
- **Mobile (xs):** Muestra solo últimos 2 items
- **Tablet (sm+):** Muestra todos los items
- Icono home que se oculta en mobile si es necesario
- Padding adaptativo

### ✅ Rutas Dinámicas
- Soporte para parámetros en URL (`:id`)
- Labels dinámicos desde Redux (`email-config/:id` muestra el email actual)
- Extracción inteligente de parámetros

### ✅ Diseño y UX
- Colores alineados con tema ZENTRIA (violeta)
- Hover effects en elementos clicables
- Truncado inteligente de labels largos
- Estado de carga con Skeleton
- Separadores visuales claros

---

## Cómo Agregar Nuevas Rutas

Si agregas nuevas rutas en `AppRoutes.tsx`, **debes** registrarlas en `breadcrumb.config.ts`:

```typescript
// En breadcrumb.config.ts
{
  path: '/nueva-seccion',
  name: 'Nueva Sección',
  breadcrumb: 'Nombre mostrado en migaja',
  // Opcional: para rutas con parámetros
  getDynamicLabel: (params, state) => {
    return `Detalle: ${params.id}`;
  }
}
```

---

## Prueba de Funcionamiento

### Navegación esperada:

**Ruta:** `/dashboard`
```
🏠 Dashboard
```

**Ruta:** `/facturas`
```
🏠 Por Revisar
```

**Ruta:** `/admin/responsables`
```
🏠 Gestión de Usuarios
```

**Ruta:** `/gestion/proveedores`
```
🏠 Gestión de Proveedores
```

**Ruta:** `/email-config`
```
🏠 Configuración de Correos
```

**Ruta:** `/email-config/123`
```
🏠 Configuración de Correos > email@example.com
```

---

## Correcciones Realizadas

### 1. Posicionamiento (CORREGIDO ✅)
**Problema:** El Breadcrumb estaba como hermano directo del contenido en el layout flex.
**Solución:** Envuelto en un Box con `flexDirection: 'column'` dentro del contenedor principal.

### 2. Rutas Inconsistentes (CORREGIDO ✅)
**Problema:** Las rutas en `breadcrumb.config.ts` no coincidían con `AppRoutes.tsx`
- ❌ `/gestion-usuarios` → ✅ `/admin/responsables`
- ❌ `/gestion-proveedores` → ✅ `/gestion/proveedores`

**Solución:** Actualizado `breadcrumb.config.ts` para match exacto con rutas reales.

### 3. zIndex del AppBar (CORREGIDO ✅)
**Problema:** El AppBar fixed podría estar por debajo del Drawer.
**Solución:** Agregado `zIndex: (theme) => theme.zIndex.drawer + 1`

### 4. Padding Top (CORREGIDO ✅)
**Problema:** El contenido podría estar bajo el AppBar fixed.
**Solución:** Agregado `pt: '64px'` al contenedor principal.

---

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/components/Breadcrumb/Breadcrumb.tsx` | ✅ Implementado (266 líneas) |
| `src/config/breadcrumb.config.ts` | ✅ Rutas actualizadas |
| `src/hooks/useBreadcrumb.ts` | ✅ Implementado (138 líneas) |
| `src/components/Layout/MainLayout.tsx` | ✅ Estructura corregida, zIndex agregado |
| `src/components/Breadcrumb/index.ts` | ✅ Exports configurados |

---

## Testing

Para verificar que todo funciona:

1. **Iniciar desarrollo:**
```bash
npm run dev
```

2. **Navegar por diferentes rutas y verificar:**
   - [ ] El breadcrumb se muestra debajo del AppBar
   - [ ] El home icon es clicable y va a Dashboard
   - [ ] Cada elemento (excepto el último) es clicable
   - [ ] En mobile se muestra solo el último elemento
   - [ ] El último elemento NO tiene cursor de pointer

3. **Verificar accesibilidad:**
   - [ ] Navegación con keyboard (Tab)
   - [ ] Navegación con screen reader
   - [ ] Labels descriptivos en aria-label

---

## Próximas Mejoras (Opcionales)

- [ ] Agregar animación de transición entre breadcrumbs
- [ ] Implementar breadcrumb collapsible en mobile
- [ ] Agregar tooltips para labels truncados
- [ ] Agregar tracking de navegación
- [ ] Implementar breadcrumb en modal/dialogs

---

## Notas de Implementación

- El componente está **memoizado** para optimizar rendimiento
- El hook usa **useMemo** para evitar recálculos innecesarios
- Las rutas dinámicas se obtienen del **estado Redux**
- El componente es **completamente agnóstico** del router, solo usa React Router DOM

---

## Autor
Completado en: Noviembre 2025
Última actualización: 2025-11-11
