# 🧪 Speed Builder V2 - Instrucciones de Testing

## 📋 Tabla de Contenidos
1. [Configuración Inicial](#configuración-inicial)
2. [Testing del Sistema](#testing-del-sistema)
3. [Casos de Prueba](#casos-de-prueba)
4. [Troubleshooting](#troubleshooting)
5. [Métricas de Rendimiento](#métricas-de-rendimiento)

---

## 🔧 Configuración Inicial

### Prerrequisitos
- ✅ Node.js 18+ instalado
- ✅ npm/yarn configurado
- ✅ Acceso a Supabase (opcional para testing básico)
- ✅ Navegador moderno (Chrome, Firefox, Safari, Edge)

### Instalación
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (opcional)
cp .env.example .env.local

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:5179 (o el puerto disponible)
```

---

## 🧪 Testing del Sistema

### Navegación Principal
1. **Acceso al Builder V2**
   ```
   - Ir a la URL del proyecto
   - Hacer clic en "Speed Builder V2" desde el menú principal
   - Verificar que carga correctamente
   ```

2. **Testing de Headers y Navegación**
   - ✅ Header SPID Plus visible
   - ✅ Botón "Volver" funcional
   - ✅ Menú de usuario con email y rol
   - ✅ Botón "Ayuda" disponible
   - ✅ Logout funcional

---

## 📊 Casos de Prueba

### 1. Selección de Familias Promocionales

#### Test Case 1.1: Visualización de Familias
```
DESCRIPCIÓN: Verificar que todas las 16 familias se muestran correctamente

PASOS:
1. Acceder al Builder V2
2. Verificar pantalla de selección de familias
3. Contar familias disponibles

RESULTADO ESPERADO:
- 16 familias visibles
- Cards con colores distintivos
- Íconos representativos
- Información de plantillas compatibles

FAMILIAS A VERIFICAR:
✅ Superprecio (azul)
✅ Feria de descuentos (rojo)
✅ Financiación (verde)
✅ Troncales (morado)
✅ Nuevo (naranja)
✅ Temporada (rosa)
✅ Oportuneasy (turquesa)
✅ Precios que la rompen (rojo oscuro)
✅ Ladrillazos (marrón)
✅ Herramientas (gris)
✅ Club Easy (azul oscuro)
✅ Cencopay (dorado)
✅ Mundo Experto (verde oscuro)
✅ Constructor (amarillo)
✅ Fleje Promocional (púrpura)
✅ Imágenes personalizadas (multicolor)
```

#### Test Case 1.2: Interacción con Familias
```
PASOS:
1. Hacer hover sobre cada familia
2. Hacer clic en una familia
3. Verificar navegación a selección de plantillas

RESULTADO ESPERADO:
- Efecto hover visual
- Transición suave a siguiente paso
- Breadcrumb actualizado
```

### 2. Selección de Plantillas

#### Test Case 2.1: Visualización de Plantillas
```
DESCRIPCIÓN: Verificar plantillas compatibles por familia

PASOS:
1. Seleccionar familia "Superprecio"
2. Verificar plantillas disponibles
3. Repetir para otras familias

PLANTILLAS PRINCIPALES A VERIFICAR:
✅ Precio Lleno
✅ Antes/Ahora con dto
✅ Antes/Ahora
✅ Flooring
✅ Combo
✅ Promo 3x2 con precio
✅ Cuotas
✅ Fleje promocional (SPID+)
✅ Imágenes personalizadas
```

#### Test Case 2.2: Navegación entre Plantillas
```
PASOS:
1. Seleccionar una plantilla
2. Usar botón "Volver" 
3. Seleccionar otra familia
4. Verificar plantillas diferentes

RESULTADO ESPERADO:
- Navegación fluida
- Plantillas cambian según familia
- Breadcrumb correcto
```

### 3. Editor de Canvas (Funcionalidad Básica)

#### Test Case 3.1: Inicialización del Editor
```
PASOS:
1. Seleccionar familia y plantilla
2. Acceder al editor
3. Verificar elementos de UI

ELEMENTOS A VERIFICAR:
✅ Toolbar con botones (Undo, Redo, Preview, Guardar, Exportar)
✅ Canvas placeholder visible
✅ Información de familia y plantilla
✅ Breadcrumb completo
✅ Estados de botones (disabled cuando corresponde)
```

#### Test Case 3.2: Funcionalidad de Toolbar
```
PASOS:
1. Probar botón "Undo" (debe estar disabled inicialmente)
2. Probar botón "Redo" (debe estar disabled inicialmente)
3. Probar botón "Preview" 
4. Probar botón "Guardar"
5. Probar botón "Exportar"

RESULTADO ESPERADO:
- Botones responden correctamente
- Estados visuales apropiados
- Mensajes de toast informativos
```

### 4. Testing de Estado y Data Management

#### Test Case 4.1: Estado del Builder
```
PASOS:
1. Abrir Developer Tools
2. Verificar que useBuilderV2 funciona
3. Comprobar estado inicial

ESTADO A VERIFICAR:
✅ families: Array con 16 familias
✅ draggableElements: Objeto con 8 categorías
✅ state.isLoading: boolean
✅ state.canvas: objeto con zoom, grid, etc.
✅ operations: objeto con métodos disponibles
```

#### Test Case 4.2: Cambios de Estado
```
PASOS:
1. Seleccionar familia → verificar state.currentFamily
2. Seleccionar plantilla → verificar state.currentTemplate
3. Cambiar zoom → verificar state.canvas.zoom

RESULTADO ESPERADO:
- Estado actualiza reactivamente
- Componentes re-renderizan apropiadamente
```

---

## 🐛 Casos de Error y Edge Cases

### Error Case 1: Navegación sin Selección
```
PASOS:
1. Intentar navegar directamente a /builder/template
2. Intentar navegar directamente a /builder/editor

RESULTADO ESPERADO:
- Redirección a selección de familias
- Mensaje informativo al usuario
```

### Error Case 2: Datos Faltantes
```
PASOS:
1. Simular familia sin plantillas
2. Simular plantilla sin elementos

RESULTADO ESPERADO:
- Manejo graceful de errores
- Mensajes informativos
- Fallbacks apropiados
```

### Error Case 3: Cambios no Guardados
```
PASOS:
1. Hacer cambios en el editor
2. Intentar navegar hacia atrás
3. Verificar confirmación

RESULTADO ESPERADO:
- Prompt de confirmación
- Opciones de guardar o descartar
```

---

## 📱 Testing de Responsive Design

### Mobile (320px - 768px)
```
ELEMENTOS A VERIFICAR:
✅ Header se adapta correctamente
✅ Cards de familias apilan verticalmente
✅ Breadcrumb se trunca apropiadamente
✅ Toolbar se reorganiza en mobile
✅ Touch interactions funcionan
```

### Tablet (768px - 1024px)
```
ELEMENTOS A VERIFICAR:
✅ Layout de 2-3 columnas en grids
✅ Sidebar se comporta correctamente
✅ Canvas mantiene proporciones
```

### Desktop (1024px+)
```
ELEMENTOS A VERIFICAR:
✅ Layout completo visible
✅ Paneles laterales funcionales
✅ Hover states apropiados
```

---

## ⚡ Métricas de Rendimiento

### Tiempo de Carga
```
MÉTRICAS OBJETIVO:
- Carga inicial: < 2 segundos
- Navegación entre pasos: < 500ms
- Renderizado de familias: < 1 segundo
- Transiciones suaves: 60fps
```

### Memoria y Recursos
```
LÍMITES OBJETIVO:
- Uso de memoria: < 50MB
- Bundle size: < 2MB
- Imágenes optimizadas: < 100KB cada una
```

### Testing en Diferentes Navegadores
```
NAVEGADORES A PROBAR:
✅ Chrome (últimas 2 versiones)
✅ Firefox (últimas 2 versiones)
✅ Safari (últimas 2 versiones)
✅ Edge (últimas 2 versiones)
```

---

## 🔍 Troubleshooting

### Problema: No cargan las familias
```
POSIBLES CAUSAS:
- Hook useBuilderV2 no está funcionando
- Configuración de tipos incorrecta
- Error en builderV2Config

SOLUCIÓN:
1. Verificar console.log en useBuilderV2
2. Comprobar importaciones de tipos
3. Revisar configuración en builderV2Config.ts
```

### Problema: Navegación no funciona
```
POSIBLES CAUSAS:
- Estado de currentStep no se actualiza
- Callbacks no están definidos correctamente

SOLUCIÓN:
1. Verificar useState de currentStep
2. Comprobar que callbacks se pasan correctamente
3. Revisar lógica de navegación condicional
```

### Problema: Estilos no se aplican
```
POSIBLES CAUSAS:
- Tailwind CSS no configurado
- Clases CSS no reconocidas

SOLUCIÓN:
1. Verificar tailwind.config.js
2. Comprobar que CSS está compilando
3. Revisar clases específicas en Developer Tools
```

---

## 📈 Checklist de Testing Completo

### ✅ Funcionalidad Básica
- [ ] Navegación entre pasos funciona
- [ ] Selección de familias funciona
- [ ] Selección de plantillas funciona
- [ ] Editor básico se muestra
- [ ] Toolbar responde correctamente
- [ ] Estado se mantiene consistente

### ✅ UI/UX
- [ ] Design system coherente
- [ ] Colores de familias correctos
- [ ] Tipografía legible
- [ ] Espaciado consistente
- [ ] Animaciones suaves
- [ ] Loading states apropiados

### ✅ Responsive Design
- [ ] Mobile layout funciona
- [ ] Tablet layout funciona
- [ ] Desktop layout funciona
- [ ] Touch interactions apropiadas

### ✅ Performance
- [ ] Tiempo de carga aceptable
- [ ] Transiciones fluidas
- [ ] Memoria bajo control
- [ ] Bundle size optimizado

### ✅ Error Handling
- [ ] Errores se manejan gracefully
- [ ] Mensajes informativos al usuario
- [ ] Fallbacks funcionan
- [ ] No crashes en navegador

---

## 🎯 Próximos Pasos de Testing

### Fase 1: Testing Básico (Actual)
- ✅ Navegación y UI básica
- ✅ Estados y configuración
- ✅ Responsive design

### Fase 2: Testing Avanzado (Próximo)
- 🔄 Drag & drop completo
- 🔄 Editor WYSIWYG
- 🔄 Integración Supabase
- 🔄 Exportación de assets

### Fase 3: Testing de Producción
- 🔄 Performance bajo carga
- 🔄 Testing de integración
- 🔄 Testing de usuarios reales
- 🔄 Métricas de analytics

---

*🚀 ¡El Builder V2 está listo para testing básico! Sigue estas instrucciones para validar toda la funcionalidad implementada.* 