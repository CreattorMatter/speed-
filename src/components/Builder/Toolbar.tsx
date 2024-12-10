import React, { useState } from 'react';
import { Copy, Save, Eye, Download, Check, FileText, Image, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
  templateId?: string;
}

interface ExportOption {
  id: 'pdf' | 'png' | 'csv';
  label: string;
  icon: React.ReactNode;
  description: string;
}

const exportOptions: ExportOption[] = [
  {
    id: 'pdf',
    label: 'PDF',
    icon: <FileText className="w-6 h-6" />,
    description: 'Documento de alta calidad'
  },
  {
    id: 'png',
    label: 'PNG',
    icon: <Image className="w-6 h-6" />,
    description: 'Imagen de alta resolución'
  },
  {
    id: 'csv',
    label: 'CSV',
    icon: <FileSpreadsheet className="w-6 h-6" />,
    description: 'Datos en formato tabla'
  }
];

export default function Toolbar({ onSave, onPreview, templateId = generateTemplateId() }: ToolbarProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('');

  const handleCopyId = () => {
    navigator.clipboard.writeText(templateId);
  };

  const handleSave = () => {
    onSave?.();
    setShowSaveModal(true);
    setTimeout(() => setShowSaveModal(false), 3000); // Cerrar después de 3 segundos
  };

  const handleExport = (format: string) => {
    setSelectedFormat(format);
    setShowExportModal(false);
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  return (
    <>
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Save className="w-4 h-4" />
            <span>Guardar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPreview}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-200"
          >
            <Eye className="w-4 h-4" />
            <span>Vista previa</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-200"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </motion.button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-500">ID:</span>
            <span className="font-mono text-sm text-gray-700">{templateId}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopyId}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              title="Copiar ID"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Modal de Guardado */}
      <AnimatePresence>
        {showSaveModal && (
          <>
            {/* Overlay con fondo translúcido */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowSaveModal(false)}
            />
            
            {/* Modal centrado */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50
                       max-w-md w-full mx-4"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 rounded-full p-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Plantilla guardada exitosamente
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Tu plantilla ha sido guardada con el siguiente ID:
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">ID:</span>
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {templateId}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopyId}
                    className="p-2 hover:bg-white rounded-lg transition-colors group"
                    title="Copiar ID"
                  >
                    <Copy className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </motion.button>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg 
                           hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Exportación */}
      <AnimatePresence>
        {showExportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowExportModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50
                       max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Exportar plantilla
              </h3>
              <p className="text-gray-500 mb-4">
                Selecciona el formato de exportación:
              </p>

              <div className="space-y-3">
                {exportOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport(option.id)}
                    className="w-full p-4 flex items-center gap-4 rounded-lg border border-gray-200
                             hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                  >
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      {option.icon}
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg 
                           hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Éxito de Exportación */}
      <AnimatePresence>
        {showExportSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowExportSuccess(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50
                       max-w-md w-full mx-4"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 rounded-full p-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Plantilla exportada
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Tu plantilla ha sido exportada en formato {selectedFormat.toUpperCase()}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function generateTemplateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TPL-${timestamp}-${randomStr}`.toUpperCase();
}