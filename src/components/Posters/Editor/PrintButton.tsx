import React, { useState } from 'react';
import { Printer, AlertTriangle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { useSelector, useDispatch } from 'react-redux';
import { selectHasAnyChanges, selectProductChanges, clearProductChanges } from '../../../store/features/poster/posterSlice';
import { useHeader } from '../../shared/HeaderProvider';
import { ReportModal } from './ReportModal';
import { EmailService } from '../../../services/emailService';
import { EditedProduct } from '../../../hooks/useProductChanges';
import { usePrintCarteles } from '../../../hooks/usePrintCarteles';

interface PaperFormatOption {
  label: string;
  value: string;
  width: string;
  height: string;
}

interface PrintButtonProps {
  plantillaFamily: string;
  plantillaType: string;
  selectedProducts: any[];
  formatoSeleccionado?: PaperFormatOption | null;
  disabled?: boolean;
  // Props necesarias para el hook de impresión
  templateComponents: Record<string, React.ComponentType<any>>;
  PLANTILLA_MODELOS?: Record<string, any[]>;
  modeloSeleccionado?: string | null;
  selectedFinancing?: any[];
  getCurrentProductValue: (product: any, field: string) => any;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  plantillaFamily,
  plantillaType,
  selectedProducts,
  formatoSeleccionado,
  disabled = false,
  templateComponents,
  getCurrentProductValue
}) => {
  const navigate = useNavigate();
  const { userEmail, userName } = useHeader();
  const dispatch = useDispatch();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Usar Redux para detectar cambios
  const productChanges = useSelector(selectProductChanges);

  // Usar el hook de impresión
  const { printCarteles, isPrintInProgress } = usePrintCarteles(
    templateComponents,
    getCurrentProductValue
  );

  console.log('🔄 PrintButton render:', { 
    productChangesCount: Object.keys(productChanges).length,
    selectedProductsCount: selectedProducts.length,
    isPrintInProgress
  });

  // Verificar si hay cambios en productos seleccionados
  const hasChangesInSelectedProducts = React.useMemo(() => {
    const selectedProductIds = selectedProducts.map(p => p.id);
    const hasChangesInSelected = selectedProductIds.some(productId => 
      productChanges[productId] && productChanges[productId].isEdited
    );
    
    console.log('🎯 PrintButton - Cambios en productos seleccionados:', {
      selectedProductIds,
      productChanges: Object.keys(productChanges),
      hasChangesInSelected
    });
    
    return hasChangesInSelected;
  }, [selectedProducts, productChanges]);

  // Convertir datos de Redux al formato que espera ReportModal
  const editedSelectedProducts = React.useMemo(() => {
    const selectedProductIds = selectedProducts.map(p => p.id);
    const edited: EditedProduct[] = [];
    
    selectedProductIds.forEach(productId => {
      const reduxEditedProduct = productChanges[productId];
      if (reduxEditedProduct && reduxEditedProduct.isEdited) {
        // Encontrar el producto original en selectedProducts
        const originalProduct = selectedProducts.find(p => p.id === productId);
        if (originalProduct) {
          // Convertir al formato EditedProduct que espera ReportModal
          const adaptedProduct: EditedProduct = {
            // Propiedades del Product original
            id: originalProduct.id,
            sku: originalProduct.sku || '',
            name: originalProduct.name || reduxEditedProduct.productName,
            description: originalProduct.description || '',
            price: originalProduct.price || 0,
            imageUrl: originalProduct.imageUrl || '',
            category: originalProduct.category || '',
            brand: originalProduct.brand || '',
            
            // Propiedades del EditedProduct
            changes: reduxEditedProduct.changes.map(change => ({
              productId: change.productId,
              field: change.field,
              originalValue: change.originalValue,
              newValue: change.newValue,
              timestamp: change.timestamp
            })),
            isEdited: reduxEditedProduct.isEdited
          };
          edited.push(adaptedProduct);
        }
      }
    });
    
    console.log('📋 PrintButton - Productos editados adaptados:', edited);
    return edited;
  }, [selectedProducts, productChanges]);

  const handlePrintClick = async () => {
    console.log('🖱️ PrintButton clicked:', { 
      hasChangesInSelectedProducts, 
      selectedProductsCount: selectedProducts.length 
    });
    
    if (hasChangesInSelectedProducts) {
      console.log('📝 Abriendo modal de reporte - hay cambios detectados');
      setReportModalOpen(true);
    } else {
      console.log('🖨️ Imprimiendo directamente - no hay cambios');
      try {
        await printCarteles();
      } catch (error) {
        console.error('❌ Error al imprimir:', error);
        alert('Error al imprimir. Inténtalo de nuevo.');
      }
    }
  };

  const handleSendReport = async (reason: string) => {
    setIsProcessing(true);
    
    try {
      console.log('📝🖨️ Enviando reporte y procediendo con impresión');
      console.log('Razón del reporte:', reason);
      console.log('Productos editados:', editedSelectedProducts);
      console.log('Usuario:', { userEmail, userName });
      
      // Aquí iría la lógica para enviar el reporte
      // Por ahora solo simulamos el envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Cerrar el modal PRIMERO
      setReportModalOpen(false);
      setIsProcessing(false);
      
      // Esperar un momento para que el modal se cierre completamente
      setTimeout(async () => {
        try {
          console.log('🖨️ Ejecutando impresión después del reporte');
          await printCarteles();
        } catch (error) {
          console.error('❌ Error al imprimir después del reporte:', error);
          alert('Error al imprimir. Inténtalo de nuevo.');
        }
      }, 300); // 300ms de delay para asegurar que el modal se cierre
      
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      alert('Error al enviar el reporte. Inténtalo de nuevo.');
      setIsProcessing(false);
    }
  };

  const handleCancelReport = () => {
    setReportModalOpen(false);
  };

  // Determinar el texto y color del botón
  const buttonText = hasChangesInSelectedProducts ? 'Reportar e Imprimir' : 'Imprimir';
  const buttonColor = hasChangesInSelectedProducts 
    ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' 
    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';

  // Determinar si el botón está deshabilitado
  const isButtonDisabled = disabled || selectedProducts.length === 0 || isProcessing || isPrintInProgress;

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Contenedor principal del botón con información contextual */}
      <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        {/* Header con información */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              hasChangesInSelectedProducts 
                ? 'bg-orange-100' 
                : 'bg-blue-100'
            }`}>
              {hasChangesInSelectedProducts ? (
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              ) : (
                <Printer className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {hasChangesInSelectedProducts ? 'Cambios Detectados' : 'Listo para Imprimir'}
              </h3>
              <p className="text-sm text-gray-600">
                {hasChangesInSelectedProducts 
                  ? `${editedSelectedProducts.length} producto${editedSelectedProducts.length !== 1 ? 's' : ''} modificado${editedSelectedProducts.length !== 1 ? 's' : ''} - Se requiere reporte`
                  : `${selectedProducts.length} cartel${selectedProducts.length !== 1 ? 'es' : ''} seleccionado${selectedProducts.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>

          {/* Badge de estado */}
          {hasChangesInSelectedProducts && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-full border border-orange-200">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Requiere reporte</span>
            </div>
          )}
        </div>

        {/* Información adicional cuando hay cambios */}
        {hasChangesInSelectedProducts && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Se detectaron modificaciones</p>
                <p className="text-orange-700">
                  Los cambios serán reportados automáticamente antes de proceder con la impresión.
                </p>
                <div className="mt-2 space-y-1">
                  {editedSelectedProducts.map((product) => (
                    <div key={product.id} className="text-xs text-orange-600">
                      • <span className="font-medium">{product.name}</span>: {product.changes.length} cambio{product.changes.length !== 1 ? 's' : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón principal mejorado */}
        <button
          onClick={handlePrintClick}
          disabled={isButtonDisabled}
          className={`
            relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-white
            transition-all duration-300 ease-out transform
            ${buttonColor}
            ${isButtonDisabled
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] shadow-lg'
            }
            focus:outline-none focus:ring-4 focus:ring-blue-200
          `}
          title={hasChangesInSelectedProducts 
            ? `Se detectaron cambios en ${editedSelectedProducts.length} producto(s). Click para reportar e imprimir.`
            : 'Imprimir cartel(es) seleccionado(s)'
          }
        >
          {/* Efecto de brillo */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Contenido del botón */}
          <div className="relative flex items-center gap-3">
            {hasChangesInSelectedProducts ? (
              <AlertTriangle size={20} className="animate-pulse" />
            ) : (
              <Printer size={20} />
            )}
            
            <span className="text-lg">{buttonText}</span>
            
            {hasChangesInSelectedProducts && (
              <div className="flex items-center gap-2">
                <div className="w-px h-6 bg-white/30"></div>
                <span className="bg-white/20 text-sm px-3 py-1 rounded-full font-medium">
                  {editedSelectedProducts.length}
                </span>
              </div>
            )}
          </div>

          {/* Indicador de carga cuando está procesando */}
          {(isProcessing || isPrintInProgress) && (
            <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        {/* Botón secundario para limpiar cambios */}
        {hasChangesInSelectedProducts && !isProcessing && !isPrintInProgress && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas descartar todos los cambios realizados?')) {
                  dispatch(clearProductChanges());
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Descartar todos los cambios realizados"
            >
              <RotateCcw size={16} />
              <span>Descartar cambios</span>
            </button>
          </div>
        )}

        {/* Información del formato de papel */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Formato: {formatoSeleccionado?.label || 'A4 (210 × 297 mm)'}
          </p>
        </div>
      </div>

      {/* Modal de Reporte */}
      {reportModalOpen && (
        <div className="print:hidden">
          <ReportModal
            isOpen={reportModalOpen}
            onCancel={handleCancelReport}
            onSend={handleSendReport}
            editedProducts={editedSelectedProducts}
            plantillaFamily={plantillaFamily}
            plantillaType={plantillaType}
          />
        </div>
      )}
    </>
  );
};

export default PrintButton; 