import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  AlertTriangle, 
  Edit3, 
  Check, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Hash,
  Send,
  FileText
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectProductChanges,
  selectHasAnyChanges,
  EditedProduct,
  ProductChange
} from '../../../../../store/features/poster/posterSlice';
import { AppDispatch } from '../../../../../store';
import { Product, products } from '../../../../../data/products';

interface ProductChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPrint: (justification: string) => void;
}

export const ProductChangesModal: React.FC<ProductChangesModalProps> = ({
  isOpen,
  onClose,
  onConfirmPrint
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const productChanges = useSelector(selectProductChanges);
  const hasAnyChanges = useSelector(selectHasAnyChanges);
  
  const [justification, setJustification] = useState('');
  const [error, setError] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const getProductData = (productId: string) => {
    return products.find((p: Product) => p.id === productId);
  };

  const formatValue = (field: string, value: string | number) => {
    if (field === 'price' || field.toLowerCase().includes('precio')) {
      return `$${Number(value).toLocaleString('es-AR')}`;
    }
    return value.toString();
  };

  const getFieldIcon = (field: string) => {
    if (field === 'price' || field.toLowerCase().includes('precio')) {
      return <DollarSign className="w-4 h-4 text-green-600" />;
    }
    if (field === 'name' || field.toLowerCase().includes('nombre')) {
      return <Package className="w-4 h-4 text-indigo-600" />;
    }
    if (field === 'sku') {
      return <Hash className="w-4 h-4 text-gray-600" />;
    }
    return <Edit3 className="w-4 h-4 text-blue-600" />;
  };

  const getChangeDirection = (field: string, originalValue: string | number, newValue: string | number) => {
    if (field === 'price' || field.toLowerCase().includes('precio')) {
      const original = Number(originalValue);
      const nuevo = Number(newValue);
      if (nuevo > original) return 'increase';
      if (nuevo < original) return 'decrease';
    }
    return 'change';
  };

  const handleConfirm = () => {
    if (justification.trim() === '') {
      setError('Por favor, ingresa una justificación para los cambios.');
      return;
    }
    setError('');
    onConfirmPrint(justification);
  };

  if (!isOpen) return null;

  const changedProducts: EditedProduct[] = Object.values(productChanges);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reporte de Cambios y Confirmación</h2>
                <p className="text-sm text-gray-600">
                  Revisa los cambios y añade una justificación antes de imprimir.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {!hasAnyChanges ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin cambios para reportar</h3>
                <p className="text-gray-500">
                  No se han realizado modificaciones. Puedes proceder a imprimir.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Resumen de Cambios</h3>
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                    {changedProducts.map((productChange) => {
                      const productData = getProductData(productChange.productId);
                      const isExpanded = expandedProduct === productChange.productId;
                      
                      return (
                        <div
                          key={productChange.productId}
                          className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                        >
                          <div
                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                              isExpanded ? 'border-b border-gray-200' : ''
                            }`}
                            onClick={() => setExpandedProduct(isExpanded ? null : productChange.productId)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-indigo-500" />
                                <div>
                                  <h3 className="font-medium text-gray-900">{productChange.productName}</h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>SKU: {productData?.sku || 'N/A'}</span>
                                    <span>•</span>
                                    <span>{productChange.changes.length} cambio{productChange.changes.length !== 1 ? 's' : ''}</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${isExpanded ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                {isExpanded ? 'Ocultar Cambios' : 'Ver Cambios'}
                              </span>
                            </div>
                          </div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                              >
                                <div className="p-4 space-y-3 border-t border-gray-200 bg-gray-50/50">
                                  {productChange.changes.map((change: ProductChange, index: number) => {
                                    const direction = getChangeDirection(change.field, change.originalValue, change.newValue);
                                    return (
                                      <div key={index} className="flex items-center justify-between p-2 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          {getFieldIcon(change.field)}
                                          <span className="font-medium text-gray-700 capitalize">{change.field === 'price' ? 'Precio' : change.field}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm text-gray-500 line-through">{formatValue(change.field, change.originalValue)}</span>
                                          {direction === 'increase' && <TrendingUp className="w-4 h-4 text-green-500" />}
                                          {direction === 'decrease' && <TrendingDown className="w-4 h-4 text-red-500" />}
                                          {direction === 'change' && <Edit3 className="w-4 h-4 text-blue-500" />}
                                          <span className={`text-sm font-semibold ${direction === 'increase' ? 'text-green-600' : direction === 'decrease' ? 'text-red-600' : 'text-blue-600'}`}>
                                            {formatValue(change.field, change.newValue)}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4">
                  <label htmlFor="justification" className="block text-lg font-semibold text-gray-800 mb-2">
                    Justificación de Cambios (Requerido)
                  </label>
                  <textarea
                    id="justification"
                    value={justification}
                    onChange={(e) => {
                      setJustification(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Ej: Se actualizaron los precios según la nueva lista de ofertas para la campaña del Día del Padre..."
                    className={`w-full p-3 border rounded-lg transition-colors focus:ring-2 ${
                      error
                        ? 'border-red-500 bg-red-50 focus:ring-red-300'
                        : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-300'
                    }`}
                    rows={4}
                  />
                  {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-white/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>Esta acción generará un reporte y procederá a la impresión.</span>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-transparent border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={hasAnyChanges && !justification.trim()}
                className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Confirmar y Enviar a Impresión
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 