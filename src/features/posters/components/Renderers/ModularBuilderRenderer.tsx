// =====================================
// MODULAR BUILDER RENDERER - Posters
// =====================================

import React from 'react';
import { TemplateV3, DraggableComponentV3 } from '../../../builderV3/types';
import { ProductoReal } from '../../../../types/product';
import { TextFieldRenderer } from './TextFieldRenderer';
import { ImageRenderer } from './ImageRenderer';

interface ModularBuilderRendererProps {
  template: TemplateV3;
  components: DraggableComponentV3[];
  product?: ProductoReal;
  isPreview?: boolean;
  scale?: number;
  productChanges?: any;
  onEditField?: (fieldType: string, newValue: string) => void;
  onPendingChange?: (fieldType: string, newValue: string | number) => void;
  enableInlineEdit?: boolean;
}

/**
 * 🚀 RENDERIZADOR MODULAR DEL TEMPLATE BUILDER V3
 * 
 * Este componente reemplaza al BuilderTemplateRenderer original (1,278 líneas)
 * con una arquitectura modular más mantenible.
 */
export const ModularBuilderRenderer: React.FC<ModularBuilderRendererProps> = ({
  template,
  components,
  product,
  isPreview = false,
  scale = 1,
  productChanges,
  onEditField,
  onPendingChange,
  enableInlineEdit = false
}) => {
  
  /**
   * Renderiza un componente individual según su tipo
   */
  const renderComponent = (component: DraggableComponentV3) => {
    const commonProps = {
      component,
      product,
      isPreview,
      scale,
      productChanges,
      onEditField,
      onPendingChange,
      enableInlineEdit
    };

    switch (component.type) {
      // 📝 CAMPOS DE TEXTO
      case 'field-dynamic-text':
      // field-dynamic-date eliminado - usar validity-period en su lugar
        return (
          <TextFieldRenderer
            key={component.id}
            {...commonProps}
          />
        );

      // 🖼️ IMÁGENES
      case 'image-header':
      case 'image-product':
      case 'image-brand-logo':
      case 'image-decorative':
        return (
          <ImageRenderer
            key={component.id}
            component={component}
            product={product}
            isPreview={isPreview}
            scale={scale}
          />
        );

      // 📱 QR CODES
      

      // 🔷 FORMAS GEOMÉTRICAS
      case 'shape-geometric':
        return (
          <ShapeRenderer
            key={component.id}
            component={component}
            scale={scale}
          />
        );

      // ➖ LÍNEAS DECORATIVAS
     

      // ⭐ ÍCONOS DECORATIVOS
      

      // �� CONTENEDORES
      

      // ❓ COMPONENTE DESCONOCIDO
      default:
        return (
          <UnknownComponentRenderer
            key={component.id}
            component={component}
            scale={scale}
          />
        );
    }
  };

  // Estilos del contenedor del template
  const templateStyle = {
    position: 'relative' as const,
    width: `${template.canvas.width * scale}px`,
    height: `${template.canvas.height * scale}px`,
    backgroundColor: template.canvas.backgroundColor || '#ffffff',
    overflow: 'hidden'
  };

  return (
    <div 
      style={templateStyle}
      className="template-container"
    >
      {/* Renderizar todos los componentes */}
      {components.map(renderComponent)}
    </div>
  );
};

// =====================
// COMPONENTES AUXILIARES SIMPLES
// =====================

/** QR Code Renderer */
const QRRenderer: React.FC<{
  component: DraggableComponentV3;
  product?: ProductoReal;
  scale: number;
}> = ({ component, product, scale }) => (
  <div
    style={{
      position: 'absolute',
      left: `${component.position.x * scale}px`,
      top: `${component.position.y * scale}px`,
      width: `${component.size.width * scale}px`,
      height: `${component.size.height * scale}px`,
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px'
    }}
    className="select-none"
  >
    <div style={{ textAlign: 'center', color: '#6b7280' }}>
      <span style={{ fontSize: `${24 * scale}px` }}>📱</span>
      <div style={{ fontSize: `${10 * scale}px`, marginTop: `${4 * scale}px` }}>QR Code</div>
    </div>
  </div>
);

