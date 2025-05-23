import React from 'react';
import { RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaperFormat {
  id: string;
  name: string;
  width: string;
  height: string;
}

interface FormatControlsProps {
  selectedFormat: PaperFormat;
  isLandscape: boolean;
  onToggleOrientation: () => void;
  onFormatChange: (format: PaperFormat) => void;
  availableFormats: PaperFormat[];
  compact?: boolean;
}

export const FormatControls: React.FC<FormatControlsProps> = ({
  selectedFormat,
  isLandscape,
  onToggleOrientation,
  onFormatChange,
  availableFormats,
  compact = false
}) => {
  return (
    <div className={`flex items-center gap-2 bg-white rounded-lg shadow-md p-2 border border-gray-200 ${
      compact ? 'flex-col' : ''
    }`}>
      {/* Selector de formato */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Formato:
        </label>
        <select
          value={selectedFormat.id}
          onChange={(e) => {
            const format = availableFormats.find(f => f.id === e.target.value);
            if (format) onFormatChange(format);
          }}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {availableFormats.map((format) => (
            <option key={format.id} value={format.id}>
              {format.name} ({format.width} × {format.height})
            </option>
          ))}
        </select>
      </div>

      {!compact && <div className="w-px h-6 bg-gray-300" />}

      {/* Controles de orientación */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {isLandscape ? 'Horizontal' : 'Vertical'}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleOrientation}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          title={`Cambiar a ${isLandscape ? 'vertical' : 'horizontal'}`}
        >
          <RotateCw className="w-4 h-4" />
        </motion.button>
      </div>

      {!compact && (
        <>
          <div className="w-px h-6 bg-gray-300" />
          
          {/* Indicador visual de orientación */}
          <div className="flex items-center gap-2">
            <div className={`bg-gray-200 rounded border-2 border-gray-400 transition-all ${
              isLandscape ? 'w-6 h-4' : 'w-4 h-6'
            }`} />
            <span className="text-xs text-gray-500">
              {isLandscape ? selectedFormat.height : selectedFormat.width} × {isLandscape ? selectedFormat.width : selectedFormat.height}
            </span>
          </div>
        </>
      )}
    </div>
  );
}; 