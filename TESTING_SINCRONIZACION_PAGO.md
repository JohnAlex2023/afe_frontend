# 🧪 TESTING - SINCRONIZACIÓN DE ESTADO DE PAGO

**Fecha:** 20 Noviembre 2025
**Objetivo:** Validar que pagos registrados sincronizan correctamente a través de la aplicación
**Tiempo estimado:** 30-45 minutos

---

## 📋 SETUP PREVIO

### Requisitos
- [ ] Backend corriendo (FastAPI)
- [ ] Frontend corriendo (React dev server)
- [ ] Usuario con rol CONTADOR creado en BD
- [ ] Usuario con rol RESPONSABLE creado en BD
- [ ] Facturas aprobadas en estado "aprobada" disponibles
- [ ] Dos navegadores o ventanas abiertas (para multi-user testing)

### Preparación
```bash
# Backend
cd afe-backend
python -m uvicorn app.main:app --reload

# Frontend
cd afe-frontend
npm start
```

---

## 🧪 TEST CASOS

### TEST 1: Pago Parcial - UI Actualización

**Objetivo:** Verificar que un pago parcial actualiza correctamente los montos sin cambiar el estado

**Precondiciones:**
- Factura: INV-001, Total: $1,000,000, Estado: aprobada, Pagado: $0, Pendiente: $1,000,000
- Usuario CONTADOR logueado

**Pasos:**
1. Abrir Dashboard → Tabla de Facturas
2. Buscar factura INV-001
3. Verificar columnas "Pagado" y "Pendiente" son visibles (CONTADOR tiene permisos)
4. Haz clic en botón verde "Registrar Pago" (AddCircle icon)
5. En modal:
   - Monto a Pagar: 300,000
   - Referencia: CHQ-001
   - Método: Cheque
6. Haz clic en "Registrar Pago"
7. Esperar spinner a terminar

**Validaciones Esperadas:**
- [ ] Modal se cierra automáticamente
- [ ] Tabla se actualiza automáticamente (sin refresh manual)
- [ ] Columna "Pagado" ahora muestra: $300,000
- [ ] Columna "Pendiente" ahora muestra: $700,000
- [ ] Estado sigue siendo "aprobada" (no cambió)
- [ ] Botón "Registrar Pago" sigue disponible (puede pagar más)

**Notas:**
- Si no se actualiza automáticamente, verificar que `onRefreshData` está siendo pasado correctamente

---

### TEST 2: Pago Completo - Cambio de Estado

**Objetivo:** Verificar que un pago que completa la factura cambia el estado a "pagada"

**Precondiciones:**
- Factura: INV-002, Total: $500,000, Estado: aprobada, Pagado: $300,000, Pendiente: $200,000
- Usuario CONTADOR logueado

**Pasos:**
1. Abrir Dashboard → Tabla de Facturas
2. Aplicar filtro por estado: "todos" (para ver todas las facturas)
3. Buscar factura INV-002
4. Verificar campos actuales:
   - Pagado: $300,000
   - Pendiente: $200,000
5. Haz clic en botón "Registrar Pago"
6. En modal:
   - Monto a Pagar: 200,000 (el monto pendiente exacto)
   - Referencia: TRF-ABC123
   - Método: Transferencia
7. Haz clic en "Registrar Pago"

**Validaciones Esperadas:**
- [ ] Modal se cierra
- [ ] Tabla se actualiza automáticamente
- [ ] Columna "Pagado" muestra: $500,000
- [ ] Columna "Pendiente" muestra: $0.00 o verde
- [ ] Estado cambia a "pagada" (en columna Estado)
- [ ] **Botón "Registrar Pago" desaparece** (no está disponible para pagadas)
- [ ] Si aplicas filtro "aprobada", factura desaparece de la tabla
- [ ] Si aplicas filtro "todas", factura sigue visible pero con estado "pagada"

**Notas:**
- El cambio de estado debe ocurrir porque el backend detectó que total_pagado >= total_calculado

---

### TEST 3: Validación - Monto Excede Pendiente

**Objetivo:** Verificar que no se permite pagar más de lo pendiente

**Precondiciones:**
- Factura: INV-003, Total: $750,000, Estado: aprobada, Pagado: $500,000, Pendiente: $250,000
- Usuario CONTADOR logueado