/** Shape Renderer */
const ShapeRenderer: React.FC<{
  component: DraggableComponentV3;
  scale: number;
}> = ({ component, scale }) => {
  const borderConfig = component.style?.border;
  const backgroundColor = component.style?.color?.backgroundColor || '#e5e7eb';
  
  return (
    <div
      style={{
        position: 'absolute',
        left: `${component.position.x * scale}px`,
        top: `${component.position.y * scale}px`,
        width: `${component.size.width * scale}px`,
        height: `${component.size.height * scale}px`,
        backgroundColor,
        border: borderConfig ? `${(borderConfig.width || 0) * scale}px ${borderConfig.style || 'solid'} ${borderConfig.color || '#000'}` : 'none',
        borderRadius: borderConfig?.radius ? `${(borderConfig.radius.topLeft || 0) * scale}px` : '0px',
        transform: `rotate(${component.position.rotation || 0}deg)`,
        opacity: component.style?.effects?.opacity ?? 1
      }}
      className="select-none"
    />
  );
};

/** Line Renderer */
const LineRenderer: React.FC<{
  component: DraggableComponentV3;
  scale: number;
}> = ({ component, scale }) => (
  <div
    style={{
      position: 'absolute',
      left: `${component.position.x * scale}px`,
      top: `${component.position.y * scale}px`,
      width: `${component.size.width * scale}px`,
      height: `${(component.style?.border?.width || 2) * scale}px`,
      backgroundColor: component.style?.color?.backgroundColor || '#d1d5db',
      transform: `rotate(${component.position.rotation || 0}deg)`
    }}
    className="select-none"
  />
);

/** Icon Renderer */
const IconRenderer: React.FC<{
  component: DraggableComponentV3;
  scale: number;
}> = ({ component, scale }) => (
  <div
    style={{
      position: 'absolute',
      left: `${component.position.x * scale}px`,
      top: `${component.position.y * scale}px`,
      width: `${component.size.width * scale}px`,
      height: `${component.size.height * scale}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${Math.min(component.size.width, component.size.height) * 0.6 * scale}px`
    }}
    className="select-none"
  >
    {(component.content as any)?.staticValue || '⭐'}
  </div>
);

/** Container Renderer */
const ContainerRenderer: React.FC<{
  component: DraggableComponentV3;
  scale: number;
}> = ({ component, scale }) => (
  <div
    style={{
      position: 'absolute',
      left: `${component.position.x * scale}px`,
      top: `${component.position.y * scale}px`,
      width: `${component.size.width * scale}px`,
      height: `${component.size.height * scale}px`,
      border: '2px dashed #3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px'
    }}
    className="select-none"
  >
    <div style={{ textAlign: 'center', color: '#3b82f6' }}>
      <span style={{ fontSize: `${20 * scale}px` }}>📦</span>
      <div style={{ fontSize: `${10 * scale}px`, marginTop: `${4 * scale}px` }}>Contenedor</div>
    </div>
  </div>
);

/** Unknown Component Renderer */
const UnknownComponentRenderer: React.FC<{
  component: DraggableComponentV3;
  scale: number;
}> = ({ component, scale }) => (
  <div
    style={{
      position: 'absolute',
      left: `${component.position.x * scale}px`,
      top: `${component.position.y * scale}px`,
      width: `${component.size.width * scale}px`,
      height: `${component.size.height * scale}px`,
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px'
    }}
    className="select-none"
  >
    <div style={{ textAlign: 'center', color: '#dc2626' }}>
      <span style={{ fontSize: `${16 * scale}px` }}>❓</span>
      <div style={{ fontSize: `${8 * scale}px`, marginTop: `${2 * scale}px` }}>Desconocido</div>
    </div>
  </div>
); 