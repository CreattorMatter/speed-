// =====================================
// CUSTOM PAPER FORMAT MODAL - BuilderV3
// =====================================

import React, { useState, useEffect } from 'react';
import { X, FileText, Ruler } from 'lucide-react';

interface CustomPaperFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (width: number, height: number) => void;
  currentWidth?: number;
  currentHeight?: number;
}

export const CustomPaperFormatModal: React.FC<CustomPaperFormatModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentWidth = 210,
  currentHeight = 297
}) => {
  const [width, setWidth] = useState(currentWidth.toString());
  const [height, setHeight] = useState(currentHeight.toString());
  const [errors, setErrors] = useState<{width?: string; height?: string}>({});

  useEffect(() => {
    if (isOpen) {
      setWidth(currentWidth.toString());
      setHeight(currentHeight.toString());
      setErrors({});
    }
  }, [isOpen, currentWidth, currentHeight]);

  const validateDimensions = () => {
    const newErrors: {width?: string; height?: string} = {};
    
    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);

    if (!width || isNaN(widthNum) || widthNum <= 0) {
      newErrors.width = 'El ancho debe ser un número mayor a 0';
    } else if (widthNum < 50 || widthNum > 2000) {
      newErrors.width = 'El ancho debe estar entre 50mm y 2000mm';
    }

    if (!height || isNaN(heightNum) || heightNum <= 0) {
      newErrors.height = 'El alto debe ser un número mayor a 0';
    } else if (heightNum < 50 || heightNum > 2000) {
      newErrors.height = 'El alto debe estar entre 50mm y 2000mm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateDimensions()) {
      onConfirm(parseFloat(width), parseFloat(height));
      onClose();
    }
  };

  const presetFormats = [
    { name: 'A2', width: 420, height: 594 },
    { name: 'A3', width: 297, height: 420 },
    { name: 'A4', width: 210, height: 297 },
    { name: 'A5', width: 148, height: 210 },
    { name: 'Carta', width: 216, height: 279 },
    { name: 'Legal', width: 216, height: 356 },
    { name: 'Tabloid', width: 279, height: 432 }
  ];

  const applyPreset = (presetWidth: number, presetHeight: number) => {
    setWidth(presetWidth.toString());
    setHeight(presetHeight.toString());
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Formato Personalizado
              </h2>
              <p className="text-sm text-gray-500">
                Configure las dimensiones en milímetros
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dimension inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Ruler className="w-4 h-4 inline mr-1" />
                Ancho (mm)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                onBlur={validateDimensions}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.width ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="210"
                min="50"
                max="2000"
              />
              {errors.width && (
                <p className="text-red-500 text-xs mt-1">{errors.width}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Ruler className="w-4 h-4 inline mr-1" />
                Alto (mm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                onBlur={validateDimensions}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.height ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="297"
                min="50"
                max="2000"
              />
              {errors.height && (
                <p className="text-red-500 text-xs mt-1">{errors.height}</p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
            <div className="text-sm text-gray-600">
              Formato: <span className="font-medium">{width} × {height} mm</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Relación de aspecto: {width && height ? (parseFloat(width) / parseFloat(height)).toFixed(2) : '1.00'}
            </div>
          </div>

          {/* Presets */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Formatos predefinidos:</p>
            <div className="grid grid-cols-2 gap-2">
              {presetFormats.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.width, preset.height)}
                  className="p-2 text-left text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-gray-500">{preset.width} × {preset.height} mm</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={Object.keys(errors).length > 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Aplicar Formato
          </button>
        </div>
      </div>
    </div>
  );
}; 