**Pasos:**
1. Abrir Dashboard → Tabla de Facturas
2. Buscar factura INV-003
3. Haz clic en "Registrar Pago"
4. En modal:
   - Monto a Pagar: 300,000 **(MAYOR que pendiente $250,000)**
   - Referencia: CHQ-002
5. Intenta haz clic en "Registrar Pago"

**Validaciones Esperadas:**
- [ ] Botón "Registrar Pago" **está deshabilitado** (gris)
- [ ] Aparece texto de error: "El monto no puede exceder el pendiente de $250,000"
- [ ] Request NO se envía al servidor
- [ ] No hay spinner de loading

**Notas:**
- Esta es validación client-side. Ayuda a prevenir errores antes de llegar al servidor

---

### TEST 4: Multi-User Sync - Otro Usuario ve Cambios

**Objetivo:** Verificar que cambios registrados por un usuario se vean cuando otro usuario refresca

**Precondiciones:**
- **Ventana 1:** Usuario CONTADOR A logueado en Browser 1
- **Ventana 2:** Usuario CONTADOR B logueado en Browser 2 (o pestaña nueva)
- Ambos ven Dashboard con tabla de facturas
- Factura: INV-004, Total: $600,000, Estado: aprobada, Pagado: $0, Pendiente: $600,000

**Pasos:**
1. **En Ventana 1 (Usuario A):**
   - Localiza factura INV-004 en tabla
   - Haz clic en "Registrar Pago"
   - Paga: $600,000 (cantidad completa)
   - Referencia: SYNC-TEST-001
   - Haz clic "Registrar Pago"
   - Espera a que tabla se actualice (debe ser automático)

2. **Observar en Ventana 1:**
   - [ ] Factura actualizada a estado "pagada"
   - [ ] Columna "Pagado": $600,000
   - [ ] Columna "Pendiente": $0.00

3. **En Ventana 2 (Usuario B):**
   - Verifica que aún muestra factura como "aprobada" con Pagado: $0
   - **NO ha hecho refresh manual aún**
   - Los datos están desactualizados (esperado)

4. **En Ventana 2 - Hacer Refresh Manual:**
   - Haz clic en botón "Actualizar" (Refresh icon en header)
   - Espera a que datos carguen

5. **Observar en Ventana 2 después de refresh:**
   - [ ] Factura ahora muestra estado "pagada"
   - [ ] Columna "Pagado": $600,000
   - [ ] Columna "Pendiente": $0.00
   - [ ] **Cambios registrados por Usuario A son visibles**

**Notas:**
- Este test verifica que BD se actualiza correctamente y que otros usuarios ven cambios al refrescar
- En futuro, se podría implementar WebSocket para sync automático sin necesidad de refresh manual

---

### TEST 5: Permisos - RESPONSABLE NO ve Pagos

**Objetivo:** Verificar que usuarios RESPONSABLE no ven columnas/botones de pago

**Precondiciones:**
- Usuario con rol RESPONSABLE logueado en navegador
- Dashboard abierto

**Pasos:**
1. Abrir Dashboard → Tabla de Facturas
2. Revisar tabla de facturas

**Validaciones Esperadas:**
- [ ] **Columnas "Pagado" y "Pendiente" NO son visibles**
- [ ] Solo ve columnas básicas: Número, Emisor, NIT, Monto, Fecha, Estado, Responsable, Acción Por, Acciones
- [ ] **Botones "Registrar Pago" (AddCircle) NO aparecen**
- [ ] Solo ve botón "Ver Detalles" (Visibility)
- [ ] Si intenta acceder directamente a endpoint `/accounting/facturas/{id}/marcar-pagada` por consola:
  - [ ] Backend rechaza: HTTP 403 Forbidden "Sin permisos (solo contador)"

**Notas:**
- Validación de permisos se hace en dos niveles:
  1. Frontend: usePaymentPermissions() oculta UI
  2. Backend: @require_role("contador") rechaza request

---

### TEST 6: Email Notificación

**Objetivo:** Verificar que email se envía al proveedor cuando se registra pago

**Precondiciones:**
- Email configurado en archivo de settings
- Factura con proveedor que tiene email configurado
- Usuario CONTADOR logueado

**Pasos:**
1. Registrar un pago (usar TEST 1 o 2)
2. Esperar a que se complete

