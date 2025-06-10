// ===============================================
// DRAGGABLE RESIZABLE ELEMENT COMPONENT
// ===============================================

import React, { useState, useRef, useCallback } from 'react';
import { DraggableElement, ElementPosition, ElementSize } from '../../../types/builder-v2';
import { 
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Upload,
  X
} from 'lucide-react';

interface DraggableResizableElementProps {
  element: DraggableElement;
  isSelected: boolean;
  zoom: number;
  onSelect: () => void;
  onMove: (position: ElementPosition) => void;
  onResize: (size: ElementSize) => void;
  onUpdate: (updates: Partial<DraggableElement>) => void;
}

export const DraggableResizableElement: React.FC<DraggableResizableElementProps> = ({
  element,
  isSelected,
  zoom,
  onSelect,
  onMove,
  onResize,
  onUpdate
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler para iniciar drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (element.isLocked) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.position.x * zoom,
      y: e.clientY - element.position.y * zoom
    });
  }, [element.isLocked, element.position, zoom, onSelect]);

  // Handler para iniciar resize
  const handleResizeMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    if (element.isLocked) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      width: element.size.width,
      height: element.size.height,
      x: e.clientX,
      y: e.clientY
    });
  }, [element.isLocked, element.size]);

  // Handlers de mouse global
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) / zoom;
      const newY = (e.clientY - dragStart.y) / zoom;
      
      onMove({
        ...element.position,
        x: Math.max(0, newX),
        y: Math.max(0, newY)
      });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(20, resizeStart.width + deltaX / zoom);
      const newHeight = Math.max(20, resizeStart.height + deltaY / zoom);
      
      onResize({
        width: newWidth,
        height: newHeight
      });
    }
  }, [isDragging, isResizing, dragStart, resizeStart, zoom, onMove, onResize, element.position]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Efectos para manejar eventos globales
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Handler para upload de imagen
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onUpdate({
          content: {
            ...element.content,
            imageUrl,
            imageAlt: file.name,
            text: undefined
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }, [element.content, onUpdate]);

  const handleRemoveImage = useCallback(() => {
    onUpdate({
      content: {
        ...element.content,
        imageUrl: undefined,
        imageAlt: undefined,
        text: element.name
      }
    });
  }, [element.content, element.name, onUpdate]);

  // Estilos del elemento
  const baseStyles: React.CSSProperties = {
    left: element.position.x,
    top: element.position.y,
    width: element.size.width,
    height: element.size.height,
    zIndex: element.position.z || 1,
    opacity: element.isVisible ? 1 : 0.3,
    pointerEvents: element.isLocked ? 'none' : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  // Determinar color del borde basado en categoría
  let borderColor = 'border-gray-300';
  switch (element.category) {
    case 'Header':
      borderColor = 'border-indigo-300';
      break;
    case 'SKU':
      borderColor = 'border-blue-300';
      break;
    case 'Precio':
      borderColor = 'border-green-300';
      break;
    case 'Descripción':
      borderColor = 'border-purple-300';
      break;
    case 'Descuento':
      borderColor = 'border-red-300';
      break;
    case 'Fechas':
      borderColor = 'border-orange-300';
      break;
    case 'Finanzas':
      borderColor = 'border-yellow-300';
      break;
    case 'Footer':
      borderColor = 'border-gray-300';
      break;
    case 'QR':
      borderColor = 'border-pink-300';
      break;
  }

  // Renderizar contenido
  let content: React.ReactNode = null;
  
  if (element.type === 'header-imagen') {
    if (element.content?.imageUrl) {
      content = (
        <div className="relative w-full h-full">
          <img
            src={element.content.imageUrl}
            alt={element.content.imageAlt || 'Header'}
            className="w-full h-full object-cover rounded"
          />
          {isSelected && (
            <button
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remover imagen"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      );
    } else {
      content = (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded">
          <Upload className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Header con Imagen</span>
          <span className="text-xs">Haz clic para subir JPG/PNG</span>
          {isSelected && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
            >
              Subir Imagen
            </button>
          )}
        </div>
      );
    }
  } else if (element.content?.imageUrl) {
    content = (
      <img
        src={element.content.imageUrl}
        alt={element.content.imageAlt || ''}
        className="w-full h-full object-cover"
      />
    );
  } else if (element.content?.text) {
    content = (
      <div 
        className="w-full h-full flex items-center justify-center text-center p-1"
        style={{
          fontSize: element.style?.fontSize || 16,
          fontWeight: element.style?.fontWeight || 'normal',
          color: element.style?.color || '#000000',
          backgroundColor: element.style?.backgroundColor || 'transparent',
          fontFamily: element.style?.fontFamily || 'Inter'
        }}
      >
        {element.content.text}
      </div>
    );
  } else {
    content = (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm p-1">
        {element.name}
      </div>
    );
  }

  return (
    <>
      <div
        ref={elementRef}
        className={`absolute border transition-all select-none ${borderColor} ${
          isSelected ? 'border-2 border-blue-500 shadow-lg' : 'border'
        } ${element.isLocked ? 'opacity-75' : ''}`}
        style={baseStyles}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {content}
        
        {/* Indicadores de estado */}
        {element.isLocked && (
          <div className="absolute -top-6 -left-1 bg-gray-800 text-white px-1 py-0.5 rounded text-xs flex items-center">
            <Lock className="w-3 h-3" />
          </div>
        )}
        
        {!element.isVisible && (
          <div className="absolute -top-6 left-6 bg-gray-800 text-white px-1 py-0.5 rounded text-xs flex items-center">
            <EyeOff className="w-3 h-3" />
          </div>
        )}

        {/* Indicador de categoría */}
        <div className="absolute -top-6 right-0 bg-gray-700 text-white px-2 py-0.5 rounded text-xs">
          {element.category}
        </div>

        {/* Resize handles - solo si está seleccionado y no está bloqueado */}
        {isSelected && !element.isLocked && (
          <>
            {/* Esquina inferior derecha */}
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-se-resize hover:bg-blue-600"
              onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            />
            {/* Esquina inferior izquierda */}
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-sw-resize hover:bg-blue-600"
              onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            />
            {/* Esquina superior derecha */}
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-ne-resize hover:bg-blue-600"
              onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            />
            {/* Esquina superior izquierda */}
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-sm cursor-nw-resize hover:bg-blue-600"
              onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            />
          </>
        )}
      </div>

      {/* Input de archivo oculto para upload de imágenes */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleImageUpload}
        className="hidden"
      />
    </>
  );
}; 