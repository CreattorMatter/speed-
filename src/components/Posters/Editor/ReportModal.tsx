import React, { useState } from 'react';
import { Send, AlertTriangle, FileText, X, Eye } from 'lucide-react';
import { EditedProduct } from '../../../hooks/useProductChanges';
import { getFieldDisplayName } from '../../../utils/validationUtils';

interface ReportModalProps {
  isOpen: boolean;
  editedProducts: EditedProduct[];
  plantillaFamily: string;
  plantillaType: string;
  onSend: (reason: string) => void;
  onCancel: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  editedProducts,
  plantillaFamily,
  plantillaType,
  onSend,
  onCancel
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = () => {
    if (!reason.trim()) {
      setError('Debe especificar el motivo de los cambios');
      return;
    }

    if (reason.trim().length < 10) {
      setError('El motivo debe tener al menos 10 caracteres');
      return;
    }

    onSend(reason.trim());
    setReason('');
    setError('');
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel();
  };

  if (!isOpen) return null;

  const totalChanges = editedProducts.reduce((sum, product) => sum + product.changes.length, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden p-2 xs:p-3 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-[95vw] xs:max-w-[90vw] sm:max-w-[85vw] lg:max-w-4xl xl:max-w-5xl h-[95vh] xs:h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 xs:p-4 sm:p-5 lg:p-6 border-b bg-orange-50 flex-shrink-0">
          <div className="flex items-center gap-2 xs:gap-3 min-w-0">
            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 truncate">
                Reportar Cambios de Productos
              </h3>
              <p className="text-xs xs:text-sm text-gray-600 truncate">
                Se detectaron modificaciones que requieren reporte
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 xs:p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Cerrar"
          >
            <X className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 xs:p-4 sm:p-5 lg:p-6">
            {/* Información del contexto */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 xs:p-4 mb-4 xs:mb-5 sm:mb-6">
              <h4 className="font-medium text-blue-900 mb-2 xs:mb-3 flex items-center gap-2">
                <FileText className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
                <span className="text-xs xs:text-sm sm:text-base">Información de la plantilla</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3 sm:gap-4 text-xs xs:text-sm">
                <div className="min-w-0">
                  <span className="text-blue-700 font-medium">Familia:</span>
                  <span className="text-blue-900 ml-2 break-words">{plantillaFamily}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-blue-700 font-medium">Plantilla:</span>
                  <span className="text-blue-900 ml-2 break-words">{plantillaType}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Productos editados:</span>
                  <span className="text-blue-900 ml-2">{editedProducts.length}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Total cambios:</span>
                  <span className="text-blue-900 ml-2">{totalChanges}</span>
                </div>
              </div>
            </div>

            {/* Resumen de cambios */}
            <div className="mb-4 xs:mb-5 sm:mb-6">
              <div className="flex items-center justify-between mb-3 xs:mb-4">
                <h4 className="font-medium text-gray-900 text-sm xs:text-base">Resumen de cambios realizados</h4>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 py-1 xs:py-1.5 text-xs xs:text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                >
                  <Eye className="w-3 h-3 xs:w-4 xs:h-4" />
                  {showPreview ? 'Ocultar' : 'Ver'} detalles
                </button>
              </div>

              <div className="space-y-2 xs:space-y-3 max-h-48 xs:max-h-56 sm:max-h-64 overflow-y-auto">
                {editedProducts.map((product, index) => (
                  <div key={product.id} className="border rounded-lg p-3 xs:p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h5 className="font-medium text-gray-900 text-sm xs:text-base truncate">{product.name}</h5>
                        <p className="text-xs xs:text-sm text-gray-600">SKU: {product.sku}</p>
                      </div>
                      <div className="text-xs xs:text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded flex-shrink-0 ml-2">
                        {product.changes.length} cambio{product.changes.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {showPreview && (
                      <div className="mt-3 space-y-2 pl-3 xs:pl-4 border-l-2 border-orange-300">
                        {product.changes.map((change, changeIndex) => (
                          <div key={changeIndex} className="text-xs xs:text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-700 truncate">
                                {getFieldDisplayName(change.field)}:
                              </span>
                              <span className="text-xxs xs:text-xs text-gray-500 flex-shrink-0 ml-2">
                                {change.timestamp.toLocaleString('es-AR')}
                              </span>
                            </div>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xxs xs:text-xs truncate">
                                Antes: {change.originalValue}
                              </span>
                              <span className="text-gray-400 hidden xs:inline">→</span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xxs xs:text-xs truncate">
                                Ahora: {change.newValue}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Campo de motivo */}
            <div className="mb-4 xs:mb-5 sm:mb-6">
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-2">
                Motivo de los cambios <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Explique por qué fue necesario modificar los datos de los productos..."
                className={`w-full px-3 py-2 border rounded-lg resize-none h-16 xs:h-20 sm:h-24 text-xs xs:text-sm ${
                  error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {error ? (
                  <span className="text-xs xs:text-sm text-red-500 truncate">{error}</span>
                ) : (
                  <span className="text-xs xs:text-sm text-gray-500">
                    Mínimo 10 caracteres requeridos
                  </span>
                )}
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {reason.length}/500
                </span>
              </div>
            </div>

            {/* Alert de información */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 xs:p-4">
              <div className="flex items-start gap-2 xs:gap-3">
                <AlertTriangle className="w-4 h-4 xs:w-5 xs:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs xs:text-sm text-yellow-800 min-w-0">
                  <p className="font-medium mb-1">Información importante:</p>
                  <ul className="list-disc list-inside space-y-0.5 xs:space-y-1">
                    <li>Se enviará un email al responsable con los detalles de los cambios</li>
                    <li>Los cambios solo afectan la impresión, no la base de datos</li>
                    <li>Es obligatorio especificar el motivo para proceder</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 p-3 xs:p-4 sm:p-5 lg:p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={handleCancel}
            className="flex-1 px-3 xs:px-4 py-2 xs:py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm xs:text-base"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!reason.trim() || reason.trim().length < 10}
            className={`flex-1 px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-1.5 xs:gap-2 text-sm xs:text-base ${
              reason.trim() && reason.trim().length >= 10
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-3 h-3 xs:w-4 xs:h-4" />
            <span className="truncate">Enviar Reporte e Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 