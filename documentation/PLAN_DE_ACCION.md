# Plan de Acción General

## 1. Introducción

Este documento resume el plan de acción para abordar las mejoras, correcciones y nuevas funcionalidades solicitadas. El objetivo es organizar el trabajo, definir los requerimientos y establecer una hoja de ruta clara para el desarrollo, reflejando el estado actual del proyecto.

Cada punto principal se detalla en un documento específico para mantener la claridad y el enfoque.

## 2. Resumen de Áreas de Trabajo

A continuación se listan las principales áreas de trabajo identificadas, con un enlace a su documentación detallada. (La lista se mantiene para referencia histórica y de contexto).

- **[~] Builder V3:** Mejoras, corrección de bugs y nuevas funcionalidades en el constructor de plantillas.
  - *Ver detalle en: [ANALISIS_BUILDER_V3.md](./ANALISIS_BUILDER_V3.md)*
- **[x] Refactorización y Modularización:** Mejoras en la arquitectura y calidad del código.
  - *Ver detalle en: [REFACTORIZACION_Y_MODULARIZACION.md](./REFACTORIZACION_Y_MODULARIZACION.md)*
- **[~] Modelo de Datos e Integración:** Definición de los modelos de datos para la integración con servicios de terceros.
  - *Ver detalle en: [MODELO_DE_DATOS_EXTERNOS.md](./MODELO_DE_DATOS_EXTERNOS.md)*
- **[ ] Gestión de Entidades (Familias y Plantillas):** CRUD y funcionalidades avanzadas para la gestión de familias y plantillas.
  - *Ver detalle en: [GESTION_DE_ENTIDADES.md](./GESTION_DE_ENTIDADES.md)*
- **[~] Funcionalidades y Flujos Core:** Verificación y desarrollo de los flujos de trabajo principales de la aplicación.
  - *Ver detalle en: [FUNCIONALIDADES_CORE.md](./FUNCIONALIDADES_CORE.md)*
- **[ ] Administración y Seguridad:** Implementación de roles, permisos, Active Directory y otras mejoras de seguridad.
  - *Ver detalle en: [ADMINISTRACION_Y_SEGURIDAD.md](./ADMINISTRACION_Y_SEGURIDAD.md)*
  - *Sistema 2FA detallado en: [SISTEMA_SOLICITUD_MODIFICACION.md](./SISTEMA_SOLICITUD_MODIFICACION.md)*
- **[ ] Infraestructura y Despliegue:** Análisis de requerimientos para el despliegue en la nube (AWS/Azure).
  - *Ver detalle en: [INFRAESTRUCTURA_Y_DESPLIEGUE.md](./INFRAESTRUCTURA_Y_DESPLIEGUE.md)*
- **[~] Mejoras de UI/UX:** Corrección de bugs visuales y mejoras en la experiencia de usuario.
  - *Ver detalle en: [ISSUES_UI_UX.md](./ISSUES_UI_UX.md)*

## 3. Priorización y Cronograma (Actualizado)

### 3.1. **Fase 1: Correcciones Críticas y UX Fundamental (Inmediato)**
**Prioridad: CRÍTICA** - Elementos que bloquean o degradan severamente la usabilidad.

1. **Issues UI/UX críticos:**
   - [ ] ‼️ **Corregir legibilidad de botones y menú de usuario** (Volver, Administración, etc). Texto blanco sobre fondo blanco.
   - [ ] ⚠️ Consolidar botones múltiples "Nuevo" en gestión de plantillas.
   - [ ] ⚠️ Bug: Rulers no se actualizan con zoom en BuilderV3.

2. **Flujo de Creación de Familias:**
   - [ ] **Implementar modal para "Nueva Familia"**, reemplazando la redirección actual.
   - [ ] **Integrar la funcionalidad de clonar/importar plantillas** dentro de este nuevo modal.

3. **Política "Cero Mocks":**
   - [ ] **Eliminar mocks para Familias y Plantillas**. Asegurar que todo el CRUD se realiza contra Supabase.
   - [ ] Auditar el código del Builder para erradicar cualquier dependencia de datos mockeados para estas entidades.

### 3.2. **Fase 2: Funcionalidades Esenciales (Próximas 2-3 semanas)**
**Prioridad: ALTA** - Funcionalidades principales del sistema.

