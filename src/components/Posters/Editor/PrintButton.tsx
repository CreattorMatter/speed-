import React, { useState } from 'react';
import { Printer, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductChanges } from '../../../hooks/useProductChanges';
import { ReportModal } from './ReportModal';
import { EmailService } from '../../../services/emailService';

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
  formatoSeleccionado?: PaperFormatOption | null; // Agregar formato de papel
  onPrint?: () => void; // Opcional ahora
  disabled?: boolean;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  plantillaFamily,
  plantillaType,
  selectedProducts,
  formatoSeleccionado,
  onPrint,
  disabled = false
}) => {
  const navigate = useNavigate();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    trackChange,
    getEditedProduct,
    hasChanges,
    getAllEditedProducts,
    clearChanges,
    removeProductChanges
  } = useProductChanges();

  // Verificar si hay cambios en los productos seleccionados - MEJORADO
  const hasAnyChanges = selectedProducts.some(product => {
    const editedProduct = getEditedProduct(product.id);
    const hasProductChanges = editedProduct !== null && editedProduct.changes.length > 0;
    console.log(`Producto ${product.id} (${product.name}):`, {
      editedProduct: !!editedProduct,
      changesCount: editedProduct?.changes.length || 0,
      hasProductChanges
    });
    return hasProductChanges;
  });
  
  // Obtener productos editados
  const editedProducts = selectedProducts
    .map(product => getEditedProduct(product.id))
    .filter((ep): ep is NonNullable<typeof ep> => ep !== null && ep.changes.length > 0);

  // Debug mejorado para verificar detección de cambios
  console.log('PrintButton - Debug detallado:', {
    selectedProductsCount: selectedProducts.length,
    selectedProductsIds: selectedProducts.map(p => p.id),
    hasAnyChanges,
    editedProductsCount: editedProducts.length,
    editedProductsDetails: editedProducts.map(ep => ({
      id: ep.id,
      name: ep.name,
      changesCount: ep.changes.length,
      changes: ep.changes.map(c => `${c.field}: ${c.originalValue} → ${c.newValue}`)
    })),
    allEditedProductsInHook: getAllEditedProducts().map(ep => ({
      id: ep.id,
      name: ep.name,
      changesCount: ep.changes.length
    }))
  });

  // Determinar el tamaño de papel para la impresión
  const paperSize = formatoSeleccionado || { 
    value: 'A4', 
    label: 'A4 (210 × 297 mm)', 
    width: '210mm', 
    height: '297mm' 
  };

  // Debug logging para formato de papel
  console.log('PrintButton - Formato de papel:', {
    formatoSeleccionado,
    paperSize,
    isFormatoSeleccionadoNull: formatoSeleccionado === null,
    isFormatoSeleccionadoUndefined: formatoSeleccionado === undefined
  });

  const handlePrintDirectly = () => {
    // Crear una nueva ventana para imprimir
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('No se pudo abrir la ventana de impresión. Verifica que no esté bloqueada por el navegador.');
      return;
    }

    // Obtener el contenido actual del preview area
    const previewElement = document.querySelector('[data-preview-content]');
    let contentToPrint = '';
    
    if (previewElement) {
      if (selectedProducts.length > 1) {
        // Para múltiples productos, buscar todos los elementos de cartel dentro del preview
        const allCartelElements = previewElement.querySelectorAll('[data-cartel-content]');
        
        console.log('PrintButton - Múltiples productos detectados:', {
          productCount: selectedProducts.length,
          cartelElementsFound: allCartelElements.length,
          previewElement: !!previewElement
        });
        
        if (allCartelElements.length > 0) {
          contentToPrint = Array.from(allCartelElements)
            .map((element, index) => {
              // Obtener todo el contenido del elemento cartel
              const cartelContent = element.innerHTML;
              
              return `<div class="cartel-page">
                <div class="cartel-header">Cartel ${index + 1} de ${allCartelElements.length}</div>
                <div class="cartel-wrapper">
                  ${cartelContent}
                </div>
              </div>`;
            })
            .join('');
        } else {
          // Si no hay elementos específicos, usar todo el contenido del preview
          contentToPrint = `<div class="cartel-page">
            <div class="cartel-wrapper">
              ${previewElement.innerHTML}
            </div>
          </div>`;
        }
      } else {
        // Para un solo producto, usar el contenido completo
        contentToPrint = previewElement.innerHTML;
      }
    } else {
      // Fallback: buscar el componente de plantilla directamente
      const templateElement = document.querySelector('[class*="font-sans"]');
      contentToPrint = templateElement ? templateElement.outerHTML : '<p>Error: No se pudo obtener el contenido para imprimir</p>';
    }

    // Obtener todos los estilos CSS de la página actual
    const allStyles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          console.warn('No se pudo acceder a las reglas CSS:', e);
          return '';
        }
      })
      .join('\n');

    // HTML para la impresión con todos los estilos y tamaño de papel correcto
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Impresión de Cartel${selectedProducts.length > 1 ? 'es' : ''} - ${plantillaFamily} - ${paperSize.label}</title>
        <style>
          /* Reset básico */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          /* Estilos de la aplicación */
          ${allStyles}
          
          /* Estilos específicos para impresión */
          body { 
            font-family: Arial, sans-serif; 
            background: white !important;
            padding: 0;
            margin: 0;
            overflow: hidden;
          }
          
          .print-container {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            flex-direction: column;
            gap: 20px;
          }
          
          .cartel-content {
            transform-origin: center;
            max-width: none;
            max-height: none;
          }
          
          .cartel-page {
            page-break-after: always;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            width: 100%;
          }
          
          .cartel-page:last-child {
            page-break-after: avoid;
          }
          
          .cartel-placeholder {
            text-align: center;
            padding: 40px;
            border: 2px dashed #ccc;
            background: #f9f9f9;
          }
          
          .cartel-header {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            padding: 5px;
            background: #f0f0f0;
            border-radius: 4px;
          }
          
          .cartel-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            width: 100%;
            height: calc(100vh - 60px);
          }
          
          @media print {
            body { 
              padding: 0; 
              margin: 0; 
              background: white !important;
            }
            .print-container {
              width: 100%;
              height: 100%;
              page-break-inside: avoid;
            }
            .cartel-page {
              page-break-after: always;
              min-height: 100vh;
            }
            .cartel-page:last-child {
              page-break-after: avoid;
            }
            @page { 
              margin: 1cm; 
              size: ${paperSize.width} ${paperSize.height};
            }
          }
          
          /* Asegurar que los colores se impriman */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${selectedProducts.length > 1 ? contentToPrint : `<div class="cartel-content">${contentToPrint}</div>`}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            }, 1000); // Más tiempo para cargar estilos
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
  };

  const navigateToPrintView = () => {
    // Usar impresión directa en lugar de navegar
    handlePrintDirectly();
  };

  const handlePrintClick = () => {
    console.log('PrintButton - handlePrintClick ejecutado:', {
      hasAnyChanges,
      editedProductsCount: editedProducts.length
    });
    
    if (hasAnyChanges) {
      // Si hay cambios, abrir modal de reporte
      console.log('PrintButton - Abriendo modal de reporte');
      setReportModalOpen(true);
    } else {
      // Si no hay cambios, ir directo a impresión
      console.log('PrintButton - Imprimiendo directamente');
      if (onPrint) {
        onPrint();
      }
      navigateToPrintView();
    }
  };

  const handleSendReport = async (reason: string) => {
    setIsProcessing(true);
    
    try {
      // Enviar reporte por email
      await EmailService.sendChangeReport({
        plantillaFamily,
        plantillaType,
        editedProducts,
        reason,
        userEmail: 'usuario@empresa.com', // TODO: Obtener del contexto de auth
        userName: 'Usuario Actual', // TODO: Obtener del contexto de auth
        timestamp: new Date()
      });
      
      // Limpiar cambios después del reporte
      clearChanges();
      
      // Proceder con la impresión
      navigateToPrintView();
      
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      alert('Error al enviar el reporte. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
      setReportModalOpen(false);
    }
  };

  const handleCancelReport = () => {
    setReportModalOpen(false);
  };

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Printer className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {hasAnyChanges ? 'Reportar e Imprimir' : 'Imprimir Carteles'}
              </h3>
              <p className="text-sm text-gray-600">
                {hasAnyChanges 
                  ? `${editedProducts.length} producto${editedProducts.length !== 1 ? 's' : ''} modificado${editedProducts.length !== 1 ? 's' : ''} - Se requiere reporte`
                  : `${selectedProducts.length} cartel${selectedProducts.length !== 1 ? 'es' : ''} listo${selectedProducts.length !== 1 ? 's' : ''} para imprimir`
                }
              </p>
              {/* Mostrar información del tamaño de papel */}
              <p className="text-xs text-blue-600 mt-1">
                Formato: {paperSize.label}
              </p>
            </div>
          </div>

          {hasAnyChanges && (
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Cambios detectados</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handlePrintClick}
            disabled={disabled || isProcessing}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              hasAnyChanges
                ? 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500'
                : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'
            } ${
              disabled || isProcessing 
                ? 'opacity-50 cursor-not-allowed' 
                : 'shadow-md hover:shadow-lg'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Printer className="w-5 h-5" />
                <span>
                  {hasAnyChanges ? 'Reportar e Imprimir' : 'Imprimir'}
                </span>
              </>
            )}
          </button>

          {hasAnyChanges && !isProcessing && (
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas descartar todos los cambios?')) {
                  // Limpiar solo los cambios de los productos seleccionados
                  selectedProducts.forEach(product => {
                    if (getEditedProduct(product.id)) {
                      removeProductChanges(product.id);
                    }
                  });
                }
              }}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              title="Descartar cambios"
            >
              Descartar cambios
            </button>
          )}
        </div>

        {hasAnyChanges && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Se detectaron modificaciones</p>
                <p>Los cambios serán reportados al responsable antes de proceder con la impresión.</p>
                {/* Mostrar detalles de cambios para debug */}
                {editedProducts.length > 0 && (
                  <div className="mt-2 text-xs">
                    <p className="font-medium">Cambios detectados:</p>
                    {editedProducts.map(ep => (
                      <div key={ep.id} className="ml-2">
                        • {ep.name}: {ep.changes.length} cambio{ep.changes.length !== 1 ? 's' : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        editedProducts={editedProducts}
        plantillaFamily={plantillaFamily}
        plantillaType={plantillaType}
        onSend={handleSendReport}
        onCancel={handleCancelReport}
      />
    </>
  );
}; 