// =====================================
// CANVAS EDITOR V3 - ENHANCED COMPONENT
// =====================================

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { TemplateV3, DraggableComponentV3, CanvasStateV3, ComponentTypeV3, PositionV3, BuilderOperationsV3, SizeV3 } from '../types';
import { ImageUploadComponent } from './ImageUploadComponent';
import { processDynamicContent, defaultMockData } from '../../../utils/dynamicContentProcessor';
import { EnhancedRulers } from './EnhancedRulers';
import { calcularDescuentoPorcentaje } from '../../../data/products';

// Mock data para preview (similar al BuilderTemplateRenderer)
const mockProduct = {
  id: 'example-1',
  tienda: 'E000',
  sku: 12345,
  ean: 7890123456789,
  descripcion: 'Producto de Ejemplo',
  precio: 99999,
  precioAnt: 119999,
  stockDisponible: 50,
  basePrice: 85000,
  marcaTexto: 'Marca Ejemplo',
  seccion: 'Electrónicos',
  imageUrl: '/images/example-product.jpg'
};

/**
 * 🆕 FUNCIÓN PARA MOSTRAR NOMBRES TÉCNICOS DURANTE EDICIÓN
 * Extrae los nombres técnicos de los campos en lugar de procesarlos con datos mock
 */
const getFieldTechnicalNames = (component: any): string => {
  const content = component.content as any;
  
  if (!content) {
    return 'Sin contenido';
  }
  
  // 1. Contenido estático - mostrar tal como está
  if (content?.fieldType === 'static') {
    return content?.staticValue || content?.text || 'Texto estático';
  }
  
  // 2. Campo calculado - mostrar la expresión técnica sin procesar en el canvas
  if (content?.fieldType === 'calculated' && content?.calculatedField?.expression) {
    console.log(`📝 [Canvas] Mostrando expresión técnica del campo calculado: "${content.calculatedField.expression}"`);
    return content.calculatedField.expression;
  }
  
  // 3. Plantilla dinámica - mostrar campos técnicos sin procesar
  if (content?.fieldType === 'dynamic' && content?.dynamicTemplate) {
    // Mantener los nombres técnicos tal como están: [product_name], [product_price], etc.
    return content.dynamicTemplate;
  }
  
  // 4. Campo SAP directo - mostrar nombre técnico
  if (content?.fieldType === 'sap-product' && content?.sapField) {
    return `[${content.sapField}]`;
  }
  
  // 5. Campo promoción directo - mostrar nombre técnico  
  if (content?.fieldType === 'promotion-data' && content?.promotionField) {
    return `[${content.promotionField}]`;
  }
  
  // 6. QR Code
  if (content?.fieldType === 'qr-code') {
    return 'QR Code';
  }
  
  // 7. Imagen
  if (content?.fieldType === 'image') {
    return 'Imagen';
  }
  
  // 8. Fallback para textConfig (campos con configuración específica)
  if (content?.textConfig?.contentType) {
    const contentTypeMap: Record<string, string> = {
      'product-name': '[product_name]',
      'product-description': '[product_description]', 
      'product-sku': '[product_sku]',
      'product-brand': '[product_brand]',
      'price-original': '[product_price]',
      'price-final': '[product_price]',
      'price-discount': '[price_discount]',
      'discount-percentage': '[discount_percentage]',
      'price-without-taxes': '[price_without_tax]',
      'promotion-start-date': '[promotion_start_date]',
      'promotion-end-date': '[promotion_end_date]',
      'financing-text': '[financing_text]',
      'promotion-title': '[promotion_title]'
    };
    
    return contentTypeMap[content.textConfig.contentType] || `[${content.textConfig.contentType}]`;
  }
  
  // 9. Campos de fecha específicos
  if (content?.dateConfig?.type) {
    const dateTypeMap: Record<string, string> = {
      'current-date': '[current_date]',
      'promotion-start': '[promotion_start_date]',
      'promotion-end': '[promotion_end_date]'
    };
    
    return dateTypeMap[content.dateConfig.type] || `[${content.dateConfig.type}]`;
  }
  
  // 10. Fallback para valores directos que pueden contener campos dinámicos
  if (content?.staticValue) {
    // Si contiene campos dinámicos, mostrarlos sin procesar
    if (content.staticValue.includes('[') && content.staticValue.includes(']')) {
      return content.staticValue;
    }
    return content.staticValue;
  }
  
  if (content?.text) {
    // Si contiene campos dinámicos, mostrarlos sin procesar
    if (content.text.includes('[') && content.text.includes(']')) {
      return content.text;
    }
    return content.text;
  }
  
  // 11. Fallback final
  return '[campo_dinámico]';
};

