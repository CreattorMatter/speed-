// =====================================
// ENHANCED RULERS COMPONENT - BuilderV3
// =====================================

import React, { useMemo } from 'react';
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

  // Obtener marcas para las reglas - memoizado para optimización
  const horizontalMarks = useMemo(() => 
    UnitConverter.getRulerMarks(canvasWidth, unit, zoom), 
    [canvasWidth, unit, zoom]
  );
  const verticalMarks = useMemo(() => 
    UnitConverter.getRulerMarks(canvasHeight, unit, zoom), 
    [canvasHeight, unit, zoom]
  );

  return (
    <>
      {/* Esquina superior izquierda */}
      <div 
        className="absolute top-0 left-0 bg-white border-r border-b border-gray-300 flex items-center justify-center z-20"
        style={{ width: rulerSize, height: rulerSize }}
      >
        <div className="text-xs text-gray-600 font-mono select-none">
          {unit.toUpperCase()}
        </div>
      </div>

      {/* Regla horizontal */}
      <div 
        className="absolute top-0 bg-white border-b border-gray-300 z-10 overflow-hidden"
        style={{ 
          left: rulerSize,
          width: 'calc(100% - 30px)', // Ocupar el resto del espacio visible
          height: rulerSize,
          pointerEvents: 'none'
        }}
      >
        <div 
          className="relative h-full"
          style={{
            width: scaledWidth, // Ancho real del lienzo
            transform: `translateX(${offsetX}px)` // Sincronizar con paneo
          }}
        >
          <svg width={scaledWidth} height={rulerSize} className="absolute inset-0">
            {horizontalMarks.map((mark, index) => {
              const scaledPosition = mark.position * zoom;
              return (
                <g key={index}>
                  <line
                    x1={scaledPosition} y1={mark.isMajor ? rulerSize - 15 : rulerSize - 8}
                    x2={scaledPosition} y2={rulerSize}
                    stroke="#9ca3af" strokeWidth={mark.isMajor ? 0.75 : 0.5}
                  />
                  {mark.isMajor && mark.label && (
                    <text
                      x={scaledPosition} y={rulerSize - 18}
                      fontSize="9" fill="#4b5563" textAnchor="middle" className="select-none"
                    >
                      {mark.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Regla vertical */}
      <div 
        className="absolute left-0 bg-white border-r border-gray-300 z-10 overflow-hidden"
        style={{ 
          top: rulerSize,
          width: rulerSize, 
          height: 'calc(100% - 30px)', // Ocupar el resto del espacio visible
          pointerEvents: 'none'
        }}
      >
        <div
          className="relative w-full"
          style={{
            height: scaledHeight, // Alto real del lienzo
            transform: `translateY(${offsetY}px)` // Sincronizar con paneo
          }}
        >
          <svg width={rulerSize} height={scaledHeight} className="absolute inset-0">
            {verticalMarks.map((mark, index) => {
              const scaledPosition = mark.position * zoom;
              return (
                <g key={index}>
                  <line
                    x1={mark.isMajor ? rulerSize - 15 : rulerSize - 8} y1={scaledPosition}
                    x2={rulerSize} y2={scaledPosition}
                    stroke="#9ca3af" strokeWidth={mark.isMajor ? 0.75 : 0.5}
                  />
                  {mark.isMajor && mark.label && (
                    <text
                      x={rulerSize - 16} y={scaledPosition + 3}
                      fontSize="9" fill="#4b5563" textAnchor="middle"
                      className="select-none"
                      transform={`rotate(-90 ${rulerSize - 16} ${scaledPosition + 3})`}
                    >
                      {mark.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </>
  );
}; 