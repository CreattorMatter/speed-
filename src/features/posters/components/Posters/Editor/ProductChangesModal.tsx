import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  AlertTriangle, 
  Edit3, 
  RotateCcw, 
  Check, 
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Hash,
  Calendar
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectProductChanges,
  selectHasAnyChanges,
  clearProductChanges,
  removeProductChanges,
  trackProductChange
} from '../../../store/features/poster/posterSlice';
import { AppDispatch } from '../../../store';
import { products } from '../../../data/products';

interface ProductChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductChangesModal: React.FC<ProductChangesModalProps> = ({
  isOpen,
  onClose
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const productChanges = useSelector(selectProductChanges);
  const hasAnyChanges = useSelector(selectHasAnyChanges);
  
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // Obtener datos completos del producto
  const getProductData = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  // Formatear fecha de cambio
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Formatear valores para mostrar
  const formatValue = (field: string, value: string | number) => {
    if (field === 'price' || field.toLowerCase().includes('precio')) {
      return `$${Number(value).toLocaleString()}`;
    }
    return value.toString();
  };

  // Obtener icono según el campo
  const getFieldIcon = (field: string) => {
    if (field === 'price' || field.toLowerCase().includes('precio')) {
      return <DollarSign className="w-4 h-4" />;
    }
    if (field === 'name' || field.toLowerCase().includes('nombre')) {
      return <Package className="w-4 h-4" />;
    }
    if (field === 'sku') {
      return <Hash className="w-4 h-4" />;
    }
    return <Edit3 className="w-4 h-4" />;
  };

  // Determinar si el cambio es un aumento o disminución
  const getChangeDirection = (field: string, originalValue: string | number, newValue: string | number) => {
    if (field === 'price' || field.toLowerCase().includes('precio')) {
      const original = Number(originalValue);
      const nuevo = Number(newValue);
      if (nuevo > original) return 'increase';
      if (nuevo < original) return 'decrease';
    }
    return 'change';
  };

  // Manejar reversión de un campo específico
  const handleRevertField = (productId: string, field: string) => {
    const productChange = productChanges[productId];
    if (!productChange) return;

    const change = productChange.changes.find(c => c.field === field);
    if (!change) return;

    // Volver al valor original
    dispatch(trackProductChange({
      productId,
      productName: productChange.productName,
      field,
      originalValue: change.originalValue,
      newValue: change.originalValue
    }));
  };

  // Manejar reversión de todos los cambios de un producto
  const handleRevertAllProduct = (productId: string) => {
    dispatch(removeProductChanges(productId));
  };

  // Manejar reversión de todos los cambios
  const handleRevertAll = () => {
    if (window.confirm('¿Estás seguro de que deseas revertir todos los cambios realizados?')) {
      dispatch(clearProductChanges());
    }
  };

  if (!isOpen) return null;

  const changedProducts = Object.values(productChanges);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Cambios Realizados</h2>
                <p className="text-sm text-gray-600">
                  {changedProducts.length} producto{changedProducts.length !== 1 ? 's' : ''} con modificaciones
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasAnyChanges && (
                <button
                  onClick={handleRevertAll}
                  className="flex items-center gap-2 px-4 py-2 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Revertir Todo
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {!hasAnyChanges ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin cambios realizados</h3>
                <p className="text-gray-500">
                  No se han realizado modificaciones en los productos seleccionados.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {changedProducts.map((productChange) => {
                  const productData = getProductData(productChange.productId);
                  const isExpanded = expandedProduct === productChange.productId;
                  
                  return (
                    <div
                      key={productChange.productId}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      {/* Product Header */}
                      <div
                        className={`p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors ${
                          isExpanded ? 'border-b border-gray-200' : ''
                        }`}
                        onClick={() => setExpandedProduct(isExpanded ? null : productChange.productId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {productChange.productName}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>SKU: {productData?.sku || 'N/A'}</span>
                                <span>•</span>
                                <span>{productChange.changes.length} cambio{productChange.changes.length !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                              Modificado
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRevertAllProduct(productChange.productId);
                              }}
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Revertir todos los cambios de este producto"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Product Changes Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-white"
                          >
                            <div className="p-4 space-y-3">
                              {productChange.changes.map((change, index) => {
                                const direction = getChangeDirection(change.field, change.originalValue, change.newValue);
                                
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="flex items-center gap-2">
                                        {getFieldIcon(change.field)}
                                        <span className="font-medium text-gray-700 capitalize">
                                          {change.field === 'price' ? 'Precio' : change.field}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-3 flex-1">
                                        <div className="text-sm">
                                          <span className="text-gray-500">De: </span>
                                          <span className="font-medium text-gray-700">
                                            {formatValue(change.field, change.originalValue)}
                                          </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                          {direction === 'increase' && <TrendingUp className="w-4 h-4 text-green-500" />}
                                          {direction === 'decrease' && <TrendingDown className="w-4 h-4 text-red-500" />}
                                          {direction === 'change' && <Edit3 className="w-4 h-4 text-blue-500" />}
                                        </div>
                                        
                                        <div className="text-sm">
                                          <span className="text-gray-500">A: </span>
                                          <span className={`font-medium ${
                                            direction === 'increase' ? 'text-green-600' :
                                            direction === 'decrease' ? 'text-red-600' :
                                            'text-blue-600'
                                          }`}>
                                            {formatValue(change.field, change.newValue)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(change.timestamp)}
                                      </div>
                                      
                                      <button
                                        onClick={() => handleRevertField(productChange.productId, change.field)}
                                        className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                        title="Revertir este cambio"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                      </button>
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
            )}
          </div>

          {/* Footer */}
          {hasAnyChanges && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>
                  Los cambios se aplicarán automáticamente en los carteles generados
                </span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 