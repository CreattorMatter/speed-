import React from 'react';

interface RulersProps {
  gridSize: number;
}

export default function Rulers({ gridSize }: RulersProps) {
  const rulerSize = 20;

  return (
    <>
      {/* Regla horizontal */}
      <div
        className="absolute top-0 left-[20px] right-0 bg-white border-b border-gray-200"
        style={{ height: rulerSize }}
      >
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute border-l border-gray-300"
            style={{
              left: i * gridSize,
              height: i % 5 === 0 ? '100%' : '50%',
              top: i % 5 === 0 ? 0 : '50%',
              borderColor: i % 5 === 0 ? '#9CA3AF' : '#E5E7EB'
            }}
          >
            {i % 5 === 0 && (
              <span
                className="absolute text-[10px] text-gray-500"
                style={{
                  top: '2px',
                  left: '2px',
                  transform: 'translateX(-50%)',
                }}
              >
                {i * gridSize}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Regla vertical */}
      <div
        className="absolute top-[20px] left-0 bottom-0 bg-white border-r border-gray-200"
        style={{ width: rulerSize }}
      >
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute border-t border-gray-300"
            style={{
              top: i * gridSize,
              width: i % 5 === 0 ? '100%' : '50%',
              left: i % 5 === 0 ? 0 : '50%',
              borderColor: i % 5 === 0 ? '#9CA3AF' : '#E5E7EB'
            }}
          >
            {i % 5 === 0 && (
              <span
                className="absolute text-[10px] text-gray-500"
                style={{
                  left: '2px',
                  top: '-7px',
                }}
              >
                {i * gridSize}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Esquina superior izquierda */}
      <div
        className="absolute top-0 left-0 bg-white border-r border-b border-gray-200"
        style={{ width: rulerSize, height: rulerSize }}
      />
    </>
  );
} 