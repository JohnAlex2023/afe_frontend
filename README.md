# AFE Frontend - Sistema de Aprobación de Facturas Electrónicas

Dashboard profesional de nivel empresarial construido con React 19 + TypeScript + Material-UI.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

La aplicación estará disponible en `http://localhost:5173`

## 📋 Stack Tecnológico

- ⚛️ **React 19** + **TypeScript**
- 🎨 **Material-UI (MUI)** - Componentes UI
- 🔄 **Redux Toolkit** - Estado global
- 📝 **React Hook Form + Zod** - Formularios y validación
- 📊 **Recharts** - Gráficos y visualización de datos
- 🚀 **Vite** - Build tool y dev server
- 🎯 **React Router** - Navegación

## 🎨 Características Principales

### ✅ Dashboard de Facturas
- Stats cards con indicadores de tendencia
- Tabla con filtros avanzados y búsqueda
- Gráficos estadísticos (barras, líneas, circular, gauge)
- Exportación a Excel
- Gestión completa de facturas (CRUD)

### ✅ Configuración de Correos
- Gestión de cuentas de correo corporativo
- Configuración de NITs por cuenta
- Historial de extracciones
- Estadísticas de procesamiento
- Importación bulk de NITs

### ✅ Sistema de Diseño Zentria
- Colores corporativos consistentes
- Tipografía profesional
- Animaciones y micro-interacciones
- Accesibilidad WCAG AA
- Responsive design completo

## 📚 Documentación Completa

Para la documentación detallada de mejoras UX/UI, arquitectura, y guías de implementación, consulta:

**👉 [README_MEJORAS_UX.md](./README_MEJORAS_UX.md)**

Incluye:
- Sistema de diseño completo
- Guía de componentes
- Implementación de gráficos
- Mejoras UX/UI detalladas
- Solución de problemas
- Próximas mejoras

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### Estructura de Carpetas

```
src/
├── features/
│   ├── dashboard/          # Dashboard principal
│   ├── email-config/       # Configuración de correos
│   └── auth/               # Autenticación
├── services/               # Servicios API
├── theme/                  # Sistema de diseño
├── components/             # Componentes comunes
└── app/                    # Redux store
```

## 🎯 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
```

## 📱 Navegación

```
/                    → Login
/dashboard           → Dashboard principal
/facturas            → Lista de facturas
/email-config        → Configuración de correos (Admin)
/email-config/:id    → Detalle de cuenta (Admin)
/responsables        → Gestión de responsables (Admin)
/proveedores         → Gestión de proveedores (Admin)
```

## 🔐 Autenticación

El sistema usa JWT tokens almacenados en localStorage. Las rutas están protegidas según el rol del usuario (admin/responsable).

## 🐛 Troubleshooting

### Error: "Failed to fetch"
Verificar que el backend esté corriendo en `http://localhost:8000` y que `VITE_API_URL` esté configurado correctamente en `.env`.

### Error: "401 Unauthorized"
El token JWT ha expirado. Hacer logout y login nuevamente.

Para más detalles de solución de problemas, consulta [README_MEJORAS_UX.md](./README_MEJORAS_UX.md#solución-de-problemas).

## 📊 Métricas de Calidad

- ✅ Contraste WCAG AA: 92/100
- ✅ Performance: First Paint < 1.5s
- ✅ Uniformidad visual: 100%
- ✅ Accesibilidad: 92/100
- ✅ Sin breaking changes

## 🤝 Contribuir

1. Seguir el sistema de diseño Zentria
2. Mantener consistencia de colores corporativos
3. Usar componentes reutilizables
4. Documentar cambios importantes

## 📞 Soporte

Para consultas técnicas o reportar issues:
- Revisar documentación en [README_MEJORAS_UX.md](./README_MEJORAS_UX.md)
- Verificar tipos en `src/features/*/types/`
- Consultar servicios en `src/services/`

---

**Versión:** 2.0
**Última actualización:** 2025-10-15
**Estado:** ✅ En producción
