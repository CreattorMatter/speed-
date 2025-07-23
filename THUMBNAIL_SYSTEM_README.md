# 🖼️ Sistema de Thumbnails Automático - BuilderV3

Este sistema genera automáticamente thumbnails en formato JPG cuando se guarda una plantilla en BuilderV3, creando previsualizaciones en miniatura para mostrar en las tarjetas de la librería de plantillas.

## ✨ Características

- ✅ **Generación automática**: Se ejecuta automáticamente al guardar una plantilla
- ✅ **Formato JPG optimizado**: Thumbnails de alta calidad en formato comprimido
- ✅ **Múltiples resoluciones**: Soporte para diferentes tamaños (150x188, 300x375, 600x750)
- ✅ **Gestión inteligente**: Elimina thumbnails anteriores automáticamente
- ✅ **Integración completa**: Funciona seamlessly con Supabase Storage (bucket `assets`)
- ✅ **Feedback visual**: Notificaciones de progreso para el usuario

## 🎯 Cómo Funciona

### Flujo Automático
1. Usuario hace clic en "Guardar" en ToolbarV3
2. Sistema captura el canvas actual usando `dom-to-image-improved`
3. Redimensiona la imagen manteniendo aspect ratio
4. Convierte a JPG con calidad optimizada (85%)
5. Sube a Supabase Storage en `assets/thumbnails/`
6. Actualiza el campo `thumbnail` en la base de datos
7. Muestra el nuevo thumbnail en la librería de plantillas

### Estructura de Archivos
```
Supabase Storage: assets/
├── builder/                    (carpeta existente)
├── family-headers/            (carpeta existente)
└── thumbnails/                (nueva carpeta)
    ├── template-123-1701234567890.jpg
    ├── template-456-1701234567891.jpg
    └── template-789-1701234567892.jpg
```

## 🛠️ Configuración

### Requisitos Previos
- ✅ Supabase configurado con bucket `assets`
- ✅ Dependencia `dom-to-image-improved` instalada
- ✅ Canvas con atributo `data-canvas="builderv3"`

### Configuración Automática de Supabase
```typescript
import { setupSupabaseStorage } from './src/scripts/setupSupabaseStorage';

// Se ejecuta automáticamente al importar el módulo
// O puedes ejecutarlo manualmente:
await setupSupabaseStorage();
```

## 📖 Uso

### Generación Automática (Recomendado)
El sistema funciona automáticamente cuando el usuario guarda una plantilla:

```typescript
// En ToolbarV3, al hacer clic en "Guardar"
const handleSave = async () => {
  await operations.saveTemplate(); // ✨ Genera thumbnail automáticamente
};
```

### Generación Manual
Para casos especiales, puedes generar thumbnails manualmente:

```typescript
import { generateThumbnailAutomatic } from './src/features/builderV3/utils/thumbnailGenerator';

// Generar thumbnail para una plantilla específica
const result = await generateThumbnailAutomatic('template-123', {
  width: 600,
  height: 750,
  quality: 0.9,
  backgroundColor: '#ffffff'
});

if (result) {
  console.log('Thumbnail URL:', result.url);
  console.log('Tamaño del archivo:', result.size, 'bytes');
}
```

### Múltiples Tamaños
```typescript
import { generateThumbnailSizes } from './src/features/builderV3/utils/thumbnailGenerator';

const sizes = await generateThumbnailSizes(canvasElement, 'template-123');
console.log('Small:', sizes.small.url);   // 150x188
console.log('Medium:', sizes.medium.url); // 300x375
console.log('Large:', sizes.large.url);   // 600x750
```

## 🎨 Opciones de Personalización

### ThumbnailOptions
```typescript
interface ThumbnailOptions {
  width?: number;          // Ancho en píxeles (default: 300)
  height?: number;         // Alto en píxeles (default: 375)
  quality?: number;        // Calidad JPG 0-1 (default: 0.8)
  scale?: number;          // Escala de captura (default: 1)
  backgroundColor?: string; // Color de fondo (default: '#ffffff')
}
```

### Personalizar Resolución por Defecto
```typescript
// En useBuilderV3.ts - función saveTemplate
const thumbnailResult = await generateThumbnailAutomatic(templateId, {
  width: 400,    // Cambiar ancho
  height: 500,   // Cambiar alto
  quality: 0.9   // Aumentar calidad
});
```

## 🔍 Debugging

### Verificar Canvas
```typescript
import { findCanvasElement } from './src/features/builderV3/utils/thumbnailGenerator';

const canvas = findCanvasElement();
if (canvas) {
  console.log('✅ Canvas encontrado');
  console.log('Dimensiones:', canvas.getBoundingClientRect());
  console.log('Componentes:', canvas.children.length);
} else {
  console.log('❌ Canvas no encontrado');
}
```

### Logs del Sistema
El sistema incluye logs detallados:
```
🖼️ Generando thumbnail para plantilla: template-123
📐 Dimensiones del canvas: { width: 1080, height: 1350, components: 5 }
📍 Canvas encontrado con selector: [data-canvas="builderv3"]
✅ Thumbnail generado exitosamente: https://...
💾 Plantilla guardada exitosamente con thumbnail
```

## 🧹 Mantenimiento

### Limpiar Thumbnails Antiguos
```typescript
import { cleanupOldThumbnails } from './src/scripts/setupSupabaseStorage';

// Eliminar thumbnails de más de 30 días
const deletedCount = await cleanupOldThumbnails();
console.log(`Eliminados ${deletedCount} thumbnails antiguos`);
```

### Estadísticas de Storage
```typescript
import { getStorageStats } from './src/scripts/setupSupabaseStorage';

const stats = await getStorageStats();
console.log('Thumbnails:', stats.thumbnailCount);
console.log('Tamaño total:', stats.totalSize, 'bytes');
```

## 🎯 Integración con la UI

### Mostrar Thumbnails en TemplateCard
Los thumbnails se muestran automáticamente en las tarjetas:

```tsx
// En TemplateCard.tsx
{template.thumbnail ? (
  <img 
    src={template.thumbnail} 
    alt={template.name}
    className="w-full h-full object-cover"
  />
) : (
  <div>Placeholder...</div>
)}
```

## ⚠️ Troubleshooting

### Canvas No Encontrado
```
⚠️ No se encontró elemento canvas para thumbnail
```
**Solución**: Verificar que el canvas tenga `data-canvas="builderv3"`

### Error de Supabase
```
❌ Error al subir thumbnail: bucket does not exist
```
**Solución**: Ejecutar `setupSupabaseStorage()` o crear manualmente el bucket

### Dimensiones Muy Pequeñas
```
⚠️ Canvas demasiado pequeño para thumbnail
```
**Solución**: Asegurar que el canvas tenga al menos 50x50 píxeles

## 🚀 Futuras Mejoras

- [ ] Soporte para thumbnails animados (GIF/WebP)
- [ ] Compresión inteligente basada en contenido
- [ ] Thumbnails con watermark automático
- [ ] Generación en background con Web Workers
- [ ] Cache local para thumbnails frecuentes

## 📝 Notas Técnicas

- **Formato**: JPG con calidad 85% por defecto para balance calidad/tamaño
- **Resolución**: 300x375px estándar para tarjetas de plantillas
- **Aspect Ratio**: Se mantiene automáticamente, centrado en fondo blanco
- **Performance**: Captura asíncrona sin bloquear UI
- **Storage**: Organizado por fecha con nombres únicos para evitar conflictos 