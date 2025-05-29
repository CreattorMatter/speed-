import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Download, Settings, AlertTriangle, RotateCcw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectPrintSettings,
  selectProductChanges,
  clearProductChanges
} from '../../../store/features/poster/posterSlice';
import { ReportModal } from './ReportModal';
import { type Product } from '../../../data/products';
import { type TemplateModel } from '../../../constants/posters/templates';
import { EditedProduct } from '../../../hooks/useProductChanges';
import { AppDispatch } from '../../../store';

interface PaperFormatOption {
  label: string;
  value: string;
  width: string;
  height: string;
}

interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  plan: string;
}

interface PrintButtonAdvancedProps {
  templateComponents: Record<string, React.ComponentType<any>>;
  PLANTILLA_MODELOS: Record<string, TemplateModel[]>;
  getCurrentProductValue: (product: Product, field: string) => any;
  disabled?: boolean;
  plantillaFamily?: string;
  plantillaType?: string;
  selectedProducts: Product[];
  modeloSeleccionado: string | null;
  formatoSeleccionado: PaperFormatOption | null;
  selectedFinancing: FinancingOption[];
}

export const PrintButtonAdvanced: React.FC<PrintButtonAdvancedProps> = ({
  templateComponents,
  PLANTILLA_MODELOS,
  getCurrentProductValue,
  disabled = false,
  plantillaFamily = 'Sin especificar',
  plantillaType = 'Sin especificar',
  selectedProducts,
  modeloSeleccionado,
  formatoSeleccionado,
  selectedFinancing
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const printSettings = useSelector(selectPrintSettings);
  const productChanges = useSelector(selectProductChanges);
  const printRef = useRef<HTMLDivElement>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Verificar si hay cambios en productos seleccionados
  const hasChangesInSelectedProducts = React.useMemo(() => {
    const productIds = selectedProducts.map(p => p.id);
    const hasChanges = productIds.some(productId => 
      productChanges[productId] && productChanges[productId].isEdited
    );
    
    console.log('🎯 PrintButtonAdvanced - Cambios en productos seleccionados:', {
      productIds,
      productChanges: Object.keys(productChanges),
      hasChanges
    });
    
    return hasChanges;
  }, [selectedProducts, productChanges]);

  // Convertir datos de Redux al formato que espera ReportModal
  const editedSelectedProducts = React.useMemo(() => {
    const productIds = selectedProducts.map(p => p.id);
    const edited: EditedProduct[] = [];
    
    productIds.forEach(productId => {
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
    
    console.log('📋 PrintButtonAdvanced - Productos editados adaptados:', edited);
    return edited;
  }, [selectedProducts, productChanges]);

  // Función para generar props dinámicos para el componente de plantilla
  const generateTemplateProps = (product: Product) => {
    const baseProps = {
      small: false,
      financiacion: selectedFinancing,
      productos: [product],
      titulo: "Ofertas Especiales"
    };

    // Generar props dinámicos basados en los valores actuales del producto
    const templateProps: Record<string, any> = {
      // Mapeo directo de campos
      nombre: getCurrentProductValue(product, 'nombre'),
      precioActual: getCurrentProductValue(product, 'precioActual')?.toString(),
      porcentaje: getCurrentProductValue(product, 'porcentaje')?.toString(),
      sap: getCurrentProductValue(product, 'sap')?.toString(),
      fechasDesde: getCurrentProductValue(product, 'fechasDesde')?.toString(),
      fechasHasta: getCurrentProductValue(product, 'fechasHasta')?.toString(),
      origen: getCurrentProductValue(product, 'origen')?.toString(),
      precioSinImpuestos: getCurrentProductValue(product, 'precioSinImpuestos')?.toString()
    };

    return { 
      ...baseProps, 
      ...templateProps 
    };
  };

  // Función para encontrar el componente de plantilla
  const getTemplateComponent = (product: Product) => {
    if (!plantillaFamily || !modeloSeleccionado) {
      return null;
    }

    const modelos = PLANTILLA_MODELOS[plantillaFamily] || [];
    const modelo = modelos.find(m => m.id === modeloSeleccionado);
    
    if (!modelo) {
      return null;
    }

    return templateComponents[modelo.componentPath];
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Carteles_${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @page {
        size: ${printSettings.pageSize};
        orientation: ${printSettings.orientation};
        margin: ${printSettings.margins.top}mm ${printSettings.margins.right}mm ${printSettings.margins.bottom}mm ${printSettings.margins.left}mm;
      }
      
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        
        .print-page {
          page-break-after: ${printSettings.pageBreakBetweenProducts ? 'always' : 'auto'};
        }
        
        .print-page:last-child {
          page-break-after: avoid;
        }
      }
    `
  });

  const handlePrintClick = async () => {
    console.log('🖱️ PrintButtonAdvanced clicked:', { 
      hasChangesInSelectedProducts, 
      selectedProductsCount: selectedProducts.length 
    });
    
    if (hasChangesInSelectedProducts) {
      console.log('📝 Abriendo modal de reporte - hay cambios detectados');
      setReportModalOpen(true);
    } else {
      console.log('🖨️ Imprimiendo directamente - no hay cambios');
      try {
        handlePrint();
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
          handlePrint();
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

  const isDisabled = disabled || selectedProducts.length === 0;

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Botón principal de impresión */}
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="relative">
            <button
              onClick={handlePrintClick}
              disabled={isDisabled || isProcessing}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isDisabled || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : hasChangesInSelectedProducts
                  ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
              title={
                isDisabled 
                  ? 'No hay productos para imprimir' 
                  : hasChangesInSelectedProducts
                  ? 'Hay cambios detectados - Se abrirá el modal de reporte'
                  : 'Imprimir todos los carteles'
              }
            >
              {hasChangesInSelectedProducts && !isProcessing && (
                <AlertTriangle className="w-5 h-5" />
              )}
              <Printer className="w-5 h-5" />
              <span>
                {hasChangesInSelectedProducts && !isProcessing ? 'Reportar e Imprimir' : 'Imprimir Carteles'}
              </span>
              {selectedProducts.length > 0 && (
                <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                  {selectedProducts.length}
                </span>
              )}
            </button>

            {(isProcessing) && (
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Botón secundario para limpiar cambios */}
        {hasChangesInSelectedProducts && !isProcessing && (
          <div className="flex justify-center">
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

        {/* Componente oculto para impresión */}
        <div style={{ display: 'none' }}>
          <div ref={printRef} className="print-container">
            {/* Estilos específicos para impresión */}
            <style>{`
              @media print {
                .print-container {
                  width: 100%;
                  height: 100%;
                }
                
                .print-page {
                  page-break-after: always;
                  width: 100%;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0;
                  padding: 20px;
                  box-sizing: border-box;
                }
                
                .print-page:last-child {
                  page-break-after: avoid;
                }
                
                .print-content {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                
                /* Ocultar elementos no necesarios en impresión */
                .no-print {
                  display: none !important;
                }
              }
              
              @media screen {
                .print-container {
                  background: #f5f5f5;
                  padding: 20px;
                }
                
                .print-page {
                  background: white;
                  margin-bottom: 20px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  border-radius: 8px;
                  padding: 20px;
                  min-height: 400px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
              }
            `}</style>

            {selectedProducts.map((product, index) => {
              const Component = getTemplateComponent(product);
              
              return (
                <div key={product.id} className="print-page">
                  <div className="print-content">
                    {Component && typeof Component === "function" ? (
                      <Component 
                        {...generateTemplateProps(product)} 
                      />
                    ) : (
                      <div className="text-center p-8">
                        <h3 className="text-xl font-bold text-red-600 mb-4">
                          Error al cargar plantilla
                        </h3>
                        <p className="text-gray-600 mb-2">
                          Producto: {product.name}
                        </p>
                        <p className="text-gray-600 mb-2">
                          Plantilla: {plantillaFamily}
                        </p>
                        <p className="text-gray-600">
                          Modelo: {modeloSeleccionado}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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