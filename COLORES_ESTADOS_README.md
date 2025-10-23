# Sistema de Colores para Estados de Facturas

## Paleta de Colores Mejorada y Sincronizada

Este documento describe la paleta de colores utilizada en todo el sistema AFE Frontend para representar los diferentes estados de facturas, siguiendo las mejores prácticas de UX/UI.

---

## Colores por Estado

### 🟢 Verde (Success) - Aprobadas Manualmente
- **Color**: `#00B094` (zentriaColors.verde.main)
- **Material-UI**: `color="success"`
- **Uso**: Facturas aprobadas manualmente por un usuario
- **Estados**: `aprobada`, `aprobado`, `aprobada_manual`, `pagada`
- **Significado**: Éxito confirmado, acción completada exitosamente

### 🔵 Cyan/Azul Claro (Info) - Aprobadas Automáticamente
- **Color**: `#45E3C9` (zentriaColors.verde.light)
- **Material-UI**: `color="info"`
- **Uso**: Facturas aprobadas automáticamente por el sistema
- **Estados**: `aprobada_auto`
- **Significado**: Éxito automatizado, procesamiento sin intervención humana
- **Diferenciación**: Más claro que las aprobadas manuales para distinguir visualmente

### 🟡 Amarillo/Ámbar (Warning) - En Revisión
- **Color**: `#f59e0b` (Amber 500)
- **Material-UI**: `color="warning"`
- **Uso**: Facturas pendientes de revisión o en proceso
- **Estados**: `en_revision`, `pendiente_revision`
- **Significado**: Requiere atención, estado pendiente
- **Nota**: Se usa Amber 500 en lugar del amarillo pastel corporativo para mejor visibilidad

### 🟠 Naranja (Error) - Rechazadas
- **Color**: `#FF5F3F` (zentriaColors.naranja.main)
- **Material-UI**: `color="error"`
- **Uso**: Facturas rechazadas
- **Estados**: `rechazada`, `rechazado`
- **Significado**: Error, acción negativa, requiere corrección

---

## Implementación

### 1. Dashboard Constants (`src/features/dashboard/constants/index.ts`)
```typescript
export const ESTADO_COLORS: Record<EstadoFactura, 'success' | 'info' | 'error' | 'warning' | 'default'> = {
  aprobado: 'success',      // Verde - Aprobado manual
  aprobada: 'success',      // Verde - Aprobado manual
  aprobada_auto: 'info',    // Cyan - Aprobado automático
  rechazado: 'error',       // Naranja - Rechazado
  rechazada: 'error',       // Naranja - Rechazado
  en_revision: 'warning',   // Amarillo - En revisión
  pagada: 'success',        // Verde - Pagada
};
```

### 2. Tarjetas de Estadísticas (`src/features/dashboard/components/StatsCards.tsx`)
```typescript
{
  key: 'en_revision',
  color: '#f59e0b',  // Amber 500
  ...
},
{
  key: 'aprobadas',
  color: zentriaColors.verde.main,  // #00B094
  ...
},
{
  key: 'aprobadas_auto',
  color: '#45E3C9',  // Verde claro
  ...
},
{
  key: 'rechazadas',
  color: zentriaColors.naranja.main,  // #FF5F3F
  ...
}
```

### 3. Gráficos (`src/features/dashboard/components/charts/PieChartEstados.tsx`)
```typescript
const COLORS = {
  pendientes: '#f59e0b',                  // Amber 500
  en_revision: '#f59e0b',                 // Amber 500
  aprobadas: zentriaColors.verde.main,    // #00B094
  aprobadas_auto: '#45E3C9',              // Verde claro
  rechazadas: zentriaColors.naranja.main, // #FF5F3F
};
```

### 4. Tema Material-UI (`src/theme/zentriaTheme.ts`)
```typescript
warning: {
  main: '#f59e0b',       // Amber 500
  light: '#fbbf24',      // Amber 400
  dark: '#d97706',       // Amber 600
  contrastText: '#000000',
}
```

### 5. Componentes de Facturas
En `FacturasPage.tsx` y otros componentes que muestran estados:
```typescript
const getEstadoColor = (estado: string): 'success' | 'info' | 'error' | 'warning' | 'default' => {
  switch (estado) {
    case 'aprobada_auto':
      return 'info';        // Cyan
    case 'aprobada_manual':
    case 'aprobada':
    case 'aprobado':
      return 'success';     // Verde
    case 'rechazada':
    case 'rechazado':
      return 'error';       // Naranja
    case 'pendiente_revision':
    case 'en_revision':
      return 'warning';     // Amarillo
    default:
      return 'default';
  }
};
```

---

## Principios de Diseño

### 1. **Consistencia**
Todos los componentes usan la misma paleta de colores para el mismo estado, garantizando una experiencia visual coherente en toda la aplicación.

### 2. **Accesibilidad**
- Los colores tienen suficiente contraste para ser legibles
- Se usa Amber 500 (#f59e0b) en lugar de amarillo pastel para mejor visibilidad
- El texto en chips de advertencia usa negro para máximo contraste

### 3. **Diferenciación Visual**
- **Aprobadas manuales** (verde oscuro) vs **Aprobadas automáticas** (verde claro/cyan)
- Esta distinción ayuda a los usuarios a identificar rápidamente el origen de la aprobación

### 4. **Semántica de Color**
- 🟢 Verde = Éxito/Completado
- 🔵 Azul/Cyan = Información/Automatizado
- 🟡 Amarillo = Advertencia/Pendiente
- 🟠 Naranja = Error/Rechazado

---

## Uso en Componentes

### Chips de Estado
```tsx
<Chip
  label={getEstadoLabel(factura.estado)}
  color={getEstadoColor(factura.estado)}
  size="small"
/>
```

### Tarjetas de Estadísticas
Las tarjetas usan gradientes sutiles basados en el color principal:
```tsx
bgGradient: `linear-gradient(135deg, ${color}10, ${color}05)`
border: `1px solid ${color}30`
```

### Gráficos
Los gráficos de pastel, barras y líneas usan los mismos colores para mantener la consistencia visual.

---

## Mantenimiento

Al agregar nuevos estados:

1. Actualizar `EstadoFactura` en `src/types/factura.types.ts`
2. Agregar el color en `ESTADO_COLORS` en `src/features/dashboard/constants/index.ts`
3. Agregar el label en `ESTADO_LABELS` en el mismo archivo
4. Actualizar las funciones `getEstadoColor()` locales si existen
5. Agregar el color en los gráficos si es necesario

---

## Referencias

- Colores corporativos: `src/theme/colors.ts`
- Tema Material-UI: `src/theme/zentriaTheme.ts`
- Constantes de estados: `src/features/dashboard/constants/index.ts`
- Tipos de estados: `src/types/factura.types.ts`

---

**Fecha de actualización**: 2025-10-23
**Versión**: 1.0
**Autor**: Sistema AFE Frontend
