// =====================================
// MULTI-SELECTION OVERLAY - BuilderV3
// =====================================

import React from 'react';
import { DraggableComponentV3, CanvasStateV3, BuilderOperationsV3 } from '../../types';

interface MultiSelectionOverlayProps {
  components: DraggableComponentV3[];
  zoom: number;
  selectionStyle: CanvasStateV3['selectionStyle'];
  operations: BuilderOperationsV3;
}

export const MultiSelectionOverlay: React.FC<MultiSelectionOverlayProps> = ({ 
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