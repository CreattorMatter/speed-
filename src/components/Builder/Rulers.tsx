import React from 'react';

interface RulersProps {
  width: number;
  height: number;
}

export default function Rulers({ width, height }: RulersProps) {
  const interval = 50; // Intervalo en píxeles entre marcas
  const fontSize = 10;

  return (
    <>
      {/* Regla horizontal */}
      <div className="absolute top-0 left-6 right-0 h-6 bg-gray-50 border-b border-gray-200 flex">
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
                }}
              >
                {i * interval}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Regla vertical */}
      <div className="absolute top-6 left-0 w-6 bottom-0 bg-gray-50 border-r border-gray-200">
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
                className="absolute text-gray-500 transform -rotate-90"
                style={{
                  fontSize,
                  left: '4px',
                  top: '4px',
                }}
              >
                {i * interval}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
} 