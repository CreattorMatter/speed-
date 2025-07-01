// =====================================
// ENHANCED RULERS COMPONENT - BuilderV3 - MEJORADO
// =====================================

import React from 'react';
import { UnitConverter } from '../utils/unitConverter';

interface EnhancedRulersProps {
  width: number;
  height: number;
  zoom: number;
  visible: boolean;
  rulerUnit: 'mm' | 'cm';
  cursorPosition?: { x: number; y: number };
}

export const EnhancedRulers: React.FC<EnhancedRulersProps> = ({
  width,
  height,
  zoom,
  visible,
  rulerUnit,
  cursorPosition
}) => {
  if (!visible) return null;

  const rulerSize = 32; // Tamaño base de las reglas
  
  // width y height ya vienen escalados (width * zoom) desde CanvasEditorV3
  // Para getRulerMarks necesitamos las dimensiones reales (sin escalar)
  const realWidth = width / zoom;
  const realHeight = height / zoom;
  
  const horizontalMarks = UnitConverter.getRulerMarks(realWidth, rulerUnit, zoom);
  const verticalMarks = UnitConverter.getRulerMarks(realHeight, rulerUnit, zoom);

  return (
    <>
      {/* Regla horizontal superior - EN EL BORDE SUPERIOR DEL CANVAS */}
      <div
        className="absolute bg-gradient-to-b from-gray-50 via-white to-gray-100 border-b-2 border-gray-300 shadow-sm"
        style={{
          top: `-${rulerSize}px`,
          left: `0px`,
          width: `${width}px`,
          height: `${rulerSize}px`,
          fontSize: '10px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          fontWeight: 500,
          zIndex: 1000,
        }}
      >
        {/* Marcas horizontales - ALGORITMO MEJORADO */}
        {horizontalMarks.map((mark, index) => (
          <div key={`h-${index}`}>
            {/* Marca visual */}
            <div
              className={`absolute border-l ${
                mark.isMajor 
                  ? 'border-gray-700 border-l-[1.5px]' 
                  : 'border-gray-500 border-l-[0.75px] opacity-70'
              }`}
              style={{
                left: `${mark.position * zoom}px`,
                top: mark.isMajor ? '18px' : '22px',
                height: mark.isMajor ? '14px' : '10px',
              }}
            />
            {/* Etiqueta de texto - MEJORADA */}
            {mark.label && (
              <div
                className="absolute text-gray-800 select-none leading-none"
                style={{
                  left: `${mark.position * zoom - 12}px`,
                  top: '2px',
                  fontSize: '9px',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                  fontWeight: 600,
                  width: '24px',
                  textAlign: 'center'
                }}
              >
                {mark.label}
              </div>
            )}
          </div>
        ))}

        {/* Indicador de posición del cursor horizontal (opcional) */}
        {cursorPosition && (
          <div
            className="absolute border-l-2 border-blue-500 opacity-60 pointer-events-none"
            style={{
              left: `${cursorPosition.x * zoom}px`,
              top: '0px',
              height: `${rulerSize}px`,
              zIndex: 1001,
            }}
          />
        )}
      </div>

      {/* Regla vertical izquierda - EN EL BORDE IZQUIERDO DEL CANVAS */}
      <div
        className="absolute bg-gradient-to-r from-gray-50 via-white to-gray-100 border-r-2 border-gray-300 shadow-sm"
        style={{
          top: `0px`,
          left: `-${rulerSize}px`,
          width: `${rulerSize}px`,
          height: `${height}px`,
          fontSize: '10px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          fontWeight: 500,
          zIndex: 1000,
        }}
      >
        {/* Marcas verticales - ALGORITMO MEJORADO */}
        {verticalMarks.map((mark, index) => (
          <div key={`v-${index}`}>
            {/* Marca visual */}
            <div
              className={`absolute border-t ${
                mark.isMajor 
                  ? 'border-gray-700 border-t-[1.5px]' 
                  : 'border-gray-500 border-t-[0.75px] opacity-70'
              }`}
              style={{
                top: `${mark.position * zoom}px`,
                left: mark.isMajor ? '18px' : '22px',
                width: mark.isMajor ? '14px' : '10px',
              }}
            />
            {/* Etiqueta de texto rotada - MEJORADA */}
            {mark.label && (
              <div
                className="absolute text-gray-800 select-none leading-none"
                style={{
                  top: `${mark.position * zoom - 8}px`,
                  left: '2px',
                  fontSize: '9px',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                  fontWeight: 600,
                  transform: 'rotate(-90deg)',
                  transformOrigin: '8px 8px',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {mark.label}
              </div>
            )}
          </div>
        ))}

        {/* Indicador de posición del cursor vertical (opcional) */}
        {cursorPosition && (
          <div
            className="absolute border-t-2 border-blue-500 opacity-60 pointer-events-none"
            style={{
              top: `${cursorPosition.y * zoom}px`,
              left: '0px',
              width: `${rulerSize}px`,
              zIndex: 1001,
            }}
          />
        )}
      </div>

      {/* Esquina superior izquierda - EN LA ESQUINA DEL CANVAS */}
      <div
        className="absolute bg-gradient-to-br from-gray-100 via-gray-50 to-white border-b-2 border-r-2 border-gray-300 shadow-sm flex items-center justify-center"
        style={{
          top: `-${rulerSize}px`,
          left: `-${rulerSize}px`,
          width: `${rulerSize}px`,
          height: `${rulerSize}px`,
          zIndex: 1001,
        }}
      >
        <span 
          className="text-xs font-semibold text-gray-600 select-none"
          style={{
            textShadow: '0 1px 2px rgba(255,255,255,0.8)'
          }}
        >
          {rulerUnit}
        </span>
      </div>
    </>
  );
}; 