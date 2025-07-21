// =====================================
// IMAGE RENDERER - Posters
// =====================================

import React from 'react';
import { DraggableComponentV3 } from '../../../builderV3/types';
import { ProductoReal } from '../../../../types/product';

interface ImageRendererProps {
  component: DraggableComponentV3;
  product?: ProductoReal;
  isPreview?: boolean;
  scale?: number;
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({
  component,
  product,
  isPreview,
  scale = 1
}) => {
  // Obtener la URL de la imagen según el tipo
  const getImageUrl = (): string => {
    // 1. Imagen desde content.imageUrl
    if (component.content?.imageUrl) {
      return component.content.imageUrl;
    }
    
    // 2. Imagen del producto (para image-product)
    if (component.type === 'image-product' && product?.imageUrl) {
      return product.imageUrl;
    }
    
    // 3. Imagen de marca/logo (para image-brand-logo) - usar imagen genérica
    if (component.type === 'image-brand-logo') {
      // Retornar imagen por defecto o desde contenido estático
      return component.content?.staticValue || '';
    }
    
    // 4. Fallback - sin imagen
    return '';
  };

  const getImageAlt = (): string => {
    if (component.content?.imageAlt) {
      return component.content.imageAlt;
    }
    
    switch (component.type) {
      case 'image-product':
        return product?.descripcion || 'Imagen del producto';
      case 'image-brand-logo':
        return 'Logo de marca';
      case 'image-header':
        return 'Imagen de encabezado';
      case 'image-decorative':
        return 'Imagen decorativa';
      default:
        return 'Imagen';
    }
  };

  const imageUrl = getImageUrl();
  const imageAlt = getImageAlt();

  // Estilos del componente escalados
  const componentStyle = {
    position: 'absolute' as const,
    left: `${component.position.x * scale}px`,
    top: `${component.position.y * scale}px`,
    width: `${component.size.width * scale}px`,
    height: `${component.size.height * scale}px`,
    backgroundColor: component.style?.color?.backgroundColor || 'transparent',
    border: component.style?.border ? `${(component.style.border.width || 0) * scale}px ${component.style.border.style || 'solid'} ${component.style.border.color || '#000000'}` : 'none',
    borderRadius: component.style?.border?.radius ? `${(component.style.border.radius.topLeft || 0) * scale}px` : '0px',
    opacity: component.style?.effects?.opacity ?? 1,
    transform: `rotate(${component.position.rotation || 0}deg) scale(${
      component.position.scaleX || 1
    }, ${component.position.scaleY || 1})`,
    zIndex: component.position.z || 1,
    overflow: 'hidden',
    boxShadow: component.style?.effects?.boxShadow
      ? component.style.effects.boxShadow.map(shadow => 
          `${shadow.inset ? 'inset ' : ''}${shadow.offsetX * scale}px ${shadow.offsetY * scale}px ${shadow.blurRadius * scale}px ${shadow.spreadRadius * scale}px ${shadow.color}`
        ).join(', ')
      : 'none'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: (component.content as any)?.imageObjectFit || 'contain' as const,
    objectPosition: (component.content as any)?.imageObjectPosition || 'center',
    borderRadius: 'inherit'
  };

  if (imageUrl) {
    return (
      <div style={componentStyle} className="select-none">
        <img
          src={imageUrl}
          alt={imageAlt}
          style={imageStyle}
          onError={(e) => {
            // En caso de error, mostrar placeholder
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.setAttribute('style', 'display: flex');
          }}
          draggable={false}
        />
        {/* Placeholder en caso de error */}
        <div 
          style={{
            display: 'none',
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
            border: '2px dashed #d1d5db',
            borderRadius: 'inherit',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            fontSize: `${12 * scale}px`,
            textAlign: 'center' as const,
            padding: `${8 * scale}px`
          }}
        >
          <div>
            <span style={{ fontSize: `${24 * scale}px` }}>🖼️</span>
            <div style={{ marginTop: `${4 * scale}px` }}>Error cargando imagen</div>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder cuando no hay imagen
  return (
    <div style={componentStyle} className="select-none">
      <div 
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f3f4f6',
          border: '2px dashed #d1d5db',
          borderRadius: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: `${12 * scale}px`,
          textAlign: 'center' as const,
          padding: `${8 * scale}px`
        }}
      >
        <div>
          <span style={{ fontSize: `${24 * scale}px` }}>🖼️</span>
          <div style={{ marginTop: `${4 * scale}px` }}>
            {component.type === 'image-product' ? 'Imagen del producto' :
             component.type === 'image-brand-logo' ? 'Logo de marca' :
             component.type === 'image-header' ? 'Imagen de encabezado' :
             'Imagen'}
          </div>
        </div>
      </div>
    </div>
  );
}; 