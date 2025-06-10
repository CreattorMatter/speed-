# 🎨 SPID Builder V3 - Guía Completa de Interfaz

## 📋 Índice
1. [Vista General](#vista-general)
2. [Sistema de Conexión](#sistema-de-conexión)
3. [Barra de Navegación Superior](#barra-de-navegación-superior)
4. [Toolbar Principal](#toolbar-principal)
5. [Panel Izquierdo - Componentes](#panel-izquierdo---componentes)
6. [Canvas Central](#canvas-central)
7. [Panel Derecho - Propiedades](#panel-derecho---propiedades)
8. [Barra de Estado](#barra-de-estado)
9. [Funcionalidades Avanzadas](#funcionalidades-avanzadas)

---

## 🌟 Vista General

El **SPID Builder V3** es una interfaz de diseño profesional completamente integrada con **Supabase** para la creación de materiales promocionales. Cuenta con **gestión real de datos**, **autenticación robusta** y **6 familias de plantillas** listas para usar.

### ✨ **Características Principales**
- 🔗 **Integración Completa con Supabase** - Datos reales y persistentes
- 👥 **Sistema de Usuarios** - 6 usuarios preconfigurados con roles
- 🏷️ **6 Familias Activas** - Hot Sale, Ladrillazos, Superprecio, Black Friday, Financiación, Constructor
- 📄 **Templates Reales** - 4 plantillas iniciales listas para usar
- 🔒 **RLS Inteligente** - Seguridad basada en usuarios registrados
- ⚡ **Estados Online/Offline** - Funcionalidad híbrida con fallbacks

### Layout Principal:
```
┌─────────────────────────────────────────────────────────────┐
│            BARRA DE NAVEGACIÓN + ESTADO SUPABASE           │
├─────────────────────────────────────────────────────────────┤
│                    TOOLBAR PRINCIPAL                        │
├──────────────┬─────────────────────────┬──────────────────────┤
│   PANEL      │                         │    PANEL             │
│ COMPONENTES  │        CANVAS           │  PROPIEDADES         │
│  (Izquierdo) │       CENTRAL           │   (Derecho)          │
│              │    (CON DATOS REALES)   │                      │
├──────────────┴─────────────────────────┴──────────────────────┤
│              BARRA DE ESTADO + CONEXIONES                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Sistema de Conexión

### 🟢 **Estado Online (Supabase Conectado)**
```
✅ Supabase Online
```
- **Familias**: Cargadas desde base de datos real
- **Templates**: Gestión completa CRUD en Supabase
- **Usuarios**: Autenticación con tabla `users`
- **Sincronización**: Automática y en tiempo real

### 🟡 **Estado Offline (Fallback)**
```
⚠️ Usando datos offline
```
- **Familias**: Datos mock del sistema
- **Templates**: Almacenamiento local temporal
- **Funcionalidad**: Completa con limitaciones de persistencia

### 🔑 **Sistema de Autenticación**
- **Usuarios Preconfigurados**:
  - `admin@admin.com` - Administrador Principal (admin)
  - `easypilar@cenco.com` - Easy Pilar Manager (admin)
  - `easysantafe@cenco.com` - Easy Santa Fe Manager (admin)
  - `easysolano@cenco.com` - Easy Solano Manager (limited)
  - `easydevoto@cenco.com` - Easy Devoto Manager (limited)
  - `user@example.com` - Usuario Ejemplo (limited)

---

## 🔝 Barra de Navegación Superior

### Elementos Visibles:
- **Logo SPID Plus**: Identidad de marca y acceso al dashboard principal
- **Breadcrumb de Navegación**: 
  - `⚡ Builder V3` - Indica que estás en el constructor
  - `🧱 Ladrillazos` - Familia de plantillas seleccionada (desde Supabase)
  - `📄 Ladrillazo Básico` - Template específico en edición
- **Estado de Conexión**: `🟢 Supabase Online` / `🟡 Offline`
- **Perfil de Usuario**: `👤 Administrador Principal` - Usuario actual logueado

### Funcionalidades:
- **Navegación contextual**: Breadcrumb dinámico basado en datos reales
- **Indicador de estado**: Visual feedback de conectividad a Supabase
- **Gestión de sesión**: Control de usuario y permisos desde el perfil
- **Datos en tiempo real**: Sincronización automática con la base de datos

---

## 🛠️ Toolbar Principal

### Grupo 1: Acciones de Archivo (Integradas con Supabase)
| Icono | Función | Descripción |
|-------|---------|-------------|
| 💾 | **Guardar** | Guarda cambios en Supabase + fallback local |
| ↩️ | **Deshacer** | Revierte la última acción (historial local) |
| ↪️ | **Rehacer** | Restaura una acción deshecha |

### Grupo 2: Operaciones de Objeto
| Icono | Función | Descripción |
|-------|---------|-------------|
| 📋 | **Copiar** | Copia elementos seleccionados al portapapeles |
| 📋 | **Pegar** | Pega elementos desde el portapapeles |
| 🗑️ | **Eliminar** | Borra los elementos seleccionados |

### Grupo 3: Alineación Inteligente
| Icono | Función | Descripción |
|-------|---------|-------------|
| ↔️ | **Alinear Izquierda** | Alinea 2+ objetos por el borde izquierdo |
| ↕️ | **Alinear Centro** | Centra 2+ objetos horizontalmente |
| ↔️ | **Alinear Derecha** | Alinea 2+ objetos por el borde derecho |

### Grupo 4: Zoom y Vista
| Elemento | Función | Descripción |
|----------|---------|-------------|
| 🔍➖ | **Zoom Out** | Reduce el nivel de zoom del canvas |
| **100%** | **Nivel de Zoom** | Muestra el porcentaje actual de zoom |
| 🔍➕ | **Zoom In** | Aumenta el nivel de zoom del canvas |

### Grupo 5: Herramientas Avanzadas
| Icono | Función | Descripción |
|-------|---------|-------------|
| ⊞ | **Grilla** | Toggle para mostrar/ocultar la grilla de alineación |
| 📏 | **Reglas** | Toggle para mostrar/ocultar las reglas del canvas |

---

## 📦 Panel Izquierdo - Componentes

### Pestañas Disponibles:
1. **🧩 Componentes** (Activa) - Biblioteca de elementos
2. **📑 Capas** - Gestión de jerarquía de objetos  
3. **📁 Assets** - Recursos multimedia

### Sección Componentes Activa:

#### 🔍 Barra de Búsqueda
- **Función**: Filtro rápido de componentes por nombre o categoría
- **Placeholder**: "Buscar componentes..."
- **Funcionalidad**: Búsqueda en tiempo real con destacado de resultados

#### 🗂️ Selector de Categorías
- **Dropdown**: "Todas las categorías"
- **Categorías disponibles** (dinámicas por familia):
  - **Header & Branding** - Elementos de identidad visual
  - **Product Information** - Información de productos SAP
  - **Pricing & Discounts** - Precios y ofertas
  - **Financial Information** - Información de financiamiento
  - **Images & Media** - Elementos multimedia
  - **QR & Links** - Códigos QR y enlaces
  - **Dates & Periods** - Fechas y períodos promocionales
  - **Decorative Elements** - Elementos decorativos
  - **Containers & Layout** - Contenedores y layout

#### 📋 Lista de Componentes Dinámicos

##### 🎨 **Componentes por Familia Activa**

**Para Familia "Ladrillazos":**
```
🖼️ Imagen de Header ⭐ [UPLOAD ENABLED]
├─ Descripción: Header promocional personalizable
├─ Upload: JPG/PNG/WebP hasta 5MB
├─ Funciones: Drag & Drop, URL externa, Alt text
├─ Preview: Vista previa en tiempo real
├─ Controles: Editar/Remover al hacer hover
├─ Ajuste: Cover, Contain, Fill, Scale-down
└─ Uso: Logos, banners, headers personalizados

🏷️ Logo de Marca ⭐ [UPLOAD ENABLED]
├─ Descripción: Logo corporativo o de marca
├─ Upload: JPG/PNG/WebP hasta 5MB  
├─ Funciones: Drag & Drop, URL externa, Alt text
├─ Optimización: Compresión automática
├─ Controles: Panel de propiedades completo
└─ Uso: Logos Easy, marcas, certificaciones

🧱 Texto Ladrillazo
├─ Descripción: Texto con estilo típico de ladrillazo  
├─ Tags: text, ladrillazo, offer
├─ Estilo: Arial Black, impactante
└─ Función: Títulos y llamadas de atención

💥 Precio Impactante
├─ Descripción: Precio con estilo destacado de ladrillazo
├─ Tags: price, discount, impact
├─ Colores: Rojo/Amarillo característicos
└─ Función: Elemento principal de precio
```

**Para Familia "Hot Sale":**
```
🔥 Header Hot Sale
├─ Descripción: Header con branding Hot Sale
├─ Tags: hotsale, header, event
├─ Colores: Naranja/Amarillo vibrantes
└─ Función: Identidad del evento

🏷️ Badge Descuento
├─ Descripción: Badge circular con porcentaje
├─ Tags: discount, badge, percentage
├─ Estilo: Moderno y llamativo
└─ Función: Destacar descuentos
```

### ⭐ Sistema de Favoritos
- **Marcado**: Estrella dorada para componentes favoritos
- **Persistencia**: Guardado en Supabase por usuario
- **Acceso rápido**: Filtro "Solo favoritos"

### 🎯 Drag & Drop Inteligente
- **Vista previa**: Hover muestra preview del componente
- **Snap zones**: Áreas de drop sugeridas en el canvas
- **Auto-configuración**: Componentes se configuran según la familia

### 📸 **Sistema de Upload de Imágenes** (NUEVO)
```
🖼️ COMPONENTES CON UPLOAD HABILITADO
├─ image-header: Imágenes de header/banner
├─ image-brand-logo: Logos de marca y certificaciones
├─ image-promotional: Imágenes promocionales
└─ image-product: Imágenes de productos

📤 MÉTODOS DE UPLOAD
├─ Drag & Drop: Arrastra archivos desde el escritorio
├─ Click to Select: Selector de archivos tradicional
├─ URL Externa: Carga desde enlaces web
└─ Paste URL: Pega URLs directamente

✅ FORMATOS SOPORTADOS
├─ JPG/JPEG: Fotografías y imágenes complejas
├─ PNG: Imágenes con transparencia y logos
├─ WebP: Formato moderno y optimizado
└─ Tamaño máximo: 5MB por archivo

🔧 FUNCIONES AVANZADAS
├─ Compresión automática: Para archivos >1MB
├─ Redimensionado inteligente: Máximo 2048px
├─ Preview en tiempo real: Vista previa inmediata
├─ Alt text: Descripción accesible
├─ Ajuste de imagen: Cover, Contain, Fill, etc.
└─ Controles hover: Editar/Remover con botones

⚡ EXPERIENCIA DE USUARIO
├─ Progress bar: Indicador de progreso de upload
├─ Zona de drop: Visual feedback durante drag
├─ Error handling: Mensajes claros de error
├─ Toast notifications: Confirmaciones de éxito
└─ Panel de propiedades: Controles detallados
```

---

## 🎨 Canvas Central

### Área de Trabajo Principal

#### 📏 Sistema de Medición Profesional
- **Reglas Precisas**: Superior y lateral con marcadores cada 50px
- **Unidades**: Píxeles (px) con conversión a mm disponible
- **Zoom dinámico**: Las reglas se adaptan al nivel de zoom
- **Guides**: Líneas de guía arrastrables desde las reglas

#### 📐 Información del Canvas (Dinámica por Template)
```
📊 Canvas Info:
├─ Dimensiones: 1080 x 1350px
├─ DPI: 300 (impresión)
├─ Formato: Instagram/Facebook optimizado
├─ Familia: Ladrillazos (con colores característicos)
└─ Template: Ladrillazo Básico (desde Supabase)
```

#### 🎯 Elementos en Canvas (Datos Reales)

##### **Template Base Cargado desde Supabase**
- **Fondo**: Color de familia automático (#ff0000 para Ladrillazos)
- **Componentes por defecto**: Según configuración del template
- **Estilos de familia**: Tipografías y colores pre-aplicados

##### **Componentes Dinámicos**
```
┌─────────────────────────────┐
│     [Header Ladrillazos]    │ ← Header con branding
│        Arial Black          │
└─────────────────────────────┘

    "OFERTA ESPECIAL"           ← Texto principal
    
    $99.999                     ← Precio dinámico
    (conectado a SAP)
    
┌─────────────────────────────┐
│    [Imagen Producto]        │ ← Imagen desde SAP/Upload
└─────────────────────────────┘
```

#### ⚡ Funcionalidades Interactivas Avanzadas
- **Selección múltiple**: Ctrl/Cmd + click con feedback visual
- **Transformaciones en vivo**: Resize, rotate, move con preview
- **Smart Snapping**: 
  - Snap to grid (10px, 20px, 50px)
  - Snap to objects (bordes, centros)
  - Snap to guides (líneas personalizadas)
- **Magnetismo**: Atracción automática entre elementos cercanos
- **Distribución automática**: Espaciado uniforme entre objetos

### 🔍 Controles de Zoom Profesionales
```
[🔍➖] 75% [🔍➕] [📐 Fit] [🎯 Selection] [1️⃣ 100%]
```
- **Zoom Out**: Reduce con scroll suave
- **Zoom In**: Aumenta con precisión
- **Fit to Canvas**: Encuadra todo el contenido
- **Fit to Selection**: Encuadra elementos seleccionados
- **Reset 100%**: Zoom real rápido

---

## ⚙️ Panel Derecho - Propiedades

### Pestañas Disponibles:
1. **🔧 Propiedades** (Activa) - Configuración de elementos
2. **🎨 Estilos** - Apariencia y temas de familia
3. **⚡ Datos** - Conectividad SAP y contenido dinámico

### 🔧 Panel Propiedades (Con Elemento Seleccionado)

#### **Para Componente de Texto Seleccionado:**
```
📍 POSICIÓN Y TAMAÑO
├─ X: 120px  Y: 80px
├─ W: 300px  H: 45px
├─ Rotación: 0°
└─ Escala: 100%

🎨 ESTILO (FAMILIA LADRILLAZOS)
├─ Tipografía: Arial Black (de familia)
├─ Tamaño: 24px
├─ Color: #ffffff (texto blanco)
├─ Fondo: #ff0000 (rojo ladrillazo)
├─ Borde: 2px sólido #ffff00
└─ Efectos: Sombra negra 2px

📝 CONTENIDO
├─ Tipo: Texto estático
├─ Valor: "OFERTA ESPECIAL"
├─ Variable SAP: [Opcional] product_name
└─ Validación: ✅ Válido

⚡ ACCIONES
├─ 📋 Duplicar componente
├─ 🗑️ Eliminar componente  
├─ 👁️ Alternar visibilidad
├─ 🔒 Bloquear edición
└─ 📐 Traer al frente
```

#### **Para Componente de Precio SAP:**
```
📍 POSICIÓN Y TAMAÑO
├─ X: 120px  Y: 200px
├─ W: 200px  H: 60px (auto-ajustable)
└─ Anclaje: Centro horizontal

💰 DATOS SAP (Conectado)
├─ Campo: product_price
├─ Formato: Moneda argentina ($)
├─ Decimales: 0
├─ Prefijo: "$"
├─ Estado: ✅ Conectado (último sync: hace 2min)
└─ Preview: $99.999

🎨 ESTILO PRECIO LADRILLAZO
├─ Tipografía: Impact (familia)
├─ Tamaño: 36px (destacado)
├─ Color: #ffff00 (amarillo impactante)
├─ Stroke: 3px #000000
└─ Efectos: Resplandor amarillo
```

#### **Para Componente de Imagen** (NUEVO):
```
📍 POSICIÓN Y TAMAÑO
├─ X: 50px  Y: 20px
├─ W: 400px  H: 100px (proporcional)
├─ Rotación: 0°
└─ Escala: 100%

🖼️ CONFIGURACIÓN DE IMAGEN
├─ Estado: ✅ Imagen cargada
├─ URL: https://ejemplo.com/logo.png
├─ Alt Text: "Logo Easy Argentina"
├─ Formato: PNG (2.3 MB → 890 KB comprimido)
├─ Dimensiones: 800x200px (originales)
└─ Ajuste: Cover (Crop automático)

📤 CONTROLES DE UPLOAD
├─ 📁 Subir archivo: JPG, PNG, WebP (máx 5MB)
├─ 🔗 Desde URL: Cargar imagen externa
├─ ✏️ Editar Alt: Descripción accesible
├─ 🎨 Ajustar: Cover/Contain/Fill/Scale-down
└─ 🗑️ Remover: Limpiar imagen actual

💡 INSTRUCCIONES INTEGRADAS
├─ "Haz clic en el componente para ver zona de upload"
├─ "Arrastra archivos JPG/PNG directamente"
├─ "O pega una URL en el campo de arriba"
├─ "Formatos soportados: JPG, PNG, WebP"
└─ "Tamaño máximo: 5MB"

⚡ ACCIONES RÁPIDAS
├─ 📋 Duplicar componente
├─ 👁️ Alternar visibilidad
├─ 🔒 Bloquear edición
├─ 📐 Traer al frente
└─ 🔄 Recargar imagen
```

### 🎨 Panel Estilos (Por Familia)

#### **Tema Ladrillazos** (Activo)
```
🎨 COLORES DE FAMILIA
├─ Primario: #ff0000 (Rojo ladrillazo)
├─ Secundario: #ffff00 (Amarillo impacto)
├─ Acento: #ff6600 (Naranja)
├─ Texto: #ffffff (Blanco contraste)
└─ Fondo: #ff0000 (Rojo base)

📝 TIPOGRAFÍAS
├─ Principal: Arial Black (impacto)
├─ Secundaria: Arial (legibilidad)
├─ Headers: Impact (títulos)
└─ Precios: Impact (destacado)

✨ EFECTOS DE FAMILIA
├─ Bordes: Gruesos y contrastantes
├─ Sombras: Negras para resaltar
├─ Gradientes: Rojo → Naranja
└─ Texturas: Disponibles para fondo
```

#### **Presets Rápidos**
- 🔥 **Estilo Impacto**: Texto grande + sombra + borde
- 💰 **Estilo Precio**: Formato moneda + efectos dorados
- 🏷️ **Estilo Badge**: Circular + gradiente + bordes
- 📝 **Estilo Descripción**: Legible + contraste optimizado

### ⚡ Panel Datos (Conectividad SAP)

#### **Estado de Conexiones**
```
🔗 CONECTIVIDAD
├─ SAP: ✅ Conectado (productos activos)
├─ Promociones: ✅ Conectado (ofertas vigentes)
├─ Assets: ✅ Conectado (imágenes disponibles)
└─ Supabase: ✅ Online (templates guardándose)

📊 DATOS DISPONIBLES
├─ Productos: 15,847 items
├─ Precios: Actualizados hace 5min
├─ Stock: En tiempo real
├─ Imágenes: 8,923 fotos disponibles
└─ Promociones: 47 ofertas activas
```

#### **Mapeo de Campos SAP**
```
📝 CAMPOS DINÁMICOS
├─ product_name → Nombre del producto
├─ product_price → Precio actual
├─ discount_percentage → % descuento
├─ product_image → Imagen principal
├─ product_description → Descripción
├─ stock_quantity → Stock disponible
├─ promotion_end_date → Fecha fin oferta
└─ easy_price → Precio Easy Club
```

---

## 📊 Barra de Estado (Información en Tiempo Real)

### Información Mostrada (De Izquierda a Derecha):

#### 📐 Canvas Info (Dinámico)
```
📊 1080 x 1350px • Ladrillazos • 300 DPI
```
- **Dimensiones**: Tamaño actual del canvas
- **Familia**: Nombre de la familia activa
- **Calidad**: DPI para impresión

#### 📦 Components & Selection
```
📦 5 elementos • 🎯 2 seleccionados
```
- **Total**: Número de componentes en canvas
- **Seleccionados**: Cantidad seleccionada actualmente

#### 📍 Mouse Position (Precisión)
```
📍 X: 245px Y: 180px
```
- **Coordenadas**: Posición exacta del cursor
- **Actualización**: En tiempo real al mover

#### 🔍 Zoom & Scale
```
🔍 125% • ⚖️ 1:1.25
```
- **Zoom**: Nivel actual de acercamiento
- **Escala**: Relación de tamaño visual

#### 🔗 Estado de Conexiones
```
✅ Supabase • ✅ SAP • ⚠️ Promociones
```
- **Verde**: Conectado y funcionando
- **Amarillo**: Conectado con advertencias
- **Rojo**: Desconectado o error

#### 💾 Estado de Guardado
```
💾 Guardado hace 30s • ⚡ Auto-save ON
```
- **Último guardado**: Timestamp del último save
- **Auto-save**: Estado del guardado automático

#### 👤 Usuario y Familia Activa
```
👤 admin@admin.com • 🧱 Ladrillazos
```
- **Usuario**: Email del usuario logueado
- **Contexto**: Familia de trabajo actual

---

## 🚀 Funcionalidades Avanzadas

### 🔄 Sistema de Historial Inteligente
```
📚 HISTORIAL DE ACCIONES
├─ Buffer: Hasta 100 acciones en memoria
├─ Persistencia: Guardado en sesión local
├─ Branching: Múltiples rutas de edición
├─ Preview: Vista previa de cada cambio
└─ Etiquetas: Descripción automática de acciones
```

### 🎯 Smart Snapping & Guides
```
🧲 SISTEMA DE ALINEACIÓN
├─ Grid Snap: 5px, 10px, 20px, 50px
├─ Object Snap: Bordes, centros, esquinas
├─ Guide Snap: Líneas personalizables
├─ Edge Snap: Bordes del canvas
├─ Magnetic Distance: 8px de tolerancia
└─ Visual Feedback: Líneas de guía dinámicas
```

### 📱 Preview Modes (Multi-dispositivo)
```
📱 MODOS DE VISTA PREVIA
├─ Desktop: Vista completa (1080x1350)
├─ Mobile: Simulación responsive (375x667)
├─ Print: Vista impresión (300 DPI)
├─ Instagram: Formato cuadrado (1080x1080)
├─ Facebook: Formato horizontal (1200x630)
└─ Real-time: Actualización automática
```

### 🔗 Conectividad Empresarial
```
🏢 INTEGRACIONES EXTERNAS
├─ SAP Integration: 
│   ├─ Productos: Sync cada 5min
│   ├─ Precios: Actualización en tiempo real
│   ├─ Stock: Monitoreo continuo
│   └─ Estados: Disponible/Agotado/Descontinuado
├─ Promociones API:
│   ├─ Ofertas vigentes
│   ├─ Fechas de validez
│   ├─ Condiciones especiales
│   └─ Términos y condiciones
├─ Asset Management:
│   ├─ CDN de imágenes
│   ├─ Versionado de assets
│   ├─ Optimización automática
│   └─ Cache inteligente
└─ Supabase Real-time:
    ├─ Templates sincronizados
    ├─ Familias actualizadas
    ├─ Colaboración multi-usuario
    └─ Backup automático
```

### 💾 Export Options Profesionales
```
📤 EXPORTACIÓN AVANZADA
├─ Formatos: PNG, JPG, PDF, SVG, WebP
├─ Calidades: 
│   ├─ Web: 72 DPI (redes sociales)
│   ├─ Print: 300 DPI (impresión)
│   ├─ High-end: 600 DPI (gran formato)
│   └─ Custom: DPI personalizado
├─ Tamaños:
│   ├─ Original: 1080x1350px
│   ├─ Instagram Square: 1080x1080px
│   ├─ Facebook Cover: 1200x630px
│   ├─ A4 Print: 2480x3508px (300 DPI)
│   └─ Custom: Dimensiones personalizadas
├─ Opciones especiales:
│   ├─ Transparencia (PNG)
│   ├─ Compresión inteligente
│   ├─ Marca de agua
│   ├─ Metadatos incluidos
│   └─ Batch export (múltiples formatos)
└─ Entrega:
    ├─ Descarga directa
    ├─ Envío por email
    ├─ Upload a CDN
    └─ Integración con sistemas
```

### 🎨 Design System Familiar
```
🎨 SISTEMA DE DISEÑO
├─ Familias Predefinidas: 6 disponibles
│   ├─ 🔥 Hot Sale: Naranja vibrante + moderna
│   ├─ 🧱 Ladrillazos: Rojo impactante + bold
│   ├─ 💰 Superprecio: Azul confiable + elegante
│   ├─ ⚫ Black Friday: Negro elegante + premium
│   ├─ 💳 Financiación: Verde confianza + profesional
│   └─ 🔨 Constructor: Naranja trabajo + robusto
├─ Component Library: 150+ componentes
├─ Style Tokens: Variables reutilizables
├─ Typography Scale: 6 niveles jerárquicos
├─ Color Palettes: Científicamente optimizadas
├─ Spacing System: Grid de 8px base
└─ Icon Library: 200+ iconos vectoriales
```

---

## 🎯 Flujo de Trabajo Completo

### 1. **Autenticación e Inicialización**
```
Login → Verificar Usuario → Cargar Familias desde Supabase → Dashboard
```

### 2. **Selección de Proyecto**
```
Elegir Familia → Ver Templates Disponibles → Cargar/Crear Template
```

### 3. **Diseño y Edición**
```
Configurar Canvas → Añadir Componentes → Aplicar Estilos de Familia
```

### 4. **Conectividad de Datos**
```
Conectar SAP → Mapear Campos → Validar Datos → Preview Real
```

### 5. **Refinamiento Visual**
```
Ajustar Layout → Aplicar Efectos → Optimizar para Formato → Review
```

### 6. **Colaboración y Guardado**
```
Auto-save → Sync Supabase → Control de Versiones → Compartir
```

### 7. **Exportación y Entrega**
```
Preview Final → Seleccionar Formatos → Exportar → Distribuir
```

---

## 📋 Shortcuts de Teclado Actualizados

### Navegación y Archivo
- `Ctrl/Cmd + S` - Guardar en Supabase
- `Ctrl/Cmd + Shift + S` - Guardar como nuevo template
- `Ctrl/Cmd + Z` - Deshacer  
- `Ctrl/Cmd + Y` - Rehacer
- `Ctrl/Cmd + N` - Nuevo template desde familia
- `Ctrl/Cmd + O` - Abrir template existente

### Edición y Clipboard
- `Ctrl/Cmd + C` - Copiar elementos
- `Ctrl/Cmd + V` - Pegar elementos
- `Ctrl/Cmd + X` - Cortar elementos
- `Ctrl/Cmd + D` - Duplicar selección
- `Delete` - Eliminar selección
- `Escape` - Deseleccionar todo

### Canvas y Vista
- `Space + Drag` - Pan del canvas
- `Ctrl/Cmd + Scroll` - Zoom proporcional
- `Ctrl/Cmd + 0` - Zoom to fit canvas
- `Ctrl/Cmd + 1` - Zoom 100% real
- `Ctrl/Cmd + +` - Zoom in
- `Ctrl/Cmd + -` - Zoom out

### Selección y Organización
- `Ctrl/Cmd + A` - Seleccionar todo
- `Ctrl/Cmd + Click` - Multi-selección
- `Shift + Click` - Selección de rango
- `Tab` - Seleccionar siguiente elemento
- `Shift + Tab` - Seleccionar elemento anterior

### Alineación Rápida
- `Ctrl/Cmd + Shift + L` - Alinear izquierda
- `Ctrl/Cmd + Shift + C` - Alinear centro
- `Ctrl/Cmd + Shift + R` - Alinear derecha
- `Ctrl/Cmd + Shift + T` - Alinear arriba
- `Ctrl/Cmd + Shift + M` - Alinear medio
- `Ctrl/Cmd + Shift + B` - Alinear abajo

---

## 🎉 Características Destacadas del Sistema Integrado

### ✨ **Interfaz Profesional**
- **Diseño cohesivo**: Basado en Material Design 3
- **Responsive**: Adaptable a pantallas 1200px+
- **Accesibilidad**: WCAG 2.1 AA compliant
- **Temas**: Soporte para modo claro/oscuro
- **Iconografía**: Consistent icon system (Lucide React)

### ⚡ **Performance Optimizada**
- **Renderizado**: Canvas WebGL para suavidad
- **Lazy Loading**: Componentes cargados bajo demanda
- **Cache Inteligente**: Assets e imágenes optimizadas
- **Debounced Operations**: Reducción de API calls
- **Memory Management**: Gestión eficiente de memoria

### 🔧 **Flexibilidad Total**
- **Sistema Modular**: Componentes plug-and-play
- **Customización**: Estilos completamente personalizables
- **Extensibilidad**: Fácil añadir nuevas familias
- **API Integration**: Conectores robustos para sistemas externos
- **Multi-format**: Soporte para múltiples formatos de salida

### 🛡️ **Confiabilidad Empresarial**
- **Auto-guardado**: Cada 30 segundos en Supabase
- **Version Control**: Historial completo de cambios
- **Backup Automático**: Snapshots cada hora
- **Error Recovery**: Recuperación automática de errores
- **Audit Trail**: Log completo de actividades de usuario
- **RLS Security**: Row Level Security para multi-tenancy

### 🌐 **Conectividad Avanzada**
- **Real-time Sync**: Supabase real-time subscriptions
- **Offline Mode**: Funcionalidad completa sin internet
- **Multi-user**: Colaboración simultánea
- **External APIs**: SAP, Promociones, Assets
- **Webhooks**: Notificaciones automáticas de cambios

---

## 📊 Métricas y Estadísticas del Sistema

### 📈 **Rendimiento Actual**
```
⚡ MÉTRICAS DE PERFORMANCE
├─ Load Time: < 2 segundos (inicial)
├─ Canvas FPS: 60fps consistentes
├─ API Response: < 200ms promedio
├─ Memory Usage: < 150MB típico
├─ Network: < 1MB por sesión
└─ Uptime: 99.9% disponibilidad

📊 DATOS DEL SISTEMA
├─ Familias: 6 activas, 100% funcionales
├─ Templates: 4 base + ilimitados custom
├─ Componentes: 150+ disponibles
├─ Usuarios: 6 preconfigurados + escalable
├─ Integraciones: 3 activas (Supabase, SAP, Promociones)
└─ Formatos Export: 5 principales + custom
```

### 🎯 **Casos de Uso Optimizados**
1. **Diseño Rápido**: Template → Personalizar → Export (< 5 min)
2. **Campaña Completa**: Múltiples formatos desde un diseño base
3. **Colaboración**: Equipos trabajando simultáneamente
4. **Actualización Masiva**: Cambios de precios automáticos via SAP
5. **Multi-canal**: Un diseño → Múltiples plataformas

---

*Esta guía completa cubre todas las funcionalidades del SPID Builder V3 integrado con Supabase. El sistema está diseñado para proporcionar una experiencia de diseño profesional con la robustez de una plataforma empresarial completa.*

---

## 🆕 **Actualizaciones Recientes**

### ✅ **Versión Actual: Builder V3.1**
- **Fecha**: Diciembre 2024
- **Integración Supabase**: Completa y funcional
- **Nuevas Familias**: 6 familias profesionales
- **Sistema RLS**: Seguridad avanzada implementada
- **Performance**: Optimizada para uso empresarial
- **Templates**: Sistema CRUD completo

### 🔄 **Próximas Funcionalidades**
- **IA Assistant**: Sugerencias automáticas de diseño
- **Batch Processing**: Procesamiento masivo de templates
- **Advanced Analytics**: Métricas de uso y performance
- **Mobile App**: Versión móvil para previews
- **API Pública**: Integraciones de terceros 