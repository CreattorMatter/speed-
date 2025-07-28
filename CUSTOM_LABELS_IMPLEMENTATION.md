# 🏷️ Etiquetas Personalizadas - SPID Builder V3

## 📋 Descripción

Se ha implementado una nueva funcionalidad que permite agregar etiquetas personalizadas a los componentes desde el panel de propiedades. Esta característica permite a los usuarios identificar y organizar mejor sus componentes con nombres descriptivos y colores distintivos.

## ✨ Características Implementadas

### 🎯 **Panel de Propiedades - Nueva Sección**

#### **Sección: Etiqueta Personalizada**
- ✅ **Checkbox "Mostrar etiqueta"** - Activa/desactiva la visualización de la etiqueta
- ✅ **Campo de texto "Nombre de la etiqueta"** - Permite escribir un nombre personalizado
- ✅ **Selector de colores predefinidos** - 10 colores comunes (Rojo, Naranja, Amarillo, Verde, Azul, Púrpura, Rosa, Gris, Negro, Blanco)
- ✅ **Selector de color personalizado** - Input de color HTML5 + campo de texto para códigos hexadecimales

### 🎨 **Colores Disponibles**

```typescript
const LABEL_COLORS = [
  { name: 'Rojo', value: '#ef4444', bgClass: 'bg-red-500' },
  { name: 'Naranja', value: '#f97316', bgClass: 'bg-orange-500' },
  { name: 'Amarillo', value: '#eab308', bgClass: 'bg-yellow-500' },
  { name: 'Verde', value: '#22c55e', bgClass: 'bg-green-500' },
  { name: 'Azul', value: '#3b82f6', bgClass: 'bg-blue-500' },
  { name: 'Púrpura', value: '#8b5cf6', bgClass: 'bg-purple-500' },
  { name: 'Rosa', value: '#ec4899', bgClass: 'bg-pink-500' },
  { name: 'Gris', value: '#6b7280', bgClass: 'bg-gray-500' },
  { name: 'Negro', value: '#000000', bgClass: 'bg-black' },
  { name: 'Blanco', value: '#ffffff', bgClass: 'bg-white border border-gray-300' }
];
```

### 🖼️ **Visualización en el Canvas**

- ✅ **Etiqueta flotante** - Se muestra encima del componente seleccionado
- ✅ **Borde del mismo color** - El componente se bordea con el color de la etiqueta
- ✅ **Posicionamiento automático** - Aparece en la parte superior del componente
- ✅ **Estilo visual** - Fondo de color, texto blanco, bordes redondeados
- ✅ **Responsive** - Se adapta al zoom del canvas
- ✅ **No interferencia** - No bloquea la interacción con el componente

## 🔧 **Implementación Técnica**

### **Estructura de Datos**

```typescript
interface CustomLabel {
  name: string;           // Nombre personalizado para la etiqueta
  color: string;         // Color de fondo (ej: '#ff4444')
  textColor?: string;    // Color del texto (opcional, por defecto blanco)
  show: boolean;         // Mostrar/ocultar etiqueta
}
```

### **Archivos Modificados**

1. **`PropertiesTab.tsx`** - Nueva sección de etiquetas personalizadas
2. **`ComponentRenderer.tsx`** - Renderizado de etiquetas en el canvas
3. **`useBuilderV3.ts`** - Inicialización de customLabel en nuevos componentes
4. **`types/index.ts`** - Definición de tipos (ya existía)

### **Funcionalidades del Panel**

#### **1. Control de Visibilidad**
```typescript
const handleLabelShowChange = (show: boolean) => {
  onComponentUpdate(selectedComponent.id, {
    customLabel: {
      ...customLabel,
      show
    }
  });
};
```

#### **2. Cambio de Nombre**
```typescript
const handleLabelNameChange = (name: string) => {
  onComponentUpdate(selectedComponent.id, {
    customLabel: {
      ...customLabel,
      name
    }
  });
};
```

#### **3. Cambio de Color**
```typescript
const handleLabelColorChange = (color: string) => {
  onComponentUpdate(selectedComponent.id, {
    customLabel: {
      ...customLabel,
      color
    }
  });
};
```

## 🎯 **Casos de Uso**

### **1. Organización de Componentes**
- Etiquetar componentes de precio como "Precio Principal"
- Etiquetar logos como "Logo Marca"
- Etiquetar imágenes de producto como "Foto Producto"

### **2. Identificación Rápida**
- Usar colores diferentes para diferentes tipos de contenido
- Verde para precios, Azul para títulos, Rojo para descuentos

### **3. Colaboración en Equipo**
- Facilitar la comunicación sobre qué componente es qué
- Mejorar la experiencia de revisión de diseños

## 🚀 **Cómo Usar**

1. **Seleccionar un componente** en el canvas
2. **Ir al panel de propiedades** (pestaña "Propiedades")
3. **Activar "Mostrar etiqueta"** con el checkbox
4. **Escribir un nombre** en el campo "Nombre de la etiqueta"
5. **Seleccionar un color** de los predefinidos o usar el selector personalizado
6. **La etiqueta aparecerá** encima del componente en el canvas
7. **El borde del componente** cambiará al mismo color de la etiqueta

## 🔄 **Persistencia de Datos**

- Las etiquetas se guardan automáticamente con el componente
- Se mantienen al duplicar componentes
- Se incluyen en el historial de acciones
- Se exportan con la plantilla

## 🎨 **Personalización Visual**

### **Estilo de la Etiqueta**
```css
{
  position: 'absolute',
  top: '-24px',
  left: '0',
  backgroundColor: component.customLabel.color,
  color: component.customLabel.textColor || 'white',
  padding: '2px 6px',
  borderRadius: '3px',
  fontSize: '10px',
  fontWeight: 'bold',
  zIndex: 20,
  whiteSpace: 'nowrap',
  pointerEvents: 'none'
}
```

## 📱 **Responsive y Accesibilidad**

- ✅ **Zoom compatible** - Las etiquetas se escalan con el zoom del canvas
- ✅ **No interferencia** - Las etiquetas no bloquean la interacción
- ✅ **Contraste adecuado** - Texto blanco por defecto para mejor legibilidad
- ✅ **Tooltips informativos** - Los botones de color tienen tooltips con nombres

## 🔮 **Futuras Mejoras**

- [ ] **Posicionamiento personalizable** - Permitir mover la etiqueta
- [ ] **Múltiples etiquetas** - Más de una etiqueta por componente
- [ ] **Filtrado por etiquetas** - Filtrar componentes por color/nombre
- [ ] **Exportación de etiquetas** - Incluir etiquetas en PDFs
- [ ] **Plantillas de etiquetas** - Predefinir etiquetas comunes

---

## ✅ **Estado de Implementación**

**COMPLETADO** ✅ - La funcionalidad está completamente implementada y lista para usar.

**Archivos modificados:**
- ✅ `src/features/builderV3/components/PropertiesPanel/PropertiesTab.tsx`
- ✅ `src/features/builderV3/hooks/useBuilderV3.ts`
- ✅ `src/features/builderV3/components/Canvas/ComponentRenderer.tsx` (ya tenía la implementación)

**Funcionalidades:**
- ✅ Panel de propiedades con controles de etiquetas
- ✅ Selector de colores predefinidos y personalizados
- ✅ Borde del componente del mismo color que la etiqueta
- ✅ Renderizado en el canvas
- ✅ Persistencia de datos
- ✅ Inicialización automática en nuevos componentes 