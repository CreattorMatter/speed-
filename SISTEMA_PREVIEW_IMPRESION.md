# Sistema de Preview e Impresión de Carteles

## Resumen de la Implementación

Hemos implementado un sistema completo de preview e impresión para el editor de carteles que permite:

1. **Gestión de Cola de Impresión**: Los usuarios pueden agregar productos seleccionados a una cola de impresión
2. **Preview Escalado**: Visualización de miniaturas que respetan las dimensiones físicas de los carteles
3. **Impresión Profesional**: Uso de react-to-print para generar impresiones de alta calidad
4. **Configuración Avanzada**: Opciones de configuración de página, márgenes y formato

## Componentes Implementados

### 1. Tipos de Datos (`src/types/index.ts`)

```typescript
interface ProductoParaImprimir {
  idUnico: string;
  idProductoOriginal: string;
  idModeloPlantilla: string;
  plantillaHTML: string;
  estilosCSS: string;
  datosPersonalizados?: Record<string, any>;
  dimensionesFisicas: {
    ancho: number;
    alto: number;
    unidad: string;
  };
  // ... otros campos
}

interface PreviewSettings {
  showMiniatures: boolean;
  scaleToFit: boolean;
  maxItemsPerRow: number;
  aspectRatioMode: 'original' | 'square' | 'custom';
}

interface PrintSettings {
  pageBreakBetweenProducts: boolean;
  includeProductInfo: boolean;
  pageSize: 'A4' | 'A3' | 'Letter' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
```

### 2. Estado de Redux (`src/store/features/poster/posterSlice.ts`)

**Nuevos campos en el estado:**
- `productosParaImprimir: ProductoParaImprimir[]`
- `previewSettings: PreviewSettings`
- `printSettings: PrintSettings`
- `isPreviewAreaExpanded: boolean`

**Nuevas acciones:**
- `agregarProductoParaImprimir`
- `eliminarProductoParaImprimir`
- `limpiarProductosParaImprimir`
- `actualizarProductoParaImprimir`
- `actualizarPreviewSettings`
- `actualizarPrintSettings`
- `togglePreviewAreaExpanded`
- `convertirProductosSeleccionadosParaImprimir`

### 3. Componentes de UI

#### ProductPrintPreview (`src/components/Posters/Editor/ProductPrintPreview.tsx`)
- Muestra miniaturas de productos en la cola de impresión
- Respeta el aspect ratio basado en dimensiones físicas
- Incluye información del producto y controles de eliminación

#### PrintableProducts (`src/components/Posters/Editor/PrintableProducts.tsx`)
- Componente que renderiza productos para impresión
- Maneja saltos de página automáticos
- Aplica estilos específicos para impresión vs pantalla

#### PrintButtonAdvanced (`src/components/Posters/Editor/PrintButtonAdvanced.tsx`)
- Botón principal de impresión usando react-to-print
- Incluye vista previa en nueva ventana
- Botón de configuración integrado

#### PrintSettingsModal (`src/components/Posters/Editor/PrintSettings.tsx`)
- Modal para configurar opciones de impresión
- Configuración de tamaño de página, orientación y márgenes
- Opciones de salto de página y información adicional

### 4. PreviewArea Mejorado (`src/components/Posters/Editor/PreviewArea.tsx`)

**Nuevas funcionalidades agregadas:**
- Sección de "Cola de Impresión" con header informativo
- Botones para agregar productos actuales a la cola
- Botón para expandir/contraer vista previa
- Botón para limpiar toda la cola
- Grid responsivo de productos para imprimir
- Integración con el nuevo sistema de impresión

## Flujo de Trabajo

### 1. Selección y Configuración
1. Usuario selecciona productos en el editor
2. Configura plantilla, modelo y opciones
3. Hace clic en "Agregar Actuales" para enviar a cola de impresión

### 2. Gestión de Cola
1. Los productos aparecen como miniaturas en la cola
2. Cada miniatura respeta las dimensiones físicas del cartel
3. Usuario puede eliminar productos individuales o limpiar toda la cola
4. Puede expandir/contraer la vista para ver más detalles

### 3. Configuración de Impresión
1. Usuario hace clic en "Configurar" para abrir opciones
2. Ajusta tamaño de página, orientación y márgenes
3. Configura saltos de página y opciones adicionales
4. Guarda configuración

### 4. Impresión
1. Usuario hace clic en "Imprimir Carteles"
2. react-to-print genera el contenido optimizado
3. Cada producto se renderiza en su propia página (si está configurado)
4. Se aplican los estilos y configuraciones seleccionadas

## Características Técnicas

### Escalado Inteligente
- Las miniaturas calculan automáticamente el aspect ratio
- Respetan las dimensiones físicas configuradas
- Se adaptan al espacio disponible manteniendo proporciones

### Impresión Optimizada
- Uso de `@media print` para estilos específicos de impresión
- Saltos de página automáticos entre productos
- Preservación de colores y estilos originales
- Configuración de márgenes y orientación

### Estado Persistente
- La cola de impresión se mantiene durante la sesión
- Configuraciones de impresión se guardan en Redux
- Los cambios de productos se preservan en la cola

### Responsividad
- Grid adaptativo para diferentes tamaños de pantalla
- Controles optimizados para móvil y desktop
- Vista expandida para mejor visualización

## Beneficios del Sistema

1. **Flujo de Trabajo Eficiente**: Los usuarios pueden preparar múltiples carteles antes de imprimir
2. **Preview Preciso**: Las miniaturas muestran exactamente cómo se verán los carteles
3. **Configuración Flexible**: Opciones avanzadas para diferentes necesidades de impresión
4. **Calidad Profesional**: Uso de react-to-print garantiza impresiones de alta calidad
5. **Experiencia de Usuario**: Interfaz intuitiva con feedback visual claro

## Próximas Mejoras Posibles

1. **Exportación a PDF**: Generar PDFs para compartir o archivar
2. **Plantillas de Lote**: Guardar configuraciones de impresión frecuentes
3. **Vista Previa 3D**: Simulación más realista de los carteles físicos
4. **Impresión en Red**: Integración con impresoras de red
5. **Historial de Impresión**: Registro de trabajos de impresión anteriores 