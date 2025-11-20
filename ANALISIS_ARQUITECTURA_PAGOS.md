# 📊 ANÁLISIS DE ARQUITECTURA - IMPLEMENTACIÓN DE PAGOS CON CONTROL DE ROLES

**Fecha:** 20 Noviembre 2025
**Status:** Análisis Pre-Implementación
**Objetivo:** Evitar duplicación de código y reutilizar infraestructura existente

---

## ✅ ANÁLISIS DE CÓDIGO EXISTENTE

### Frontend - Sistema de Permisos Existente

**Ubicación:** `src/constants/roles.ts`

#### ¿Qué EXISTE?
```typescript
✓ ROLES enum con: ADMIN, RESPONSABLE, CONTADOR, VIEWER
✓ ROLE_LABELS - Traducciones de roles
✓ ROLE_DESCRIPTIONS - Descripciones detalladas
✓ ROLE_PERMISSIONS - Matriz de permisos por rol
✓ hasPermission(role, permission) - Función utilitaria
✓ getRoleLabel(role) - Función utilitaria
✓ getRoleDescription(role) - Función utilitaria
```

#### ¿Qué permisos EXISTEN?
```javascript
ROLE_PERMISSIONS = {
  admin: { canCreate, canEdit, canDelete, canApprove, canReject, canViewAll, ... },
  responsable: { canApprove, canReject, canViewPDF, canDevolverFactura: false },
  contador: { canViewAll, canViewUsers, canViewProviders, canViewPDF, canDevolverFactura },
  viewer: { canViewAll, canViewUsers, canViewProviders, canViewPDF }
}
```

### Frontend - Estado de Autenticación

**Ubicación:** `src/features/auth/authSlice.ts`

#### ¿Qué EXISTE?
```typescript
✓ Interface User con: id, nombre, email, usuario, area, rol, activo
✓ Redux Slice: setCredentials, logout, setLoading
✓ Persistencia en localStorage
✓ Estado de autenticación (isAuthenticated, loading)
```

### Backend - Sistema de Roles

**Ubicación:** `app/models/role.py`, `app/api/v1/routers/auth.py`

#### ¿Qué EXISTE?
```python
✓ Modelo Role: id, nombre (unique)
✓ Relación Responsable ↔ Role (One-to-Many)
✓ Endpoints de autenticación: login, logout, Microsoft OAuth
✓ Funciones de seguridad: verify_password, create_access_token, hash_password
```

---

## 🎯 ESTRATEGIA DE IMPLEMENTACIÓN (SIN DUPLICACIÓN)

### Plan A: REUTILIZAR + EXTENDER (RECOMENDADO) ✅

#### Paso 1: EXTENDER `ROLE_PERMISSIONS` existente

**Archivo:** `src/constants/roles.ts`

Agregar nuevos permisos de pago al objeto `ROLE_PERMISSIONS`:

```typescript
ROLE_PERMISSIONS = {
  admin: {
    // Permisos existentes ...
    canViewPayments: true,        // NUEVO
    canRegisterPayment: true,     // NUEVO
    canViewPaymentHistory: true,  // NUEVO
    canEditPayment: true,         // NUEVO
    canDeletePayment: true,       // NUEVO
  },
  contador: {
    // Permisos existentes ...
    canViewPayments: true,        // NUEVO
    canRegisterPayment: true,     // NUEVO
    canViewPaymentHistory: true,  // NUEVO
    canEditPayment: false,        // NUEVO
    canDeletePayment: false,      // NUEVO
  },
  responsable: {
    // Permisos existentes ...
    canViewPayments: false,       // NUEVO
    canRegisterPayment: false,    // NUEVO
    canViewPaymentHistory: false, // NUEVO
    canEditPayment: false,        // NUEVO
    canDeletePayment: false,      // NUEVO
  },
  viewer: {
    // Permisos existentes ...
    canViewPayments: false,       // NUEVO
    canRegisterPayment: false,    // NUEVO
    canViewPaymentHistory: false, // NUEVO
    canEditPayment: false,        // NUEVO
    canDeletePayment: false,      // NUEVO
  }
}
```

#### Paso 2: CREAR hook `usePaymentPermissions` (NUEVO)

**Ubicación:** `src/features/dashboard/hooks/usePaymentPermissions.ts`

**Propósito:** Encapsular lógica de permisos de pago

