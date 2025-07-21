// =====================================
// RESIZE HANDLES COMPONENT - BuilderV3
// =====================================

import React, { useState, useCallback } from 'react';
import { DraggableComponentV3, BuilderOperationsV3 } from '../../types';

interface ResizeHandlesProps {
  component: DraggableComponentV3;
  zoom: number;
  operations: BuilderOperationsV3;
  isVisible?: boolean;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ 
  component, 
  zoom, 
  operations,
  isVisible = true
}) => {
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  const createResizeHandler = useCallback((corner: string) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setActiveHandle(corner);
      
      const startX = e.clientX;
      const startY = e.clientY;
      const startSize = { ...component.size };
      const startPosition = { ...component.position };

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

        operations.resizeComponent(component.id, newSize);
        if (newPosition.x !== startPosition.x || newPosition.y !== startPosition.y) {
          operations.moveComponent(component.id, newPosition);
        }
      };

      const handleMouseUp = () => {
        setActiveHandle(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
  }, [component, zoom, operations]);

  const getHandleStyle = (corner: string): React.CSSProperties => {
    const baseSize = 12;
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
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      zIndex: 9999,
      pointerEvents: 'auto',
      userSelect: 'none',
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

  // No mostrar handles si no es visible, está bloqueado o no es redimensionable
  if (!isVisible || component.isLocked || !component.isResizable) {
    return null;
  }

  const handles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 9998 }}
    >
      {handles.map(handle => (
        <div
          key={handle}
          style={getHandleStyle(handle)}
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