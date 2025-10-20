# GUÍA DE SINCRONIZACIÓN FRONTEND ↔ BACKEND

**Fecha:** 2025-10-19
**Backend Version:** Fase 2.4 y 2.5 completadas
**Cambios Aplicados:** ✅ Campos workflow actualizados

---

## 🎯 CAMBIOS REALIZADOS

### Backend (Fase 2.4 y 2.5)

1. **Campos eliminados de tabla `facturas`:**
   - ❌ `aprobado_por`
   - ❌ `fecha_aprobacion`
   - ❌ `rechazado_por`
   - ❌ `fecha_rechazo`
   - ❌ `motivo_rechazo`

2. **Nuevos campos (computed properties):**
   - ✅ `aprobado_por_workflow`
   - ✅ `fecha_aprobacion_workflow`
   - ✅ `rechazado_por_workflow`
   - ✅ `fecha_rechazo_workflow`
   - ✅ `motivo_rechazo_workflow`
   - ✅ `tipo_aprobacion_workflow`

3. **Generated columns en `factura_items`:**
   - ⚠️ `subtotal` → READ-ONLY (calculado por MySQL)
   - ⚠️ `total` → READ-ONLY (calculado por MySQL)

---

## ✅ SINCRONIZACIÓN FRONTEND COMPLETADA

### Archivos Actualizados

#### 1. Tipos TypeScript

**✅ `src/types/factura.types.ts`**
```typescript
export interface Factura {
  // ... campos existentes ...

  // ✅ NUEVOS campos de workflow
  aprobado_por_workflow?: string;
  fecha_aprobacion_workflow?: string;
  rechazado_por_workflow?: string;
  fecha_rechazo_workflow?: string;
  motivo_rechazo_workflow?: string;
  tipo_aprobacion_workflow?: 'automatica' | 'manual' | 'masiva' | 'forzada';
}
```

**✅ `src/features/dashboard/types/index.ts`**
```typescript
export interface Factura {
  // ... campos existentes ...

  // ✅ NUEVOS campos de auditoría (desde workflow)
  aprobado_por_workflow?: string;
  fecha_aprobacion_workflow?: string;
  rechazado_por_workflow?: string;
  fecha_rechazo_workflow?: string;
  motivo_rechazo_workflow?: string;
  tipo_aprobacion_workflow?: 'automatica' | 'manual' | 'masiva' | 'forzada';
}
```

---

## 📡 RESPUESTA DEL BACKEND

### Ejemplo: `GET /api/v1/facturas/1`

```json
{
  "id": 1,
  "numero_factura": "FETE14569",
  "total_a_pagar": 15000.00,
  "subtotal": 12605.04,
  "iva": 2394.96,
  "estado": "aprobada",

  "aprobado_por_workflow": "5",
  "fecha_aprobacion_workflow": "2024-10-15T10:30:00",
  "rechazado_por_workflow": null,
  "fecha_rechazo_workflow": null,
  "motivo_rechazo_workflow": null,
  "tipo_aprobacion_workflow": "manual"
}
```

**IMPORTANTE:** Los campos SIN `_workflow` ya NO existen en la respuesta.

---

## 🔧 USO EN COMPONENTES

### ✅ Mostrar datos de aprobación

```tsx
// ✅ CORRECTO
<Typography>
  Aprobado por: {factura.aprobado_por_workflow}
</Typography>
<Typography>
  Fecha: {factura.fecha_aprobacion_workflow}
</Typography>

// ❌ INCORRECTO (campos eliminados)
<Typography>
  Aprobado por: {factura.aprobado_por}  {/* undefined */}
</Typography>
```

### ✅ Filtros y búsquedas

```typescript
// ✅ CORRECTO
const facturasAprobadas = facturas.filter(f =>
  f.aprobado_por_workflow !== null
);

// ❌ INCORRECTO
const facturasAprobadas = facturas.filter(f =>
  f.aprobado_por !== null  // Siempre será null
);
```

### ✅ Tabla de auditoría

```tsx
<TableCell>{factura.aprobado_por_workflow || '-'}</TableCell>
<TableCell>
  {factura.fecha_aprobacion_workflow
    ? new Date(factura.fecha_aprobacion_workflow).toLocaleDateString()
    : '-'
  }
</TableCell>
<TableCell>
  {factura.tipo_aprobacion_workflow === 'automatica'
    ? '🤖 Automática'
    : '👤 Manual'
  }
</TableCell>
```

---

## 🚫 ERRORES COMUNES A EVITAR

### 1. Usar campos viejos

