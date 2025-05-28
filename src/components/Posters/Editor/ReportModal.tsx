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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Reportar Cambios de Productos
              </h3>
              <p className="text-sm text-gray-600">
                Se detectaron modificaciones que requieren reporte
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Panel principal */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Información del contexto */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Información de la plantilla
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Familia:</span>
                  <span className="text-blue-900 ml-2">{plantillaFamily}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Plantilla:</span>
                  <span className="text-blue-900 ml-2">{plantillaType}</span>
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
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Resumen de cambios realizados</h4>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Ocultar' : 'Ver'} detalles
                </button>
              </div>

              <div className="space-y-3">
                {editedProducts.map((product, index) => (
                  <div key={product.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{product.name}</h5>
                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                      </div>
                      <div className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        {product.changes.length} cambio{product.changes.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {showPreview && (
                      <div className="mt-3 space-y-2 pl-4 border-l-2 border-orange-300">
                        {product.changes.map((change, changeIndex) => (
                          <div key={changeIndex} className="text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-700">
                                {getFieldDisplayName(change.field)}:
                              </span>
                              <span className="text-xs text-gray-500">
                                {change.timestamp.toLocaleString('es-AR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                Antes: {change.originalValue}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de los cambios <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Explique por qué fue necesario modificar los datos de los productos..."
                className={`w-full px-3 py-2 border rounded-lg resize-none h-24 ${
                  error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {error ? (
                  <span className="text-sm text-red-500">{error}</span>
                ) : (
                  <span className="text-sm text-gray-500">
                    Mínimo 10 caracteres requeridos
                  </span>
                )}
                <span className="text-sm text-gray-400">
                  {reason.length}/500
                </span>
              </div>
            </div>

            {/* Alert de información */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Información importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Se enviará un email al responsable con los detalles de los cambios</li>
                    <li>Los cambios solo afectan la impresión, no la base de datos</li>
                    <li>Es obligatorio especificar el motivo para proceder</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!reason.trim() || reason.trim().length < 10}
            className={`flex-1 px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
              reason.trim() && reason.trim().length >= 10
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            Enviar Reporte e Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}; 