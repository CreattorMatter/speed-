import React from 'react';

interface RulersProps {
  width: number;
  height: number;
  gridSize: number;
}

export default function Rulers({ width, height, gridSize }: RulersProps) {
  const rulerSize = 20; // Ancho/alto de las reglas
  const interval = gridSize; // Usar el mismo tamaño que la cuadrícula
  const fontSize = 10;

  return (
    <>
      {/* Regla horizontal */}
      <div 
        className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200"
        style={{ height: rulerSize }}
      >
        {Array.from({ length: Math.ceil(width / interval) }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute border-l border-gray-300"
            style={{
              left: i * interval,
              height: i % 2 === 0 ? '100%' : '50%',
              top: i % 2 === 0 ? 0 : '50%',
            }}
          >
            {i % 2 === 0 && (
              <span
                className="absolute text-gray-500"
                style={{
                  fontSize,
                  top: '4px',
                  left: '4px',
                  transform: 'translateX(-50%)',
                }}
              >
                {i * interval}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Regla vertical */}
      <div 
        className="absolute top-0 left-0 bottom-0 bg-white border-r border-gray-200"
        style={{ width: rulerSize }}
      >
        {Array.from({ length: Math.ceil(height / interval) }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute border-t border-gray-300"
            style={{
              top: i * interval,
              width: i % 2 === 0 ? '100%' : '50%',
              left: i % 2 === 0 ? 0 : '50%',
            }}
          >
            {i % 2 === 0 && (
              <span
                className="absolute text-gray-500"
                style={{
                  fontSize,
                  left: '4px',
                  top: '-7px',
                }}
              >
                {i * interval}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Intersección de reglas */}
      <div 
        className="absolute top-0 left-0 bg-white border-r border-b border-gray-200"
        style={{ width: rulerSize, height: rulerSize }}
      />
    </>
  );
} 