```typescript
export function usePaymentPermissions() {
  const { user } = useSelector(state => state.auth);
  const role = user?.rol;

  return {
    canViewPayments: hasPermission(role, 'canViewPayments'),
    canRegisterPayment: hasPermission(role, 'canRegisterPayment'),
    canViewPaymentHistory: hasPermission(role, 'canViewPaymentHistory'),
    isCounterOrAdmin: role === 'contador' || role === 'admin',
  };
}
```

#### Paso 3: CREAR hook `usePaymentModal` (NUEVO)

**Ubicación:** `src/features/dashboard/hooks/usePaymentModal.ts`

**Propósito:** Gestionar estado de modales de pago

```typescript
export function usePaymentModal() {
  const [registroModalOpen, setRegistroModalOpen] = useState(false);
  const [historialModalOpen, setHistorialModalOpen] = useState(false);
  const [selectedFacturaId, setSelectedFacturaId] = useState<number | null>(null);

  return {
    registroModalOpen,
    historialModalOpen,
    selectedFacturaId,
    openRegistroModal: (facturaId: number) => { /* ... */ },
    closeRegistroModal: () => { /* ... */ },
    // ... más funciones
  };
}
```

#### Paso 4: ACTUALIZAR tipos de Factura (MODIFICACIÓN)

**Ubicación:** `src/features/dashboard/types/index.ts`

Extender interfaz `Factura`:

```typescript
export interface Factura {
  // ... campos existentes ...

  // NUEVOS campos (FASE 2 - Pagos)
  total_calculado?: string;      // Desde backend
  total_pagado?: string;         // Desde backend
  pendiente_pagar?: string;      // Desde backend
  esta_completamente_pagada?: boolean; // Desde backend
}
```

#### Paso 5: MODIFICAR `FacturasTable` (MODIFICACIÓN)

**Ubicación:** `src/features/dashboard/components/FacturasTable.tsx`

**Cambios:**
- Importar `usePaymentPermissions` y `usePaymentModal`
- Agregar columnas dinámicas basadas en permisos
- Agregar botones de pago solo para CONTADOR/ADMIN
- Integrar modales

---

## 🚫 QUÉ NO CREAR (EVITAR DUPLICACIÓN)

| Archivo Propuesto | ¿Existe Ya? | Alternativa |
|---|---|---|
| `src/security/roles.ts` | ✅ SÍ (en `constants/roles.ts`) | Usar existente |
| `src/security/permissions.ts` | ✅ SÍ (función `hasPermission`) | Usar existente |
| Enum UserRole | ✅ SÍ (ROLES en `constants/roles.ts`) | Usar existente |
| ROLE_PERMISSIONS matriz | ✅ SÍ (en `constants/roles.ts`) | EXTENDER existente |

---

## ✨ QUÉ CREAR (NUEVO, SIN DUPLICACIÓN)

| Archivo | Razón | Ubicación |
|---|---|---|
| `usePaymentPermissions.ts` | Hook especializado para pagos | `src/features/dashboard/hooks/` |
| `usePaymentModal.ts` | Gestión de estado de modales | `src/features/dashboard/hooks/` |
| `payment.types.ts` | Tipos específicos de pago | `src/features/dashboard/types/` |
| `paymentService.ts` | API service para pagos | `src/services/` |
| `ModalRegistroPago.tsx` | UI para registrar pagos | `src/features/dashboard/components/` |
| `ModalHistorialPagos.tsx` | UI para ver historial | `src/features/dashboard/components/` |

---

## 🏗️ ARQUITECTURA FINAL (SIN DUPLICACIÓN)