**Validaciones Esperadas:**
- [ ] Verificar en logs del backend:
  ```
  INFO: Email de pago enviado al proveedor
  extra: {"factura_id": X, "proveedor_email": "..."}
  ```
- [ ] Si tienes acceso a mailbox:
  - [ ] Email recibido desde: noreply@empresa.com
  - [ ] Subject: "Pago recibido - Factura INV-XXX"
  - [ ] Body contiene: Número factura, monto pagado, referencia, fecha, total pagado, pendiente

**Notas:**
- Si email no se envía, probablemente es problema de configuración SMTP, no del flujo de pago

---

### TEST 7: Auditoría - Logging

**Objetivo:** Verificar que se registra auditoría completa del pago

**Precondiciones:**
- Acceso a logs de backend
- Usuario CONTADOR logueado

**Pasos:**
1. Registrar un pago
2. Revisar logs del backend

**Validaciones Esperadas en Logs:**
- [ ] Log de "Pago creado exitosamente":
  ```
  pago_id: X
  factura_id: Y
  monto: Z
  referencia: REF-XXX
  contador: usuario@empresa.com
  ```
- [ ] Log de "Factura marcada como pagada" (solo si fue pago completo):
  ```
  factura_id: Y
  contador: usuario@empresa.com
  ```
- [ ] Log de "Email enviado al proveedor"

**Notas:**
- Auditoría completa permite rastrear quién registró cada pago y cuándo

---

## 📊 MATRIZ DE VALIDACIÓN

| Test | Caso | Resultado | Notas |
|------|------|-----------|-------|
| 1 | Pago Parcial | ⏳ | Verificar montos actualizan |
| 2 | Pago Completo | ⏳ | Verificar estado → pagada |
| 3 | Validación Monto | ⏳ | Verificar botón deshabilitado |
| 4 | Multi-User | ⏳ | Verificar sync con refresh |
| 5 | Permisos | ⏳ | Verificar RESPONSABLE no ve pagos |
| 6 | Email | ⏳ | Verificar email al proveedor |
| 7 | Auditoría | ⏳ | Verificar logs completos |

---

## 🐛 DEBUGGING

Si algo no funciona, revisar:

### Frontend
```typescript
// 1. Verificar que onRefreshData se pasa correctamente
console.log('onRefreshData:', typeof onRefreshData);  // Debe ser "function"

// 2. Verificar que callback se ejecuta
const onPagoSuccess = async () => {
  console.log('onPagoSuccess called');  // Debe aparecer en consola
  if (onRefreshData) {
    console.log('Calling onRefreshData');
    await onRefreshData();
    console.log('onRefreshData completed');
  }
};

// 3. Verificar que loadData ejecuta GET
// En Network tab del DevTools, buscar GET /facturas/all
// Debe ejecutarse después de POST /marcar-pagada
```

### Backend
```python
# 1. Verificar que endpoint se ejecuta
logger.info("Endpoint marcar-pagada called")

# 2. Verificar estado actualiza
if factura.esta_completamente_pagada:
    logger.info("Factura should be marked as pagada")
    # Si no ves esto, revisar propiedad esta_completamente_pagada

# 3. Verificar commit a BD
db.commit()  # Debe guardarse
```

---

## ✅ CHECKLIST FINAL

Después de completar todos los tests:

- [ ] TEST 1: Pago Parcial - PASÓ
- [ ] TEST 2: Pago Completo - PASÓ
- [ ] TEST 3: Validación Monto - PASÓ
- [ ] TEST 4: Multi-User Sync - PASÓ
- [ ] TEST 5: Permisos - PASÓ
- [ ] TEST 6: Email - PASÓ
- [ ] TEST 7: Auditoría - PASÓ

**Si todos los tests PASARON:**
✅ Sincronización de Pago está **100% FUNCIONAL**
✅ Listo para merge a rama main
✅ Listo para deploy a producción

---

## 📝 NOTAS FINALES

- Si encuentras bugs, documentar en [BUGS_ENCONTRADOS.md](./BUGS_ENCONTRADOS.md)
- Si tienes mejoras sugeridas, documentar en [MEJORAS_SUGERIDAS.md](./MEJORAS_SUGERIDAS.md)
- Reportar results de testing a equipo de desarrollo

---

**Testing creado:** 20 Noviembre 2025
**Estimado de ejecución:** 45 minutos
**Criticidad:** 🔴 CRÍTICA - Cierre del ciclo FASE 2
