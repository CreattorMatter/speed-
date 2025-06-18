// =====================================
// CANVAS INFO DISPLAY - BuilderV3
// =====================================

import React, { useState } from 'react';
import { FileText, Maximize2, Settings, Info } from 'lucide-react';
import { UnitConverter } from '../utils/unitConverter';

interface CanvasInfoDisplayProps {
  canvasWidth: number;
  canvasHeight: number;
  paperFormat: string;
  zoom: number;
  unit?: 'mm' | 'cm';
  onUnitChange?: (unit: 'mm' | 'cm') => void;
  onFormatChange?: () => void;
  className?: string;
}

export const CanvasInfoDisplay: React.FC<CanvasInfoDisplayProps> = ({
  canvasWidth,
  canvasHeight,
  paperFormat,
  zoom,
  unit = 'mm',
  onUnitChange,
  onFormatChange,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);

  // Conversiones de unidades
  const conversions = {
    mm: {
      width: UnitConverter.pxToMm(canvasWidth),
      height: UnitConverter.pxToMm(canvasHeight)
    },
    cm: {
      width: UnitConverter.pxToCm(canvasWidth),
      height: UnitConverter.pxToCm(canvasHeight)
    },
    inches: {
      width: UnitConverter.pxToInches(canvasWidth),
      height: UnitConverter.pxToInches(canvasHeight)
    }
  };

  // Área total
  const areaMm2 = conversions.mm.width * conversions.mm.height;
  const areaCm2 = areaMm2 / 100;

  // Relación de aspecto
  const aspectRatio = Math.round((canvasWidth / canvasHeight) * 100) / 100;

  const formatValue = (value: number, decimals: number = 1) => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header compacto */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">{paperFormat}</span>
          <div className="text-sm text-gray-500">
            {formatValue(conversions[unit].width)} × {formatValue(conversions[unit].height)} {unit}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Selector de unidad */}
          <div className="flex bg-gray-100 rounded-md p-0.5">
            {(['mm', 'cm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => onUnitChange?.(u)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  unit === u
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
          
          {/* Botón de configuración */}
          <button
            onClick={onFormatChange}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Cambiar formato"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {/* Botón expandir/contraer */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title={expanded ? "Contraer" : "Ver detalles"}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel expandido */}
      {expanded && (
        <div className="p-3 space-y-3 border-t border-gray-100">
          {/* Dimensiones en múltiples unidades */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Dimensiones</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Píxeles:</span>
                  <span className="font-mono">{canvasWidth} × {canvasHeight} px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Milímetros:</span>
                  <span className="font-mono">
                    {formatValue(conversions.mm.width)} × {formatValue(conversions.mm.height)} mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Centímetros:</span>
                  <span className="font-mono">
                    {formatValue(conversions.cm.width)} × {formatValue(conversions.cm.height)} cm
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pulgadas:</span>
                  <span className="font-mono">
                    {formatValue(conversions.inches.width, 2)} × {formatValue(conversions.inches.height, 2)}"
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Relación:</span>
                  <span className="font-mono">{aspectRatio}:1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Área:</span>
                  <span className="font-mono">
                    {areaCm2 > 100 ? `${formatValue(areaCm2 / 10000, 3)} m²` : `${formatValue(areaCm2)} cm²`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información de zoom y resolución */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Visualización</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Zoom:</span>
                <span className="font-mono">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DPI:</span>
                <span className="font-mono">300</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vista:</span>
                <span className="font-mono">
                  {Math.round(canvasWidth * zoom)} × {Math.round(canvasHeight * zoom)} px
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Formato:</span>
                <span className="font-medium text-blue-600">{paperFormat}</span>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Medidas de impresión reales</span>
            <button
              onClick={onFormatChange}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
            >
              Cambiar Formato
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 