4. **Integración de Financiación:**
   - [ ] Diseñar bloque de financiación para BuilderV3.
   - [ ] Implementar configuración de opciones de financiación.
   - [ ] Integrar renderizado dinámico en cartelera.

5. **Envío a Sucursales:**
   - [ ] Implementar selección de carteles.
   - [ ] Crear modal de selección de sucursales.
   - [ ] Desarrollar vista para usuarios de sucursal.

### 3.3. **Fase 3: Administración y Seguridad (2-3 semanas)**
**Prioridad: MEDIA-ALTA** - Sistema de permisos y roles.

6. **Portal de Administración:**
   - [ ] Crear interfaz de gestión de usuarios.
   - [ ] Implementar sistema de roles y permisos granulares.
   - [ ] Desarrollar flujo de "solicitud de modificación".

7. **Autenticación Avanzada:**
   - [ ] ⚠️ **PENDIENTE INFO CLIENTE**: Configuración Active Directory.
   - [ ] Implementar JWT seguro.
   - [ ] Sistema de autenticación 2FA para acciones críticas.

### 3.4. **Fase 4: Infraestructura y Despliegue (Pendiente)**
**Prioridad: BAJA** - Preparación para producción.

8. **Preparación para Cloud:**
   - [ ] ⚠️ **PENDIENTE INFO CLIENTE**: Configuración AWS/Azure.
   - [ ] Dockerización de la aplicación.
   - [ ] Scripts de CI/CD.

## 4. Estado Actual Real del Proyecto

### ✅ **Completado:**
- [x] **Análisis y documentación inicial de requerimientos.**
- [x] **Modularización de gran parte de la aplicación** (Cartelera, Productos, Promociones, Auth, UI).
- [x] Estructura básica de BuilderV3.
- [x] **CRUD completo de Familias y Plantillas con Supabase** (la base está, falta pulir la UI y eliminar mocks).
- [x] **Flujo E2E principal verificado y funcional** en su versión inicial.
- [x] Integración real BuilderV3 con Supabase (sin mocks para la carga inicial).
- [x] Cliente admin configurado para bypass RLS.
- [x] Digital Carousel correctamente deshabilitado.
- [x] **El editor de carteles (Poster Editor) funciona correctamente.**

### 🔄 **En Progreso:**
- [~] **Refactorización final de BuilderV3** y sus hooks.
- [~] **Corrección de Issues UI/UX específicos** (botones, modales, etc.).
- [~] **Transición final a una política de "cero mocks"** para entidades core.

### ❌ **Pendiente:**
- [ ] **Nuevo flujo de creación de familias con clonación.**
- [ ] Sistema completo de administración y seguridad.
- [ ] Funcionalidades avanzadas (envío sucursales).
- [ ] Infraestructura y Despliegue.

## 5. Elementos Específicos Faltantes Identificados
(Se mantiene para referencia)

## 6. Checklist General de Progreso
(Se simplifica para reflejar el estado actual)

- [x] **Fase 1: Documentación y Planificación** ✅ COMPLETADA
- [~] **Fase 2: Modularización y Correcciones** 🔄 EN PROGRESO
- [ ] **Fase 3: UX Fundamental y Cero Mocks** ❌ PENDIENTE
- [ ] **Fase 4: Funcionalidades Esenciales** ❌ PENDIENTE
- [ ] **Fase 5: Administración y Seguridad** ❌ PENDIENTE
- [ ] **Fase 6: Infraestructura y Despliegue** ❌ PENDIENTE

## 7. Próximos Pasos Inmediatos

1.  **🔧 DESARROLLO (Crítico):** Corregir issues críticos de UI/UX (legibilidad de botones y menús).
2.  **🚀 DESARROLLO (Crítico):** Implementar el nuevo flujo de "Crear Familia" con un modal que incluya la opción de clonar.
3.  **🧹 REFACTOR (Crítico):** Auditar y eliminar por completo el uso de MOCKS para Familias y Plantillas en todo el flujo del Builder y la creación de entidades.
4.  **📋 GESTIÓN:** Solicitar información pendiente del cliente (AD, Cloud) para desbloquear fases posteriores.

---
**Nota:** Este plan se actualizará según el progreso y la información adicional del cliente. 