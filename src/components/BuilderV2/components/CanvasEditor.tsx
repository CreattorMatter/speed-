// ===============================================
// CANVAS EDITOR COMPONENT - SIMPLIFIED
// ===============================================

import React, { useRef } from 'react';
import { 
  DraggableElement, 
  ElementPosition, 
  ElementSize
} from '../../../types/builder-v2';
import { DraggableResizableElement } from './DraggableResizableElement';
import { 
  ZoomIn, 
  ZoomOut, 
  Grid3X3,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Trash2
} from 'lucide-react';

interface CanvasEditorProps {
  elements: DraggableElement[];
  selectedElementId: string | null;
  canvasSize: ElementSize;
  zoom: number;
  showGrid: boolean;
  onElementSelect: (elementId: string | null) => void;
  onElementMove: (elementId: string, position: ElementPosition) => void;
  onElementResize: (elementId: string, size: ElementSize) => void;
  onElementUpdate: (elementId: string, updates: Partial<DraggableElement>) => void;
  onElementDelete: (elementId: string) => void;
  onElementDuplicate: (elementId: string) => void;
  onZoomChange: (zoom: number) => void;
  onGridToggle: () => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  elements,
  selectedElementId,
  canvasSize,
  zoom,
  showGrid,
  onElementSelect,
  onElementMove,
  onElementResize,
  onElementDelete,
  onElementDuplicate,
  onElementUpdate,
  onZoomChange,
  onGridToggle
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedElement = elements.find(el => el.id === selectedElementId);
  const zoomPercent = Math.round(zoom * 100);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onElementSelect(null);
    }
  };

  const handleElementMove = (element: DraggableElement, position: ElementPosition) => {
    onElementMove(element.id, position);
  };

  const handleElementResize = (element: DraggableElement, size: ElementSize) => {
    onElementResize(element.id, size);
  };

  const handleElementUpdate = (element: DraggableElement, updates: Partial<DraggableElement>) => {
    onElementUpdate(element.id, updates);
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {zoomPercent}%
            </span>
            
            <button
              onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          <button
            onClick={onGridToggle}
            className={`p-2 rounded-lg transition-colors ${
              showGrid 
                ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
            title={showGrid ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          {selectedElement && (
            <>
              <div className="w-px h-6 bg-gray-300" />
              
              <button
                onClick={() => onElementDuplicate(selectedElement.id)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Duplicar elemento"
              >
                <Copy className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onElementUpdate(selectedElement.id, { isLocked: !selectedElement.isLocked })}
                className={`p-2 rounded-lg transition-colors ${
                  selectedElement.isLocked
                    ? 'text-orange-600 bg-orange-100 hover:bg-orange-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title={selectedElement.isLocked ? 'Desbloquear' : 'Bloquear'}
              >
                {selectedElement.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => onElementUpdate(selectedElement.id, { isVisible: !selectedElement.isVisible })}
                className={`p-2 rounded-lg transition-colors ${
                  !selectedElement.isVisible
                    ? 'text-gray-400 bg-gray-100'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title={selectedElement.isVisible ? 'Ocultar' : 'Mostrar'}
              >
                {selectedElement.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => onElementDelete(selectedElement.id)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                title="Eliminar elemento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{elements.length} elementos</span>
          <span>{canvasSize.width} × {canvasSize.height} px</span>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-8">
        <div
          ref={canvasRef}
          className="relative bg-white shadow-lg mx-auto"
          style={{
            width: canvasSize.width * zoom,
            height: canvasSize.height * zoom,
            minWidth: canvasSize.width * zoom,
            minHeight: canvasSize.height * zoom
          }}
          onClick={handleCanvasClick}
        >
          {/* Grid Pattern */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`
              }}
            />
          )}

          {/* Canvas Content */}
          <div 
            className="relative"
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top left',
              width: canvasSize.width,
              height: canvasSize.height
            }}
          >
            {elements.map(element => (
              <DraggableResizableElement
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                zoom={zoom}
                onSelect={() => onElementSelect(element.id)}
                onMove={(position) => handleElementMove(element, position)}
                onResize={(size) => handleElementResize(element, size)}
                onUpdate={(updates) => handleElementUpdate(element, updates)}
              />
            ))}
            
            {/* Empty state */}
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎨</div>
                  <p className="text-lg">Canvas vacío</p>
                  <p className="text-sm">Arrastra elementos desde el panel lateral</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-2 bg-white border-t text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Zoom: {zoomPercent}%</span>
          {selectedElement && (
            <>
              <span>•</span>
              <span>Seleccionado: {selectedElement.name}</span>
              <span>•</span>
              <span>
                Posición: {Math.round(selectedElement.position.x)}, {Math.round(selectedElement.position.y)}
              </span>
              <span>•</span>
              <span>
                Tamaño: {Math.round(selectedElement.size.width)}×{Math.round(selectedElement.size.height)}
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showGrid && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Grilla</span>}
          <span>{elements.length} elementos</span>
        </div>
      </div>
    </div>
  );
}; 