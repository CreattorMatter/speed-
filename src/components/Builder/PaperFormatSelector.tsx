import React, { useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperFormat } from '../../types/builder';
import { PAPER_FORMATS } from '../../constants/paperFormats';

interface PaperFormatSelectorProps {
  selectedFormat: PaperFormat;
  onFormatChange: (format: PaperFormat) => void;
  isLandscape: boolean;
  onToggleLandscape: () => void;
}

export const PaperFormatSelector: React.FC<PaperFormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
  isLandscape,
  onToggleLandscape
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg 
                 hover:bg-gray-50 border border-gray-200 min-w-[200px]"
      >
        <FileText className="w-4 h-4" />
        <span className="flex-1 text-left">
          {selectedFormat.name}
          <span className="text-xs text-gray-500 ml-1">
            ({isLandscape ? 
              `${selectedFormat.height} × ${selectedFormat.width}` : 
              `${selectedFormat.width} × ${selectedFormat.height}`})
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para cerrar al hacer clic fuera */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-[280px] bg-white rounded-lg shadow-lg 
                       border border-gray-200 py-2 z-50"
            >
              {/* Orientación */}
              <div className="px-3 py-2 border-b border-gray-100">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isLandscape}
                    onChange={onToggleLandscape}
                    className="rounded border-gray-300 text-indigo-600 
                             focus:ring-indigo-500"
                  />
                  Orientación horizontal
                </label>
              </div>

              {/* Lista de formatos */}
              <div className="max-h-[300px] overflow-y-auto">
                {PAPER_FORMATS.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => {
                      onFormatChange(format);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between
                              ${selectedFormat.id === format.id ? 'bg-indigo-50' : ''}`}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{format.name}</div>
                      <div className="text-xs text-gray-500">
                        {isLandscape ? 
                          `${format.height} × ${format.width}` : 
                          `${format.width} × ${format.height}`}
                      </div>
                    </div>
                    {selectedFormat.id === format.id && (
                      <div className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </button>
                ))}
              </div>

              {/* Vista previa */}
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="flex justify-center">
                  <div 
                    className={`border-2 border-gray-300 transition-all ${
                      isLandscape ? 'w-16 h-12' : 'w-12 h-16'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}; 