```
┌─────────────────────────────────────────────┐
│     CAPA DE PERMISOS (REUTILIZADA)          │
├─────────────────────────────────────────────┤
│  constants/roles.ts (EXTENDIDO)             │
│  ├── ROLES enum                             │
│  ├── ROLE_PERMISSIONS (+ permisos de pago)  │
│  └── hasPermission(role, permission)        │
└────────────┬────────────────────────────────┘
             │
┌────────────┴────────────────────────────────┐
│     HOOKS ESPECIALIZADOS (NUEVO)            │
├──────────────────────────────────────────────┤
│  usePaymentPermissions() {                   │
│    ├── canViewPayments                       │
│    ├── canRegisterPayment                    │
│    ├── isCounterOrAdmin                      │
│    └── usa hasPermission()                   │
│  }                                           │
│                                              │
│  usePaymentModal() {                         │
│    ├── registroModalOpen                     │
│    ├── historialModalOpen                    │
│    └── handlers (open/close)                 │
│  }                                           │
└────────────┬────────────────────────────────┘
             │
┌────────────┴────────────────────────────────┐
│     COMPONENTES (NUEVO)                     │
├──────────────────────────────────────────────┤
│  FacturasTable (MODIFICADO)                  │
│  ├── Importa usePaymentPermissions          │
│  ├── Importa usePaymentModal                │
│  ├── Columnas dinámicas (pagado, pendiente)  │
│  ├── Botones condicionales                   │
│  └── Renderiza modales si usuario tiene acceso│
│                                              │
│  ModalRegistroPago (NUEVO)                   │
│  ├── Formulario de pago                     │
│  ├── Validación                              │
│  └── Integración con API                     │
│                                              │
│  ModalHistorialPagos (NUEVO)                 │
│  ├── Tabla de pagos                          │
│  ├── Resumen de pagos                        │
│  └── Información de auditoría                │
└────────────┬────────────────────────────────┘
             │
┌────────────┴────────────────────────────────┐
│     SERVICIOS (NUEVO)                       │
├──────────────────────────────────────────────┤
│  paymentService.ts                           │
│  ├── registrarPago()                         │
│  ├── obtenerHistorial()                      │
│  ├── obtenerEstadisticas()                   │
│  └── validarReferencia()                     │
└──────────────────────────────────────────────┘
```

---

## 📝 CAMBIOS MÍNIMOS (SOLO LO NECESARIO)

### 1. EXTENDER `src/constants/roles.ts`

```diff
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    // ... permisos existentes ...
+   canViewPayments: true,
+   canRegisterPayment: true,
+   canViewPaymentHistory: true,
+   canEditPayment: true,
+   canDeletePayment: true,
  },
  [ROLES.CONTADOR]: {
    // ... permisos existentes ...
+   canViewPayments: true,
+   canRegisterPayment: true,
+   canViewPaymentHistory: true,
+   canEditPayment: false,
+   canDeletePayment: false,
  },
  // ... más roles ...
}
```

### 2. ACTUALIZAR `src/features/dashboard/types/index.ts`

```diff
export interface Factura {
  // ... campos existentes ...
+ total_calculado?: string;
+ total_pagado?: string;
+ pendiente_pagar?: string;
+ esta_completamente_pagada?: boolean;
}
```

### 3. CREAR `src/features/dashboard/hooks/usePaymentPermissions.ts` (NUEVO)

### 4. CREAR `src/features/dashboard/hooks/usePaymentModal.ts` (NUEVO)

### 5. MODIFICAR `src/features/dashboard/components/FacturasTable.tsx`

**Cambios principales:**
- Importar 2 hooks nuevos
- Agregar lógica condicional para mostrar columnas/botones
- Integrar modales

---

## 📊 RESUMEN DE CAMBIOS

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Nuevos** | 6 | `usePaymentPermissions.ts`, `usePaymentModal.ts`, `payment.types.ts`, `paymentService.ts`, `ModalRegistroPago.tsx`, `ModalHistorialPagos.tsx` |
| **Modificados** | 3 | `roles.ts` (+5 líneas), `types/index.ts` (+4 líneas), `FacturasTable.tsx` (+80 líneas) |
| **Eliminados** | 0 | Ninguno - No duplicamos nada |

---

## ✅ BENEFICIOS DE ESTE ENFOQUE

1. **Sin duplicación**: Reutilizamos `roles.ts` y su matriz de permisos
2. **Mantenible**: Un solo lugar para cambiar permisos
3. **Escalable**: Agregar nuevos permisos es trivial
4. **Type-safe**: TypeScript asegura integridad
5. **Eficiente**: Mínimos cambios, máximo resultado

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Extender `src/constants/roles.ts` con permisos de pago
2. ✅ Crear hooks `usePaymentPermissions` y `usePaymentModal`
3. ✅ Actualizar tipos de `Factura`
4. ✅ Crear service `paymentService.ts`
5. ✅ Crear componentes `ModalRegistroPago` y `ModalHistorialPagos`
6. ✅ Modificar `FacturasTable.tsx`
7. ✅ Testing y validación

---

**Documento preparado para evitar duplicación innecesaria y reutilizar infraestructura existente.**