interface CanvasEditorV3Props {
  template: TemplateV3 | undefined;
  components: DraggableComponentV3[];
  canvasState: CanvasStateV3;
  selectedComponentIds: string[];
  onComponentSelect: (componentId: string | null) => void;
  onMultipleComponentSelect: (componentIds: string[]) => void;
  onComponentAdd: (type: ComponentTypeV3, position: PositionV3) => void;
  operations: BuilderOperationsV3;
  rulerUnit?: 'mm' | 'cm';
  activeTool: 'select' | 'pan' | 'zoom';
}

export const CanvasEditorV3: React.FC<CanvasEditorV3Props> = ({
  template,
  components,
  canvasState,
  selectedComponentIds,
  onComponentSelect,
  onMultipleComponentSelect,
  onComponentAdd,
  operations,
  rulerUnit,
  activeTool,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const [draggedComponentType, setDraggedComponentType] = useState<ComponentTypeV3 | null>(null);
  const [dropPosition, setDropPosition] = useState<{ x: number; y: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);

  const getCanvasCursor = () => {
    switch (activeTool) {
      case 'select':
        return 'cursor-default';
      case 'pan':
        return 'cursor-grab';
      case 'zoom':
        return 'cursor-zoom-in';
      default:
        return 'cursor-crosshair';
    }
  };

  const getCanvasCoordinatesFromEvent = useCallback((e: MouseEvent | React.MouseEvent | React.DragEvent) => {
    if (!worldRef.current) return null;
    const worldRect = worldRef.current.getBoundingClientRect();
    const x = (e.clientX - worldRect.left) / canvasState.zoom;
    const y = (e.clientY - worldRect.top) / canvasState.zoom;
    return { x, y };
  }, [canvasState.zoom]);

  // =====================
  // EVENT HANDLERS
  // =====================

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Deseleccionar solo si se hace clic en el fondo del canvas (canvasRef) y no en el mundo (worldRef) o sus hijos.
    if (target === canvasRef.current) {
      onComponentSelect(null);
    }
  }, [onComponentSelect]);

  const handleComponentClick = useCallback((componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      const currentIds = new Set(selectedComponentIds);
      if (currentIds.has(componentId)) {
        currentIds.delete(componentId);
      } else {
        currentIds.add(componentId);
      }
      onMultipleComponentSelect(Array.from(currentIds));
    } else {
      onComponentSelect(componentId);
    }
  }, [onComponentSelect, onMultipleComponentSelect, selectedComponentIds]);

  // =====================
  // DRAG & DROP HANDLING
  // =====================

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const coords = getCanvasCoordinatesFromEvent(e);
    if (!coords) return;
    
    let snappedX = coords.x;
    let snappedY = coords.y;
    if (canvasState.snapToGrid) {
      snappedX = Math.round(coords.x / canvasState.gridSize) * canvasState.gridSize;
      snappedY = Math.round(coords.y / canvasState.gridSize) * canvasState.gridSize;
    }
    setDropPosition({ x: snappedX, y: snappedY });
  }, [getCanvasCoordinatesFromEvent, canvasState.snapToGrid, canvasState.gridSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('application/component-type') as ComponentTypeV3;
    if (!componentType || !dropPosition) return;
    const position: PositionV3 = {
      x: dropPosition.x, y: dropPosition.y, z: components.length, rotation: 0, scaleX: 1, scaleY: 1
    };
    onComponentAdd(componentType, position);
    setDropPosition(null);
    setDraggedComponentType(null);
  }, [dropPosition, components.length, onComponentAdd]);

  // =====================
  // SELECTION BOX
  // =====================
  const handleSelectionMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== worldRef.current) {
      return;
    }
    
    const startCoords = getCanvasCoordinatesFromEvent(e);
    if (!startCoords) return;

    setIsSelecting(true);
    setSelectionStart(startCoords);
    setSelectionEnd(startCoords);

    const handleDocumentMouseMove = (event: MouseEvent) => {
      const currentCoords = getCanvasCoordinatesFromEvent(event);
      if (currentCoords) {
        setSelectionEnd(currentCoords);
      }
    };

    const handleDocumentMouseUp = (event: MouseEvent) => {
      setIsSelecting(false);
      
      const finalCoords = getCanvasCoordinatesFromEvent(event);
      if (!startCoords || !finalCoords) {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
        setSelectionStart(null);
        setSelectionEnd(null);
        return;
      }

      // Evitar deselección si fue solo un clic
      if (Math.abs(startCoords.x - finalCoords.x) < 5 && Math.abs(startCoords.y - finalCoords.y) < 5) {
        onComponentSelect(null);
      } else {
        const minX = Math.min(startCoords.x, finalCoords.x);
        const maxX = Math.max(startCoords.x, finalCoords.x);
        const minY = Math.min(startCoords.y, finalCoords.y);
        const maxY = Math.max(startCoords.y, finalCoords.y);

        const selectedComponents = components.filter(component => {
          const compX = component.position.x;
          const compY = component.position.y;
          const compRight = compX + component.size.width;
          const compBottom = compY + component.size.height;
          
          // Selección por intersección, no solo por contención completa
          return compX < maxX && compRight > minX && compY < maxY && compBottom > minY;
        });

        onMultipleComponentSelect(selectedComponents.map(c => c.id));
      }
      
      setSelectionStart(null);
      setSelectionEnd(null);
      
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
  }, [getCanvasCoordinatesFromEvent, components, onComponentSelect, onMultipleComponentSelect]);

  // =====================
  // KEYBOARD SHORTCUTS
  // =====================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedComponentIds.length > 0) {
        operations.removeComponents(selectedComponentIds);
      } else if (e.key === 'Escape') {
        onComponentSelect(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        onComponentSelect(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedComponentIds.length > 0) {
          const componentToDuplicate = components.find(c => c.id === selectedComponentIds[0]);
          if (componentToDuplicate) {
            onComponentAdd(componentToDuplicate.type, {
              ...componentToDuplicate.position,
              x: componentToDuplicate.position.x + 20,
              y: componentToDuplicate.position.y + 20,
              z: components.length
            });
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentIds, operations, onComponentSelect, onComponentAdd, components]);

  if (!template) return null;

  return (
    <div className="flex-1 h-full bg-gray-100 relative overflow-hidden">
      {/* Enhanced Canvas */}
      <div
        ref={canvasRef}
        className={`absolute inset-0 overflow-auto ${getCanvasCursor()}`}
        style={{
          paddingTop: canvasState.showRulers ? '32px' : '0',
          paddingLeft: canvasState.showRulers ? '32px' : '0'
        }}
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Canvas Container */}
        <div
          ref={worldRef}
          onMouseDown={handleSelectionMouseDown}
          className="relative mx-auto my-8 shadow-2xl border border-gray-300"
          style={{
            width: `${template.canvas.width * canvasState.zoom}px`,
            height: `${template.canvas.height * canvasState.zoom}px`,
            backgroundColor: template.canvas.backgroundColor,
            transform: `translate(${canvasState.panX}px, ${canvasState.panY}px)`
          }}
        >
          {/* Enhanced Rulers - Positioned to align with canvas edges */}
          {canvasState.showRulers && template.canvas && template.canvas.width > 0 && template.canvas.height > 0 && (
            <EnhancedRulers
              width={template.canvas.width * canvasState.zoom}
              height={template.canvas.height * canvasState.zoom}
              zoom={canvasState.zoom}
              visible={true}
              rulerUnit={rulerUnit || 'mm'}
            />
          )}
          {/* Enhanced Grid */}
          {canvasState.showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(#e5e7eb 1px, transparent 1px),
                  linear-gradient(90deg, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: `${canvasState.gridSize * canvasState.zoom}px ${canvasState.gridSize * canvasState.zoom}px`,
                opacity: 0.3
              }}
            />
          )}

          {/* Smart Guides */}
          {canvasState.showGrid && canvasState.guides.map(guide => (
            <div
              key={guide.id}
              className="absolute pointer-events-none z-20"
              style={{
                [guide.type === 'horizontal' ? 'top' : 'left']: `${guide.position * canvasState.zoom}px`,
                [guide.type === 'horizontal' ? 'left' : 'top']: '0',
                [guide.type === 'horizontal' ? 'right' : 'bottom']: '0',
                [guide.type === 'horizontal' ? 'height' : 'width']: '1px',
                backgroundColor: guide.color,
                opacity: 0.8,
                boxShadow: `0 0 4px ${guide.color}`
              }}
            />
          ))}

          {/* Drop Position Indicator */}
          {draggedComponentType && dropPosition && (
            <div
              className="absolute pointer-events-none z-30 border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-30"
              style={{
                left: `${dropPosition.x * canvasState.zoom}px`,
                top: `${dropPosition.y * canvasState.zoom}px`,
                width: `${100 * canvasState.zoom}px`,
                height: `${50 * canvasState.zoom}px`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-blue-600 text-xs font-medium bg-white px-2 py-1 rounded shadow">
                  Soltar aquí
                </span>
              </div>
            </div>
          )}

          {/* Enhanced Components */}
          {components.map(component => (
            <EnhancedComponentRenderer
              key={component.id}
              component={component}
              isSelected={selectedComponentIds.includes(component.id)}
              isMultiSelected={selectedComponentIds.length > 1}
              zoom={canvasState.zoom}
              snapToGrid={canvasState.showGrid}
              gridSize={canvasState.gridSize}
              snapTolerance={canvasState.snapTolerance || 10}
              allComponents={components}
              onClick={(e) => handleComponentClick(component.id, e)}
              operations={operations}
            />
          ))}

          {/* Selection Box */}
          {isSelecting && selectionStart && selectionEnd && (
            <div
              className="absolute pointer-events-none z-40 border-2 border-blue-500 bg-blue-100 bg-opacity-20"
              style={{
                left: `${Math.min(selectionStart.x, selectionEnd.x) * canvasState.zoom}px`,
                top: `${Math.min(selectionStart.y, selectionEnd.y) * canvasState.zoom}px`,
                width: `${Math.abs(selectionEnd.x - selectionStart.x) * canvasState.zoom}px`,
                height: `${Math.abs(selectionEnd.y - selectionStart.y) * canvasState.zoom}px`,
              }}
            />
          )}

          {/* Multi-Selection Overlay */}
          {selectedComponentIds.length > 1 && (
            <MultiSelectionOverlay
              components={components.filter(c => selectedComponentIds.includes(c.id))}
              zoom={canvasState.zoom}
              selectionStyle={canvasState.selectionStyle}
              operations={operations}
            />
          )}
        </div>
      </div>

      {/* Enhanced Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-white rounded-lg shadow-lg p-2 border">
        <button
          onClick={() => operations.zoomOut()}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
          title="Zoom Out"
          disabled={canvasState.zoom <= canvasState.minZoom}
        >
          −
        </button>
        
        <span className="text-sm text-gray-600 min-w-[50px] text-center">
          {Math.round(canvasState.zoom * 100)}%
        </span>
        
        <button
          onClick={() => operations.zoomIn()}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
          title="Zoom In"
          disabled={canvasState.zoom >= canvasState.maxZoom}
        >
          +
        </button>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <button
          onClick={() => operations.zoomToFit()}
          className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
          title="Ajustar al canvas"
        >
          Ajustar
        </button>
      </div>
    </div>
  );
};

// =====================
// ENHANCED COMPONENT RENDERER
// =====================

interface EnhancedComponentRendererProps {
  component: DraggableComponentV3;
  isSelected: boolean;
  isMultiSelected: boolean;
  zoom: number;
  snapToGrid: boolean;
  gridSize: number;
  snapTolerance: number;
  allComponents: DraggableComponentV3[];
  onClick: (e: React.MouseEvent) => void;
  operations: BuilderOperationsV3;
}

const EnhancedComponentRenderer: React.FC<EnhancedComponentRendererProps> = ({
  component,
  isSelected,
  isMultiSelected,
  zoom,
  snapToGrid,
  gridSize,
  snapTolerance,
  allComponents,
  onClick,
  operations
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialPosition, setInitialPosition] = useState<PositionV3 | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Permitir arrastrar siempre, excepto si está bloqueado
    if (component.isLocked) {
      return;
    }
    
    e.stopPropagation();
    onClick(e);
    
    setIsDragging(true);
    const startPos = { x: e.clientX, y: e.clientY };
    const startComponentPos = component.position;
    setDragStart(startPos);
    setInitialPosition(startComponentPos);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startPos.x) / zoom;
      const deltaY = (moveEvent.clientY - startPos.y) / zoom;

      let newX = startComponentPos.x + deltaX;
      let newY = startComponentPos.y + deltaY;

      // Smart snapping
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      // Snap to other components
      const snapTargets = allComponents.filter(c => c.id !== component.id);
      for (const target of snapTargets) {
        // Horizontal snapping
        if (Math.abs(newX - target.position.x) < snapTolerance) {
          newX = target.position.x;
        }
        if (Math.abs(newX + component.size.width - target.position.x) < snapTolerance) {
          newX = target.position.x - component.size.width;
        }
        if (Math.abs(newX - (target.position.x + target.size.width)) < snapTolerance) {
          newX = target.position.x + target.size.width;
        }

        // Vertical snapping
        if (Math.abs(newY - target.position.y) < snapTolerance) {
          newY = target.position.y;
        }
        if (Math.abs(newY + component.size.height - target.position.y) < snapTolerance) {
          newY = target.position.y - component.size.height;
        }
        if (Math.abs(newY - (target.position.y + target.size.height)) < snapTolerance) {
          newY = target.position.y + target.size.height;
        }
      }

      // Evitar que se salga del canvas
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);

      operations.updateComponent(component.id, {
        position: {
          ...component.position,
          x: newX,
          y: newY
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
      setInitialPosition(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [component.isLocked, component.id, component.position, component.size, zoom, onClick, operations, snapToGrid, gridSize, snapTolerance, allComponents]);

  // Función para obtener el nombre amigable del tipo de componente
  const getComponentDisplayName = (type: ComponentTypeV3): string => {
    const displayNames = {
      'field-dynamic-text': 'Texto Dinámico',
      'image-header': 'Imagen Header',
      'image-product': 'Imagen Producto', 
      'image-brand-logo': 'Logo Marca',
      'image-decorative': 'Imagen Decorativa',
      'qr-dynamic': 'QR Dinámico',
      'field-dynamic-date': 'Fecha Dinámica',
      'shape-geometric': 'Forma Geométrica',
      'decorative-line': 'Línea Decorativa',
      'decorative-icon': 'Ícono Decorativo',
      'container-flexible': 'Contenedor Flexible',
      'container-grid': 'Grilla de Contenido'
    };
    return displayNames[type] || type;
  };

  // Función para obtener el color del badge según el tipo
  const getBadgeColor = (type: ComponentTypeV3): string => {
    if (type.includes('price') || type.includes('discount') || type.includes('installment')) {
      return 'bg-green-500 text-white';
    }
    if (type.includes('product')) {
      return 'bg-blue-500 text-white';
    }
    if (type.includes('image')) {
      return 'bg-purple-500 text-white';
    }
    if (type.includes('date')) {
      return 'bg-orange-500 text-white';
    }
    if (type.includes('qr')) {
      return 'bg-gray-800 text-white';
    }
    if (type.includes('text')) {
      return 'bg-indigo-500 text-white';
    }
    if (type.includes('shape') || type.includes('container')) {
      return 'bg-gray-500 text-white';
    }
    return 'bg-gray-600 text-white';
  };

  const formatBoxShadow = (shadows?: DraggableComponentV3['style']['effects']['boxShadow']): string => {
    if (!shadows || shadows.length === 0) {
      return 'none';
    }
    return shadows.map(shadow => 
      `${shadow.inset ? 'inset ' : ''}${shadow.offsetX * zoom}px ${shadow.offsetY * zoom}px ${shadow.blurRadius * zoom}px ${shadow.spreadRadius * zoom}px ${shadow.color}`
    ).join(', ');
  };

  const renderComponentContent = () => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      fontSize: `${(component.style?.typography?.fontSize || 16) * zoom}px`,
      fontFamily: component.style?.typography?.fontFamily || 'Inter',
      fontWeight: component.style?.typography?.fontWeight || 'normal',
      color: component.style?.color?.color || '#000000',
      textAlign: component.style?.typography?.textAlign as any || 'left',
      textDecoration: component.style?.typography?.textDecoration || 'none',
      whiteSpace: 'pre-wrap',
    };

    switch (component.type) {
      case 'field-dynamic-text':
        // 🆕 CAMBIO: Mostrar nombres técnicos durante edición en lugar de datos mock
        const dynamicText = getFieldTechnicalNames(component);
        return (
          <div 
            style={{
              ...baseStyle,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '8px',
              boxSizing: 'border-box'
            }}
            className="w-full h-full select-none"
            title={`Campo dinámico: ${dynamicText}`}
          >
            <div style={{ textAlign: component.style?.typography?.textAlign as any || 'left' }}>
              {dynamicText}
            </div>
          </div>
        );

      case 'image-header':
      case 'image-product':
      case 'image-brand-logo':
      case 'image-decorative':
        return (
          <div 
            className="w-full h-full flex items-center justify-center select-none"
            style={{ backgroundColor: component.style?.color?.backgroundColor || 'transparent' }}
          >
            {component.content?.imageUrl ? (
              <img 
                src={component.content.imageUrl} 
                alt={component.content?.imageAlt || 'Imagen'} 
                className="w-full h-full object-contain"
                draggable={false}
              />
            ) : (
              <div className="text-gray-500 text-center p-2 border-2 border-dashed border-gray-300 rounded-md w-full h-full flex flex-col items-center justify-center">
                <span className="text-2xl">🖼️</span>
                <div className="text-xs mt-1">Imagen</div>
              </div>
            )}
          </div>
        );

      case 'qr-dynamic':
        return (
          <div className="w-full h-full bg-gray-50 border border-gray-200 flex items-center justify-center select-none">
            <div className="text-center">
              <span className="text-3xl">📱</span>
              <div className="text-xs mt-1">QR Code</div>
            </div>
          </div>
        );

      case 'field-dynamic-date':
        // 🆕 CAMBIO: Mostrar nombres técnicos durante edición en lugar de datos mock
        const dynamicDate = getFieldTechnicalNames(component);
        return (
          <div 
            style={{
              ...baseStyle,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '8px',
              boxSizing: 'border-box'
            }}
            className="w-full h-full select-none"
            title={`Campo de fecha: ${dynamicDate}`}
          >
            <div style={{ textAlign: component.style?.typography?.textAlign as any || 'left' }}>
              {dynamicDate}
            </div>
          </div>
        );

      case 'shape-geometric':
        const borderConfig = component.style?.border;
        const hasBorder = borderConfig && borderConfig.width > 0;
        const backgroundColor = component.style?.color?.backgroundColor || '#e5e7eb';
        const borderRadius = borderConfig?.radius?.topLeft || 0;
        
        return (
          <div 
            className="w-full h-full select-none transition-all duration-200"
            style={{
              backgroundColor,
              borderRadius: `${borderRadius * zoom}px`,
              border: hasBorder 
                ? `${borderConfig.width * zoom}px ${borderConfig.style || 'solid'} ${borderConfig.color || '#000000'}`
                : 'none',
              boxSizing: 'border-box' // Importante para que el borde no afecte el tamaño
            }}
          />
        );

      case 'decorative-line':
        return (
          <div 
            className="w-full select-none"
            style={{
              height: `${(component.style?.border?.width || 2) * zoom}px`,
              backgroundColor: component.style?.color?.backgroundColor || '#d1d5db',
              transform: 'translateY(50%)'
            }}
          />
        );

      case 'decorative-icon':
        return (
          <div className="w-full h-full flex items-center justify-center select-none">
            <span style={{ fontSize: `${Math.min(component.size.width, component.size.height) * 0.6 * zoom}px` }}>
              {component.content?.staticValue || '⭐'}
            </span>
          </div>
        );

      case 'container-flexible':
      case 'container-grid':
        return (
          <div className="w-full h-full border-2 border-dashed border-blue-300 bg-blue-50 bg-opacity-50 flex items-center justify-center select-none">
            <div className="text-blue-600 text-center">
              <span className="text-xl">📦</span>
              <div className="text-xs mt-1">Contenedor</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center select-none">
            <span className="text-gray-500 text-xs">Componente desconocido</span>
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute select-none group transition-all duration-200 ${
        isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'
      } ${component.isLocked ? 'cursor-not-allowed' : ''}`}
      style={{
        left: `${component.position.x * zoom}px`,
        top: `${component.position.y * zoom}px`,
        width: `${component.size.width * zoom}px`,
        height: `${component.size.height * zoom}px`,
        zIndex: component.position.z,
        transform: `rotate(${component.position.rotation || 0}deg) scale(${component.position.scaleX || 1}, ${component.position.scaleY || 1})`,
        visibility: component.isVisible ? 'visible' : 'hidden',
        opacity: component.style?.effects?.opacity ?? 1,
        boxShadow: formatBoxShadow(component.style?.effects?.boxShadow),
        overflow: 'visible', // Importante: permite que los handles se muestren fuera del componente
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Component Content */}
      <div className="w-full h-full relative">
        {renderComponentContent()}
      </div>

      {/* Bordes visuales siempre visibles */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-200 ${
          isSelected 
            ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/25' 
            : isHovered
              ? 'border border-blue-300 border-dashed'
              : 'border border-gray-300 border-dashed opacity-30'
        }`}
        style={{
          borderRadius: component.style?.border ? `${component.style.border.radius.topLeft * zoom}px` : '0px',
        }}
      />

      {/* Etiqueta del tipo de componente - SIEMPRE VISIBLE */}
      <div 
        className={`absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium transition-all duration-200 z-50 ${
          component.customLabel?.show !== false 
            ? (component.customLabel?.color ? '' : getBadgeColor(component.type))
            : 'opacity-0'
        } ${isSelected || isHovered ? 'opacity-100' : 'opacity-75'}`}
        style={{
          fontSize: `${Math.max(10, 12 / zoom)}px`,
          transform: zoom < 0.5 ? `scale(${1 / zoom})` : 'none',
          transformOrigin: 'left top',
          backgroundColor: component.customLabel?.color || undefined,
          color: component.customLabel?.textColor || (component.customLabel?.color ? '#ffffff' : undefined),
          display: component.customLabel?.show === false ? 'none' : 'block'
        }}
      >
        {component.customLabel?.name || getComponentDisplayName(component.type)}
      </div>

      {/* Indicadores de tamaño en las esquinas */}
      {(isSelected || isHovered) && (
        <>
          {/* Indicador superior izquierdo */}
          <div 
            className="absolute -top-2 -left-2 bg-white border border-gray-400 rounded-full w-3 h-3 flex items-center justify-center text-xs font-mono text-gray-600"
            style={{
              fontSize: `${Math.max(8, 10 / zoom)}px`,
              transform: zoom < 0.5 ? `scale(${1 / zoom})` : 'none',
              transformOrigin: 'center'
            }}
          >
            ↖
          </div>
        </>
      )}

      {/* Enhanced Resize Handles */}
      {isSelected && !isMultiSelected && component.isResizable && !component.isLocked && (
        <EnhancedResizeHandles
          component={component}
          zoom={zoom}
          operations={operations}
        />
      )}

      {/* Lock Indicator */}
      {component.isLocked && (
        <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs">
          🔒
        </div>
      )}

      {/* Drag indicator cuando se está arrastrando */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 border-dashed animate-pulse" />
      )}
    </div>
  );
};

// =====================
// ENHANCED RESIZE HANDLES
// =====================

interface EnhancedResizeHandlesProps {
  component: DraggableComponentV3;
  zoom: number;
  operations: BuilderOperationsV3;
}

const EnhancedResizeHandles: React.FC<EnhancedResizeHandlesProps> = ({ 
  component, 
  zoom, 
  operations 
}) => {
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  const createResizeHandler = useCallback((corner: string) => {
    return (e: React.MouseEvent) => {
      console.log(`🔧 Handle ${corner} clicked for component:`, component.id, component.type);
      e.stopPropagation();
      e.preventDefault(); // 🆕 Prevenir comportamientos por defecto
      setActiveHandle(corner);
      
      const startX = e.clientX;
      const startY = e.clientY;
      const startSize = { ...component.size };
      const startPosition = { ...component.position };

      console.log(`📏 Starting resize from ${corner}:`, { startSize, startPosition });

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = (moveEvent.clientX - startX) / zoom;
        const deltaY = (moveEvent.clientY - startY) / zoom;

        let newSize = { ...startSize };
        let newPosition = { ...startPosition };

        switch (corner) {
          case 'nw':
            newSize.width = Math.max(20, startSize.width - deltaX);
            newSize.height = Math.max(20, startSize.height - deltaY);
            newPosition.x = startPosition.x + (startSize.width - newSize.width);
            newPosition.y = startPosition.y + (startSize.height - newSize.height);
            break;
          case 'ne':
            newSize.width = Math.max(20, startSize.width + deltaX);
            newSize.height = Math.max(20, startSize.height - deltaY);
            newPosition.y = startPosition.y + (startSize.height - newSize.height);
            break;
          case 'sw':
            newSize.width = Math.max(20, startSize.width - deltaX);
            newSize.height = Math.max(20, startSize.height + deltaY);
            newPosition.x = startPosition.x + (startSize.width - newSize.width);
            break;
          case 'se':
            newSize.width = Math.max(20, startSize.width + deltaX);
            newSize.height = Math.max(20, startSize.height + deltaY);
            break;
          case 'n':
            newSize.height = Math.max(20, startSize.height - deltaY);
            newPosition.y = startPosition.y + (startSize.height - newSize.height);
            break;
          case 's':
            newSize.height = Math.max(20, startSize.height + deltaY);
            break;
          case 'w':
            newSize.width = Math.max(20, startSize.width - deltaX);
            newPosition.x = startPosition.x + (startSize.width - newSize.width);
            break;
          case 'e':
            newSize.width = Math.max(20, startSize.width + deltaX);
            break;
        }

        // Maintain aspect ratio if shift is pressed
        if (moveEvent.shiftKey || component.size.isProportional) {
          const aspectRatio = startSize.width / startSize.height;
          if (corner.includes('w') || corner.includes('e')) {
            newSize.height = newSize.width / aspectRatio;
          } else {
            newSize.width = newSize.height * aspectRatio;
          }
        }

        console.log(`🔄 Resizing ${corner}:`, { newSize, newPosition });
        operations.resizeComponent(component.id, newSize);
        if (newPosition.x !== startPosition.x || newPosition.y !== startPosition.y) {
          operations.moveComponent(component.id, newPosition);
        }
      };

      const handleMouseUp = () => {
        console.log(`✅ Resize ${corner} completed for component:`, component.id);
        setActiveHandle(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
  }, [component, zoom, operations]);

  const handleStyle = (corner: string): React.CSSProperties => {
    const baseSize = 12; // 🆕 Aumentar tamaño de 8 a 12 para mejor clickabilidad
    const size = Math.max(baseSize, baseSize / zoom);
    const offset = -size / 2;
    
    const isActive = activeHandle === corner;
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: isActive ? '#1D4ED8' : '#3B82F6',
      border: '2px solid white',
      borderRadius: '50%',
      cursor: getCursor(corner),
      transition: 'all 0.1s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)', // 🆕 Sombra más fuerte
      zIndex: 9999, // 🆕 Z-index aún más alto
      pointerEvents: 'auto',
      userSelect: 'none', // 🆕 Prevenir selección de texto
    };

    // Posicionamiento específico para cada handle
    switch (corner) {
      case 'nw':
        return { ...baseStyle, top: `${offset}px`, left: `${offset}px` };
      case 'n':
        return { ...baseStyle, top: `${offset}px`, left: '50%', transform: 'translateX(-50%)' };
      case 'ne':
        return { ...baseStyle, top: `${offset}px`, right: `${offset}px` };
      case 'w':
        return { ...baseStyle, top: '50%', left: `${offset}px`, transform: 'translateY(-50%)' };
      case 'e':
        return { ...baseStyle, top: '50%', right: `${offset}px`, transform: 'translateY(-50%)' };
      case 'sw':
        return { ...baseStyle, bottom: `${offset}px`, left: `${offset}px` };
      case 's':
        return { ...baseStyle, bottom: `${offset}px`, left: '50%', transform: 'translateX(-50%)' };
      case 'se':
        return { ...baseStyle, bottom: `${offset}px`, right: `${offset}px` };
      default:
        return baseStyle;
    }
  };

  const getCursor = (corner: string): string => {
    switch (corner) {
      case 'nw':
      case 'se':
        return 'nw-resize';
      case 'ne':
      case 'sw':
        return 'ne-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'w':
      case 'e':
        return 'ew-resize';
      default:
        return 'grab';
    }
  };

  const handles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

  console.log(`🎯 Rendering handles for component:`, {
    id: component.id,
    type: component.type,
    isSelected: true,
    isResizable: component.isResizable,
    isLocked: component.isLocked,
    activeHandle
  });

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 9998 }}
    >
      {handles.map(handle => (
        <div
          key={handle}
          style={handleStyle(handle)}
          onMouseDown={createResizeHandler(handle)}
          className="hover:scale-125 transition-transform"
          data-handle={handle}
          data-component-id={component.id}
          title={`Redimensionar desde ${handle} (Component: ${component.type})`}
        />
      ))}
    </div>
  );
};

// =====================
// MULTI-SELECTION OVERLAY
// =====================

interface MultiSelectionOverlayProps {
  components: DraggableComponentV3[];
  zoom: number;
  selectionStyle: CanvasStateV3['selectionStyle'];
  operations: BuilderOperationsV3;
}

const MultiSelectionOverlay: React.FC<MultiSelectionOverlayProps> = ({ 
  components, 
  zoom, 
  selectionStyle,
  operations 
}) => {
  if (components.length <= 1) return null;

  // Calculate bounding box
  const minX = Math.min(...components.map(c => c.position.x));
  const minY = Math.min(...components.map(c => c.position.y));
  const maxX = Math.max(...components.map(c => c.position.x + c.size.width));
  const maxY = Math.max(...components.map(c => c.position.y + c.size.height));

  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${minX * zoom}px`,
        top: `${minY * zoom}px`,
        width: `${width * zoom}px`,
        height: `${height * zoom}px`,
        border: `2px dashed ${selectionStyle.strokeColor}`,
        backgroundColor: `${selectionStyle.strokeColor}10`,
        zIndex: 1000,
      }}
    >
      {/* Multi-selection indicator */}
      <div className="absolute -top-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded">
        {components.length} elementos seleccionados
      </div>
    </div>
  );
}; 