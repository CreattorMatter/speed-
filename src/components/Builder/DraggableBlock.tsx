import React, { useState, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Block as BlockType } from '../../types/builder';
import { Trash2, Move, RotateCcw, Settings } from 'lucide-react';

interface DraggableBlockProps {
  block: BlockType;
  index: number;
  onDelete: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onMove?: (id: string, position: { x: number; y: number }) => void;
  onImageUpload: (index: number, file: File) => void;
  isDragging?: boolean;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  index,
  onDelete,
  onResize,
  onMove,
  onImageUpload,
  isDragging = false
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: block.id,
    disabled: isResizing
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(index, file);
    }
  }, [index, onImageUpload]);

  const handleConfigClick = useCallback(() => {
    setShowConfigModal(true);
  }, []);

  const handleResizeStart = useCallback((direction: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = block.size?.width || 200;
    const startHeight = block.size?.height || 100;
    const startLeft = block.position?.x || 0;
    const startTop = block.position?.y || 0;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startLeft;
      let newY = startTop;

      switch (direction) {
        case 'se': // southeast - mantener esquina superior izquierda fija
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(30, startHeight + deltaY);
          break;
        case 's': // south - mantener borde superior fijo
          newHeight = Math.max(30, startHeight + deltaY);
          break;
        case 'e': // east - mantener borde izquierdo fijo
          newWidth = Math.max(50, startWidth + deltaX);
          break;
        case 'sw': // southwest - mantener esquina superior derecha fija
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(30, startHeight + deltaY);
          newX = startLeft + (startWidth - newWidth);
          break;
        case 'w': // west - mantener borde derecho fijo
          newWidth = Math.max(50, startWidth - deltaX);
          newX = startLeft + (startWidth - newWidth);
          break;
        case 'nw': // northwest - mantener esquina inferior derecha fija
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(30, startHeight - deltaY);
          newX = startLeft + (startWidth - newWidth);
          newY = startTop + (startHeight - newHeight);
          break;
        case 'n': // north - mantener borde inferior fijo
          newHeight = Math.max(30, startHeight - deltaY);
          newY = startTop + (startHeight - newHeight);
          break;
        case 'ne': // northeast - mantener esquina inferior izquierda fija
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(30, startHeight - deltaY);
          newY = startTop + (startHeight - newHeight);
          break;
      }

      // Actualizar tanto el tamaño como la posición
      onResize(block.id, { width: newWidth, height: newHeight });
      
      // Si la posición cambió, también actualizarla
      if ((newX !== startLeft || newY !== startTop) && onMove) {
        onMove(block.id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [block.id, block.size, block.position, onResize, onMove]);

  const getBlockContent = () => {
    const baseStyle = {
      padding: '8px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      minHeight: '100%',
      fontSize: block.content?.fontSize || 14,
      fontWeight: block.content?.fontWeight || 'normal',
      color: block.content?.color || '#000000',
      backgroundColor: block.content?.backgroundColor || 'transparent',
      textDecoration: block.content?.textDecoration || 'none',
      fontFamily: block.content?.fontFamily || 'inherit'
    };

    switch (block.type) {
      case 'header':
        return (block.content && block.content.imageUrl) ? (
          <img
            src={block.content.imageUrl}
            alt="Header banner"
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-blue-50 border-2 border-blue-200 rounded flex flex-col items-center justify-center text-blue-600">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-sm font-medium">Header/Banner</div>
            <div className="text-xs text-center mb-2">Sube logo, banner o imagen de encabezado</div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id={`header-upload-${block.id}`}
            />
            <label
              htmlFor={`header-upload-${block.id}`}
              className="px-3 py-1 bg-blue-100 rounded text-xs cursor-pointer hover:bg-blue-200"
            >
              Subir imagen
            </label>
          </div>
        );

      case 'footer':
        return (
          <div style={baseStyle} className="w-full h-full bg-gray-50 border-2 border-gray-200 rounded flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-xs">{block.content?.text || 'Válido hasta agotar stock. No acumulable con otras promociones.'}</div>
            </div>
          </div>
        );

      case 'logo':
        return (block.content && block.content.imageUrl) ? (
          <img
            src={block.content.imageUrl}
            alt="Logo de marca"
            className="w-full h-full object-contain rounded"
          />
        ) : (
          <div className="w-full h-full bg-orange-50 border-2 border-orange-200 rounded flex flex-col items-center justify-center text-orange-600">
            <div className="text-4xl mb-2">👑</div>
            <div className="text-sm font-medium">Logo Marca</div>
            <div className="text-xs text-center mb-2">Sube logo del fabricante o proveedor</div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id={`logo-upload-${block.id}`}
            />
            <label
              htmlFor={`logo-upload-${block.id}`}
              className="px-3 py-1 bg-orange-100 rounded text-xs cursor-pointer hover:bg-orange-200"
            >
              Subir logo
            </label>
          </div>
        );

      case 'price-final':
        return (
          <div style={baseStyle} className="w-full h-full bg-red-50 border-2 border-red-200 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="font-bold text-3xl text-red-600">{block.content?.text || '$49.990'}</div>
              <div className="text-xs text-red-500 opacity-75 mt-1">Precio contado</div>
            </div>
          </div>
        );

      case 'price-before':
        return (
          <div style={baseStyle} className="w-full h-full bg-gray-50 border-2 border-gray-200 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg line-through text-gray-500">{block.content?.text || '$89.990'}</div>
              <div className="text-xs text-gray-400 mt-1">Precio anterior</div>
            </div>
          </div>
        );

      case 'installments':
        return (
          <div style={baseStyle} className="w-full h-full bg-green-50 border-2 border-green-200 rounded flex items-center justify-center">
            <div className="text-center text-green-600">
              <div className="font-semibold text-sm">{block.content?.text || '12 CUOTAS SIN INTERÉS'}</div>
              <div className="text-xs opacity-75 mt-1">Financiación disponible</div>
            </div>
          </div>
        );

      case 'discount':
        return (
          <div style={baseStyle} className="w-full h-full bg-red-600 border-2 border-red-700 rounded flex items-center justify-center text-white">
            <div className="text-center">
              <div className="font-bold text-xl">{block.content?.text || '45% OFF'}</div>
              <div className="text-xs opacity-90 mt-1">Descuento especial</div>
            </div>
          </div>
        );

      case 'savings':
        return (
          <div style={baseStyle} className="w-full h-full bg-green-50 border-2 border-green-200 rounded flex items-center justify-center">
            <div className="text-center text-green-600">
              <div className="font-bold text-lg">{block.content?.text || 'AHORRAS $40.000'}</div>
              <div className="text-xs opacity-75 mt-1">Tu ahorro</div>
            </div>
          </div>
        );

      case 'sku':
        return (
          <div style={baseStyle} className="w-full h-full bg-gray-50 border-2 border-gray-200 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="font-mono text-xs text-gray-600">{block.content?.text || 'COD: EZ-HDW-2024-001'}</div>
              <div className="text-xs text-gray-400 mt-1">Código de producto</div>
            </div>
          </div>
        );

      case 'product-name':
        return (
          <div style={baseStyle} className="w-full h-full bg-purple-50 border-2 border-purple-200 rounded flex items-center justify-center">
            <div className="text-center text-purple-700">
              <div className="font-semibold text-sm">{block.content?.text || 'Taladro Percutor Dewalt 850W'}</div>
              <div className="text-xs opacity-75 mt-1">Nombre del producto</div>
            </div>
          </div>
        );

      case 'brand':
        return (
          <div style={baseStyle} className="w-full h-full bg-yellow-50 border-2 border-yellow-200 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="font-bold text-yellow-700">{block.content?.text || 'DEWALT'}</div>
              <div className="text-xs text-yellow-600 opacity-75 mt-1">Marca</div>
            </div>
          </div>
        );

      case 'category':
        return (
          <div style={baseStyle} className="w-full h-full bg-indigo-50 border-2 border-indigo-200 rounded flex items-center justify-center">
            <div className="text-center text-indigo-600">
              <div className="text-sm">{block.content?.text || 'Herramientas Eléctricas'}</div>
              <div className="text-xs opacity-75 mt-1">Categoría</div>
            </div>
          </div>
        );

      case 'stock':
        return (
          <div style={baseStyle} className="w-full h-full bg-red-50 border-2 border-red-200 rounded flex items-center justify-center">
            <div className="text-center text-red-600">
              <div className="font-bold text-sm">{block.content?.text || '¡Solo quedan 3 unidades!'}</div>
              <div className="text-xs opacity-75 mt-1">Disponibilidad</div>
            </div>
          </div>
        );

      case 'promotion':
        return (
          <div style={baseStyle} className="w-full h-full bg-red-600 border-2 border-red-700 rounded flex items-center justify-center text-white">
            <div className="text-center">
              <div className="font-bold text-lg">{block.content?.text || '2X1 EN TODA LA LÍNEA'}</div>
              <div className="text-xs opacity-90 mt-1">Promoción especial</div>
            </div>
          </div>
        );

      case 'badge':
        return (
          <div style={baseStyle} className="w-full h-full bg-green-600 border-2 border-green-700 rounded flex items-center justify-center text-white">
            <div className="text-center">
              <div className="font-bold text-sm">{block.content?.text || 'NUEVO'}</div>
              <div className="text-xs opacity-90 mt-1">Etiqueta</div>
            </div>
          </div>
        );

      case 'gift':
        return (
          <div style={baseStyle} className="w-full h-full bg-purple-50 border-2 border-purple-200 rounded flex items-center justify-center">
            <div className="text-center text-purple-600">
              <div className="font-semibold text-sm">{block.content?.text || 'REGALO: Set de brocas'}</div>
              <div className="text-xs opacity-75 mt-1">Obsequio incluido</div>
            </div>
          </div>
        );

      case 'combo':
        return (
          <div style={baseStyle} className="w-full h-full bg-orange-50 border-2 border-orange-200 rounded flex items-center justify-center">
            <div className="text-center text-orange-600">
              <div className="font-bold text-sm">{block.content?.text || 'KIT COMPLETO + Maletín'}</div>
              <div className="text-xs opacity-75 mt-1">Oferta combo</div>
            </div>
          </div>
        );

      case 'validity':
        return (
          <div style={baseStyle} className="w-full h-full bg-orange-50 border-2 border-orange-200 rounded flex items-center justify-center">
            <div className="text-center text-orange-600">
              <div className="text-sm">{block.content?.text || 'Válido del 15 al 30 de Diciembre'}</div>
              <div className="text-xs opacity-75 mt-1">Vigencia de la oferta</div>
            </div>
          </div>
        );

      case 'countdown':
        return (
          <div style={baseStyle} className="w-full h-full bg-red-50 border-2 border-red-200 rounded flex items-center justify-center">
            <div className="text-center text-red-600">
              <div className="font-bold text-sm">{block.content?.text || '⏰ ¡Solo por 48 horas!'}</div>
              <div className="text-xs opacity-75 mt-1">Tiempo limitado</div>
            </div>
          </div>
        );

      case 'period':
        return (
          <div style={baseStyle} className="w-full h-full bg-gray-50 border-2 border-gray-200 rounded flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="text-xs">{block.content?.text || 'Lunes a Viernes 9:00 a 18:00 hs'}</div>
              <div className="text-xs opacity-75 mt-1">Horario de oferta</div>
            </div>
          </div>
        );

      case 'store':
        return (
          <div style={baseStyle} className="w-full h-full bg-indigo-50 border-2 border-indigo-200 rounded flex items-center justify-center">
            <div className="text-center text-indigo-600">
              <div className="text-sm">{block.content?.text || 'Easy Maipú\nAv. Maipú 1234'}</div>
              <div className="text-xs opacity-75 mt-1">Sucursal</div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div style={baseStyle} className="w-full h-full bg-blue-50 border-2 border-blue-200 rounded flex items-center justify-center">
            <div className="text-center text-blue-600">
              <div className="text-xs">{block.content?.text || '📞 0810-EASY-123\n💬 WhatsApp disponible'}</div>
              <div className="text-xs opacity-75 mt-1">Contacto</div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div style={baseStyle} className="w-full h-full bg-gray-50 border-2 border-gray-200 rounded flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="text-xs">{block.content?.text || 'Lun a Dom: 8:00 a 22:00\nFeriados: 10:00 a 20:00'}</div>
              <div className="text-xs opacity-75 mt-1">Horarios</div>
            </div>
          </div>
        );

      case 'club-easy':
        return (
          <div style={baseStyle} className="w-full h-full bg-yellow-50 border-2 border-yellow-300 rounded flex items-center justify-center">
            <div className="text-center text-yellow-700">
              <div className="font-bold text-sm">{block.content?.text || 'PRECIO CLUB EASY\n$44.990'}</div>
              <div className="text-xs opacity-75 mt-1">Beneficio exclusivo</div>
            </div>
          </div>
        );

      case 'cencopay':
        return (
          <div style={baseStyle} className="w-full h-full bg-green-50 border-2 border-green-200 rounded flex items-center justify-center">
            <div className="text-center text-green-600">
              <div className="font-bold text-sm">{block.content?.text || '15% EXTRA con Cencopay'}</div>
              <div className="text-xs opacity-75 mt-1">Descuento adicional</div>
            </div>
          </div>
        );

      case 'easy-points':
        return (
          <div style={baseStyle} className="w-full h-full bg-purple-50 border-2 border-purple-200 rounded flex items-center justify-center">
            <div className="text-center text-purple-600">
              <div className="text-xs">{block.content?.text || 'Acumulas 2.500 puntos\nCanjea por $500'}</div>
              <div className="text-xs opacity-75 mt-1">Programa de puntos</div>
            </div>
          </div>
        );

      case 'image':
        return (block.content && block.content.imageUrl) ? (
          <img
            src={block.content.imageUrl}
            alt="Block content"
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-purple-50 border-2 border-purple-200 rounded flex flex-col items-center justify-center text-purple-600">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-sm font-medium">Imagen Producto</div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id={`image-upload-${block.id}`}
            />
            <label
              htmlFor={`image-upload-${block.id}`}
              className="mt-2 px-2 py-1 bg-purple-100 rounded text-xs cursor-pointer hover:bg-purple-200"
            >
              Subir imagen
            </label>
          </div>
        );

      // Tipos legacy que mantenemos por compatibilidad
      case 'price':
        return (
          <div className="w-full h-full bg-green-50 border-2 border-green-200 rounded flex flex-col items-center justify-center text-green-600">
            <div className="font-bold text-2xl">$999.99</div>
            <div className="text-xs opacity-75">Precio contado</div>
          </div>
        );

      case 'title':
        return (
          <div style={baseStyle} className="w-full h-full bg-blue-50 border-2 border-blue-200 rounded flex items-center justify-center text-blue-600 font-bold">
            <div className="text-center">
              <div className="text-2xl font-bold">{block.content?.text || 'SÚPER OFERTA'}</div>
              <div className="text-xs opacity-75 mt-1">Título principal de promoción</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gray-50 border-2 border-gray-200 rounded flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-sm font-medium">{block.type.toUpperCase()}</div>
              <div className="text-xs opacity-75 mt-1">Elemento personalizado</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'absolute',
        left: block.position?.x || 0,
        top: block.position?.y || 0,
        width: block.size?.width || 200,
        height: block.size?.height || 100,
        zIndex: isDragging ? 1000 : isSelected ? 10 : 1,
      }}
      className={`group cursor-move ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${isDragging ? 'opacity-50' : ''} ${isResizing ? 'cursor-auto' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsSelected(!isSelected);
      }}
      {...attributes}
      {...(isResizing ? {} : listeners)}
    >
      {getBlockContent()}
      
      {/* Controles cuando está seleccionado */}
      {isSelected && !isDragging && (
        <>
          {/* Botones de control */}
          <div className="absolute -top-8 left-0 flex gap-1 bg-white rounded shadow-lg border p-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(block.id);
              }}
              className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={12} />
            </button>
            <button
              className="w-6 h-6 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600 transition-colors"
              title="Mover"
            >
              <Move size={12} />
            </button>
            <button
              className="w-6 h-6 bg-gray-500 text-white rounded flex items-center justify-center hover:bg-gray-600 transition-colors"
              title="Configurar"
              onClick={(e) => {
                e.stopPropagation();
                handleConfigClick();
              }}
            >
              <Settings size={12} />
            </button>
          </div>

          {/* Handles de redimensionamiento - MEJORADOS */}
          {/* Esquinas */}
          <div 
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize hover:bg-blue-600 z-20"
            onMouseDown={(e) => handleResizeStart('nw', e)}
          />
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize hover:bg-blue-600 z-20"
            onMouseDown={(e) => handleResizeStart('ne', e)}
          />
          <div 
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize hover:bg-blue-600 z-20"
            onMouseDown={(e) => handleResizeStart('sw', e)}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600 z-20"
            onMouseDown={(e) => handleResizeStart('se', e)}
          />
          
          {/* Lados */}
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize hover:bg-blue-600 z-20"
            onMouseDown={(e) => handleResizeStart('n', e)}
          />
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize hover:bg-blue-600 z-20"
            onMouseDown={(e) => handleResizeStart('s', e)}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize hover:bg-blue-600 z-20"
            onMouseDown={(e) => handleResizeStart('w', e)}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize hover:bg-blue-600 z-20"
            onMouseDown={(e) => handleResizeStart('e', e)}
          />
          
          {/* Información del elemento */}
          <div className="absolute -bottom-8 left-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {block.size?.width || 200} × {block.size?.height || 100}
          </div>
        </>
      )}

      {/* Indicador visual cuando se hace hover */}
      <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 rounded pointer-events-none" />
      
      {/* Overlay durante redimensionamiento */}
      {isResizing && (
        <div className="absolute inset-0 bg-blue-200 bg-opacity-20 border-2 border-blue-400 border-dashed rounded pointer-events-none" />
      )}

      {/* Modal de Configuración */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Configurar Elemento</h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Configuración para imágenes */}
              {block.type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargar Imagen
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  {block.content?.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={block.content.imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Configuración de texto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto
                </label>
                <input
                  type="text"
                  value={(block.content && typeof block.content === 'object' && 'text' in block.content) ? block.content.text : ''}
                  onChange={(e) => {
                    // Aquí necesitarías una función para actualizar el contenido
                    console.log('Actualizar texto:', e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Configuración de color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Fondo
                </label>
                <input
                  type="color"
                  value={block.style?.backgroundColor || '#ffffff'}
                  onChange={(e) => {
                    // Aquí necesitarías una función para actualizar el estilo
                    console.log('Actualizar color:', e.target.value);
                  }}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 