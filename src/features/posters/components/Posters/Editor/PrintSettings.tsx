import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectPrintSettings, 
  actualizarPrintSettings 
} from '../../../store/features/poster/posterSlice';
import { AppDispatch } from '../../../store';
import { type PrintSettings } from '../../../types/index';

interface PrintSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintSettingsModal: React.FC<PrintSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const printSettings = useSelector(selectPrintSettings);
  const [localSettings, setLocalSettings] = useState<PrintSettings>(printSettings);

  const handleSave = () => {
    dispatch(actualizarPrintSettings(localSettings));
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: PrintSettings = {
      pageBreakBetweenProducts: true,
      includeProductInfo: false,
      pageSize: 'A4',
      orientation: 'portrait',
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    };
    setLocalSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Configuración de Impresión
            </h2>
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
          {/* Tamaño de página */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamaño de Página
            </label>
            <select
              value={localSettings.pageSize}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                pageSize: e.target.value as 'A4' | 'A3' | 'Letter' | 'Custom'
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="A4">A4 (210 × 297 mm)</option>
              <option value="A3">A3 (297 × 420 mm)</option>
              <option value="Letter">Letter (216 × 279 mm)</option>
              <option value="Custom">Personalizado</option>
            </select>
          </div>

          {/* Orientación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orientación
            </label>
            <div className="flex gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="portrait"
                  checked={localSettings.orientation === 'portrait'}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    orientation: e.target.value as 'portrait' | 'landscape'
                  })}
                  className="mr-2"
                />
                Vertical
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="landscape"
                  checked={localSettings.orientation === 'landscape'}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    orientation: e.target.value as 'portrait' | 'landscape'
                  })}
                  className="mr-2"
                />
                Horizontal
              </label>
            </div>
          </div>

          {/* Márgenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Márgenes (mm)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Superior</label>
                <input
                  type="number"
                  value={localSettings.margins.top}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    margins: {
                      ...localSettings.margins,
                      top: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Derecho</label>
                <input
                  type="number"
                  value={localSettings.margins.right}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    margins: {
                      ...localSettings.margins,
                      right: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Inferior</label>
                <input
                  type="number"
                  value={localSettings.margins.bottom}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    margins: {
                      ...localSettings.margins,
                      bottom: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Izquierdo</label>
                <input
                  type="number"
                  value={localSettings.margins.left}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    margins: {
                      ...localSettings.margins,
                      left: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </div>

          {/* Opciones adicionales */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localSettings.pageBreakBetweenProducts}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  pageBreakBetweenProducts: e.target.checked
                })}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">
                Salto de página entre productos
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localSettings.includeProductInfo}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  includeProductInfo: e.target.checked
                })}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">
                Incluir información adicional del producto
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Restablecer
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 