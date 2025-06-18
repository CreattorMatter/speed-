import React from 'react';
import { TemplateV3, DraggableComponentV3 } from '../../../../features/builderV3/types';

interface BuilderTemplateRendererProps {
  template: TemplateV3;
  components: DraggableComponentV3[];
}

// Un mapa simple para renderizar componentes básicos.
// Esto debería expandirse para soportar todos los tipos de componentes del Builder.
const componentMap: { [key: string]: React.FC<any> } = {
  'field-dynamic-text': ({ content, style }) => (
    <div style={style}>{content?.staticValue || 'Texto dinámico'}</div>
  ),
  'image-header': ({ content, style }) => (
    <img src={content?.imageUrl || '/images/placeholder-product.jpg'} alt="Header" style={{...style, width: '100%', height: '100%', objectFit: 'cover'}} />
  ),
};

export const BuilderTemplateRenderer: React.FC<BuilderTemplateRendererProps> = ({ template, components }) => {
  return (
    <div
      className="relative bg-white shadow-lg"
      style={{
        width: template.canvas.width,
        height: template.canvas.height,
        backgroundColor: template.canvas.backgroundColor || '#FFFFFF',
      }}
    >
      {components.filter(c => c.isVisible !== false).map(component => {
        const RenderComponent = componentMap[component.type];
        
        const style = {
          position: 'absolute',
          left: `${component.position.x}px`,
          top: `${component.position.y}px`,
          width: `${component.size.width}px`,
          height: `${component.size.height}px`,
          transform: `rotate(${component.position.rotation || 0}deg)`,
          zIndex: component.position.z,
          ...component.style as any
        };

        if (RenderComponent) {
          return (
            <div key={component.id} style={style}>
              <RenderComponent content={component.content} style={component.style} />
            </div>
          );
        }

        // Fallback para componentes no mapeados
        return (
          <div key={component.id} style={style} className="border border-dashed border-red-500 bg-red-100/50 flex items-center justify-center text-red-700 text-xs">
            Tipo no soportado: {component.type}
          </div>
        );
      })}
    </div>
  );
}; 