```typescript
// ❌ ESTO NO FUNCIONARÁ
if (factura.aprobado_por) {
  // Este código nunca se ejecutará
}

// ✅ CORRECTO
if (factura.aprobado_por_workflow) {
  // Funciona correctamente
}
```

### 2. Intentar editar subtotal/total en items

```typescript
// ❌ Backend rechazará esto
const item = {
  cantidad: 10,
  precio_unitario: 100,
  subtotal: 1000,  // ❌ Campo generado, read-only
  total: 1000      // ❌ Campo generado, read-only
};

// ✅ CORRECTO - Solo enviar campos editables
const item = {
  cantidad: 10,
  precio_unitario: 100,
  descuento_valor: 0,
  total_impuestos: 0
  // subtotal y total se calculan automáticamente en backend
};
```

### 3. Enviar requests con campos viejos

```typescript
// ❌ INCORRECTO (aunque el backend lo tolera por ahora)
await api.post('/facturas/1/aprobar', {
  aprobado_por: userId,
  fecha_aprobacion: new Date()  // Backend ignora esto
});

// ✅ CORRECTO
await api.post('/facturas/1/aprobar', {
  aprobado_por: userId
  // Backend maneja fecha_aprobacion automáticamente
});
```

---

## 🧪 TESTING

### Verificar integración

```typescript
// Test: Verificar que campos workflow existen
test('factura debe tener campos workflow', async () => {
  const factura = await fetchFactura(1);

  expect(factura).toHaveProperty('aprobado_por_workflow');
  expect(factura).toHaveProperty('fecha_aprobacion_workflow');
  expect(factura).toHaveProperty('tipo_aprobacion_workflow');

  // Campos viejos NO deben existir
  expect(factura.aprobado_por).toBeUndefined();
});

// Test: Aprobar factura
test('aprobar factura debe actualizar workflow', async () => {
  await aprobarFactura(1, 'usuario123');

  const factura = await fetchFactura(1);
  expect(factura.aprobado_por_workflow).toBe('usuario123');
  expect(factura.fecha_aprobacion_workflow).toBeDefined();
});
```

---

## 📊 COMPATIBILIDAD

### Servicios API

Los servicios de aprobación/rechazo **NO necesitan cambios**:

```typescript
// ✅ Estos servicios siguen funcionando igual
await facturasService.approveFactura(id, usuario, observaciones);
await facturasService.rejectFactura(id, usuario, motivo, detalle);
```

El backend:
1. Recibe `aprobado_por` o `rechazado_por`
2. Crea/actualiza el workflow automáticamente
3. Retorna la factura con campos `_workflow` poblados

---

## 🎯 PRÓXIMOS PASOS

### Opcional: Actualizar componentes para usar tipo_aprobacion

```tsx
// Mostrar badge según tipo de aprobación
{factura.tipo_aprobacion_workflow === 'automatica' && (
  <Chip
    label="Aprobación Automática"
    icon={<AutoAwesomeIcon />}
    color="success"
  />
)}

{factura.tipo_aprobacion_workflow === 'manual' && (
  <Chip
    label="Aprobación Manual"
    icon={<PersonIcon />}
    color="primary"
  />
)}
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [x] Tipos TypeScript actualizados
- [x] No hay referencias a campos viejos en código
- [x] Servicios API funcionan correctamente
- [x] Backend retorna campos `_workflow`
- [ ] **PENDIENTE:** Testing en desarrollo
- [ ] **PENDIENTE:** Actualizar componentes visuales (opcional)
- [ ] **PENDIENTE:** Deploy sincronizado

---

## 🆘 TROUBLESHOOTING

### Problema: Frontend muestra `undefined` en campos de aprobación

**Causa:** Componente usa campos viejos
**Solución:** Buscar en el código y reemplazar:
```bash
# Buscar usos de campos viejos
grep -r "aprobado_por[^_]" src/
grep -r "fecha_aprobacion[^_]" src/
grep -r "rechazado_por[^_]" src/
```

### Problema: Backend retorna error 500 al crear items

**Causa:** Frontend envía `subtotal` o `total` (campos read-only)
**Solución:** Eliminar esos campos del payload:
```typescript
// Antes de enviar, eliminar campos generados
const { subtotal, total, ...itemData } = formData;
await api.post('/items', itemData);
```

---

## 📞 SOPORTE

Si encuentras problemas:
1. Verificar que backend esté en versión Fase 2.4/2.5
2. Revisar network tab del navegador para ver respuesta real del backend
3. Comprobar que tipos TypeScript coincidan con schema del backend

---

**Documento actualizado:** 2025-10-19
**Estado:** ✅ Sincronización completada
**Versión:** 1.0
