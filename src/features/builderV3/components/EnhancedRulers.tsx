// =====================================
// ENHANCED RULERS COMPONENT - BuilderV3
// =====================================

import React from 'react';
import { UnitConverter } from '../utils/unitConverter';

interface EnhancedRulersProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  offsetX?: number;
  offsetY?: number;
  unit?: 'mm' | 'cm';
  visible?: boolean;
}

export const EnhancedRulers: React.FC<EnhancedRulersProps> = ({
  canvasWidth,
  canvasHeight,
  zoom,
  offsetX = 0,
  offsetY = 0,
  unit = 'mm',
  visible = true
}) => {
  if (!visible) return null;

  const rulerSize = 30;
  const scaledWidth = canvasWidth * zoom;
  const scaledHeight = canvasHeight * zoom;

  // Obtener marcas para las reglas
  const horizontalMarks = UnitConverter.getRulerMarks(canvasWidth, unit, zoom);
  const verticalMarks = UnitConverter.getRulerMarks(canvasHeight, unit, zoom);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Esquina superior izquierda */}
      <div 
        className="absolute top-0 left-0 bg-gray-200 border-r border-b border-gray-300 flex items-center justify-center"
        style={{ width: rulerSize, height: rulerSize }}
      >
        <div className="text-xs text-gray-600 font-mono select-none">
          {unit.toUpperCase()}
        </div>
      </div>

      {/* Regla horizontal */}
      <div 
        className="absolute top-0 left-8 bg-gray-100 border-b border-gray-300"
        style={{ 
          width: scaledWidth, 
          height: rulerSize,
          transform: `translateX(${offsetX}px)`
        }}
      >
        <svg width="100%" height="100%" className="absolute inset-0">
          {horizontalMarks.map((mark, index) => {
            const scaledPosition = mark.position;
            
            return (
              <g key={index}>
                {/* Línea de marca */}
                <line
                  x1={scaledPosition}
                  y1={mark.isMajor ? rulerSize - 15 : rulerSize - 8}
                  x2={scaledPosition}
                  y2={rulerSize}
                  stroke="#666"
                  strokeWidth={mark.isMajor ? 1.5 : 0.5}
                />
                
                {/* Etiqueta para marcas mayores */}
                {mark.isMajor && mark.label && scaledPosition > 15 && (
                  <text
                    x={scaledPosition}
                    y={rulerSize - 18}
                    fontSize="10"
                    fill="#666"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {mark.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Indicador de unidad */}
        <div className="absolute top-1 right-2 text-xs text-gray-500 bg-white px-1 rounded">
          {unit}
        </div>
      </div>

      {/* Regla vertical */}
      <div 
        className="absolute top-8 left-0 bg-gray-100 border-r border-gray-300"
        style={{ 
          width: rulerSize, 
          height: scaledHeight,
          transform: `translateY(${offsetY}px)`
        }}
      >
        <svg width="100%" height="100%" className="absolute inset-0">
          {verticalMarks.map((mark, index) => {
            const scaledPosition = mark.position;
            
            return (
              <g key={index}>
                {/* Línea de marca */}
                <line
                  x1={mark.isMajor ? rulerSize - 15 : rulerSize - 8}
                  y1={scaledPosition}
                  x2={rulerSize}
                  y2={scaledPosition}
                  stroke="#666"
                  strokeWidth={mark.isMajor ? 1.5 : 0.5}
                />
                
                {/* Etiqueta para marcas mayores */}
                {mark.isMajor && mark.label && scaledPosition > 15 && (
                  <text
                    x={rulerSize - 18}
                    y={scaledPosition}
                    fontSize="10"
                    fill="#666"
                    textAnchor="middle"
                    className="select-none"
                    transform={`rotate(-90 ${rulerSize - 18} ${scaledPosition})`}
                  >
                    {mark.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Indicador de unidad */}
        <div className="absolute bottom-2 left-1 text-xs text-gray-500 bg-white px-1 rounded rotate-90">
          {unit}
        </div>
      </div>
    </div>
  );
}; 