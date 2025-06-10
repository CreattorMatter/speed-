# Speed - Builder de Plantillas Inteligente

## 📋 Descripción
Speed es una aplicación web avanzada para la creación, edición y gestión de plantillas de diseño. Utiliza tecnologías modernas y ofrece una interfaz intuitiva para la creación de diseños profesionales con soporte para IA.

## 🚀 Características Principales

### Builder Intuitivo
- Interfaz drag-and-drop para diseño visual
- Sistema de bloques modulares
- Soporte para múltiples formatos de papel
- Herramientas de alineación y distribución
- Sistema de capas (z-index)

### Tipos de Bloques
- 📦 Contenedores
- 📝 Encabezados
- 🏷️ SKUs
- 🖼️ Imágenes
- 💰 Precios
- 🏷️ Descuentos
- 📢 Promociones
- 🎨 Logos

### Integración con IA
- Generación de contenido inteligente
- Optimización automática de diseños
- Sugerencias de mejora
- Análisis de tendencias

### Gestión de Plantillas
- Guardado y carga de plantillas
- Sistema de búsqueda avanzado
- Vista previa en tiempo real
- Exportación en múltiples formatos

## 🛠️ Tecnologías

### Frontend
- React 18+
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Query

### Backend
- Supabase
- PostgreSQL
- Storage API

### Herramientas de Desarrollo
- ESLint
- Prettier
- Husky
- Jest
- React Testing Library

## 📁 Estructura del Proyecto

```
src/
├── app/          # Configuración de la aplicación
├── components/   # Componentes React
│   └── Builder/  # Componentes del builder
├── constants/    # Constantes y configuraciones
├── features/     # Características específicas
├── store/        # Estado global
├── assets/       # Recursos estáticos
├── services/     # Servicios y APIs
├── styles/       # Estilos globales
├── data/         # Datos estáticos
├── utils/        # Utilidades
├── lib/          # Bibliotecas
├── hooks/        # Hooks personalizados
├── pages/        # Páginas
├── types/        # Definiciones de tipos
└── config/       # Configuraciones
```

## 🚀 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/speed.git
cd speed
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## 💻 Uso

### Creación de Plantilla
1. Seleccionar formato de papel
2. Añadir bloques al canvas
3. Configurar contenido y estilos
4. Guardar plantilla

### Edición de Plantilla
1. Cargar plantilla existente
2. Modificar bloques y contenido
3. Ajustar diseño
4. Guardar cambios

### Exportación
1. Vista previa final
2. Seleccionar formato
3. Configurar opciones
4. Descargar archivo

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests de integración
npm run test:integration

# Ejecutar tests e2e
npm run test:e2e
```

## 📦 Build

```bash
# Build de producción
npm run build

# Preview de producción
npm run preview
```

## 🔧 Configuración

### Variables de Entorno
```env
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key
VITE_API_URL=tu_api_url
```

### Configuración de Supabase
- Crear proyecto en Supabase
- Configurar tablas y políticas
- Configurar Storage
- Configurar autenticación

## 📚 Documentación Técnica

### Componentes Principales

#### Builder.tsx
```typescript
interface BuilderProps {
  initialBlocks?: Block[];
  onSave?: (blocks: Block[]) => void;
  onExport?: (format: string) => void;
}
```

#### Canvas.tsx
```typescript
interface CanvasProps {
  blocks: Block[];
  onBlockUpdate: (block: Block) => void;
  onBlockDelete: (id: string) => void;
}
```

#### Block.tsx
```typescript
interface BlockProps {
  id: string;
  type: BlockType;
  content: BlockContent;
  position: Position;
  size: Size;
}
```

### Estado del Builder
```typescript
interface BuilderState {
  blocks: Block[];
  showPreview: boolean;
  isSaveModalOpen: boolean;
  isSearchModalOpen: boolean;
  previewImage: string;
  isSaving: boolean;
  savingStep: 'idle' | 'generating' | 'uploading';
  isGeneratingAI: boolean;
  session: any;
  templateName: string;
  templateDescription: string;
  isPublic: boolean;
  selectedFormat: PaperFormat;
  isLandscape: boolean;
  scale: number;
  canvasSettings: CanvasSettings;
}
```

## 🔍 Mejores Prácticas

### Desarrollo
- Usar TypeScript para todo el código
- Implementar componentes reutilizables
- Mantener la lógica de negocio en hooks
- Utilizar memoización para optimizar rendimiento
- Implementar manejo de errores robusto

### UI/UX
- Mantener consistencia en el diseño
- Implementar feedback visual
- Optimizar para diferentes dispositivos
- Mantener accesibilidad

### Rendimiento
- Optimizar renderizado de componentes
- Implementar lazy loading
- Minimizar re-renders
- Optimizar carga de imágenes

## 🐛 Depuración

### Herramientas
- React DevTools
- Redux DevTools
- Chrome DevTools
- VS Code Debugger

### Logging
```typescript
// Ejemplo de logging estructurado
console.log({
  action: 'BLOCK_UPDATE',
  blockId: id,
  changes: changes,
  timestamp: new Date().toISOString()
});
```

## 🔄 Flujos de Trabajo

### Nuevas Características
1. Definir tipos necesarios
2. Crear componentes base
3. Implementar lógica de negocio
4. Integrar con estado global
5. Probar y optimizar

### Modificaciones
1. Analizar impacto en tipos existentes
2. Actualizar componentes afectados
3. Mantener compatibilidad
4. Actualizar documentación

## 📈 Roadmap

### Fase 1 - Mejoras Actuales
- [ ] Optimización de rendimiento
- [ ] Mejora de accesibilidad
- [ ] Documentación completa
- [ ] Tests unitarios

### Fase 2 - Nuevas Características
- [ ] Exportación a más formatos
- [ ] Integración con más servicios
- [ ] Mejoras en la IA
- [ ] Sistema de plugins

### Fase 3 - Escalabilidad
- [ ] Microservicios
- [ ] CDN
- [ ] Caché distribuido
- [ ] Monitoreo avanzado

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo Inicial* - [TuUsuario](https://github.com/TuUsuario)

## 🙏 Agradecimientos

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

## 📞 Soporte

Para soporte, email tu@email.com o crear un issue en el repositorio.

---

Hecho con ❤️ por [Tu Nombre]
