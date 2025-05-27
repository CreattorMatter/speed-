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

    // Si hay múltiples productos y alguno está expandido, necesitamos volver al grid
    const isInExpandedView = document.querySelector('[data-preview-content]')?.querySelector('.w-80.bg-gray-50.border-r') !== null;
    
    // Detección adicional: verificar si hay texto "Producto X de Y" que indica vista expandida
    const hasExpandedText = document.querySelector('[data-preview-content]')?.textContent?.includes('de ' + selectedProducts.length) || false;
    const isReallyExpanded = isInExpandedView || hasExpandedText;
    
    console.log('PrintButton - handlePrintDirectly:', {
      selectedProductsCount: selectedProducts.length,
      isInExpandedView,
      hasExpandedText,
      isReallyExpanded,
      hasEditedProducts: editedProducts.length > 0
    });

    // Función para capturar el contenido
    const captureContent = () => {
      const previewElement = document.querySelector('[data-preview-content]');
      let contentToPrint = '';
      
      console.log('PrintButton - captureContent iniciado:', {
        previewElementFound: !!previewElement,
        selectedProductsCount: selectedProducts.length
      });
      
      if (previewElement) {
        if (selectedProducts.length > 1) {
          // Para múltiples productos, buscar todos los elementos de cartel dentro del preview
          const allCartelElements = previewElement.querySelectorAll('[data-cartel-content]');
          
          console.log('PrintButton - Múltiples productos detectados:', {
            productCount: selectedProducts.length,
            cartelElementsFound: allCartelElements.length,
            previewElement: !!previewElement,
            previewElementHTML: previewElement.innerHTML.substring(0, 200) + '...'
          });
          
          // Debug adicional: mostrar todos los elementos encontrados
          console.log('PrintButton - Elementos data-cartel-content encontrados:', 
            Array.from(allCartelElements).map((el, i) => ({
              index: i,
              tagName: el.tagName,
              className: el.className,
              hasContent: el.innerHTML.length > 0
            }))
          );
          
          if (allCartelElements.length > 0) {
            // Asegurar que tenemos un elemento por cada producto
            if (allCartelElements.length < selectedProducts.length) {
              console.warn('PrintButton - Advertencia: Menos elementos de cartel que productos seleccionados');
              console.log('PrintButton - Intentando método alternativo de captura');
              
              // Método alternativo: generar contenido para cada producto
              contentToPrint = selectedProducts.map((product, index) => {
                const productName = product?.name || `Producto ${index + 1}`;
                const cartelElement = allCartelElements[index];
                
                if (cartelElement) {
                  return `<div class="cartel-page">
                    <div class="cartel-wrapper">
                      <div class="cartel-content">
                        ${cartelElement.outerHTML}
                      </div>
                    </div>
                  </div>`;
                } else {
                  // Si no hay elemento específico, crear un placeholder
                  return `<div class="cartel-page">
                    <div class="cartel-wrapper">
                      <div class="cartel-placeholder">
                        <p>Producto: ${productName}</p>
                        <p>SKU: ${product?.sku || 'N/A'}</p>
                        <p>Precio: $${product?.price || '0'}</p>
                        <p>Nota: Contenido no disponible para impresión</p>
                      </div>
                    </div>
                  </div>`;
                }
              }).join('');
            } else {
              // Método normal cuando hay suficientes elementos
              contentToPrint = Array.from(allCartelElements)
                .map((element, index) => {
                  // Obtener todo el contenido del elemento cartel incluyendo estilos y atributos
                  const cartelContent = element.outerHTML; // Usar outerHTML para incluir el elemento completo
                  const productName = selectedProducts[index]?.name || `Producto ${index + 1}`;
                  
                  return `<div class="cartel-page">
                    <div class="cartel-wrapper">
                      <div class="cartel-content">
                        ${cartelContent}
                      </div>
                    </div>
                  </div>`;
                })
                .join('');
            }
          } else {
            // Si no hay elementos específicos, intentar buscar elementos de plantilla directamente
            console.log('PrintButton - No se encontraron elementos [data-cartel-content], buscando plantillas directamente');
            
            // Buscar todos los componentes de plantilla en el DOM
            const templateElements = previewElement.querySelectorAll('[class*="font-sans"], [class*="bg-white"], .cartel-wrapper > div');
            
            if (templateElements.length >= selectedProducts.length) {
              // Si encontramos suficientes elementos de plantilla
              contentToPrint = Array.from(templateElements)
                .slice(0, selectedProducts.length) // Tomar solo los necesarios
                .map((element, index) => {
                  const productName = selectedProducts[index]?.name || `Producto ${index + 1}`;
                  
                  return `<div class="cartel-page">
                    <div class="cartel-wrapper">
                      <div class="cartel-content" style="transform: scale(1); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                        ${element.outerHTML}
                      </div>
                    </div>
                  </div>`;
                })
                .join('');
            } else {
              // Último recurso: generar placeholders para todos los productos
              console.warn('PrintButton - No se encontraron suficientes elementos, generando placeholders');
              contentToPrint = selectedProducts.map((product, index) => {
                const productName = product?.name || `Producto ${index + 1}`;
                
                return `<div class="cartel-page">
                  <div class="cartel-wrapper">
                    <div class="cartel-placeholder">
                      <p>Producto: ${productName}</p>
                      <p>SKU: ${product?.sku || 'N/A'}</p>
                      <p>Precio: $${product?.price || '0'}</p>
                      <p>Nota: Contenido no disponible para impresión</p>
                    </div>
                  </div>
                </div>`;
              }).join('');
            }
          }
        } else {
          // Para un solo producto, usar el contenido completo
          const productName = selectedProducts[0]?.name || 'Producto';
          const singleElement = previewElement.querySelector('[data-cartel-content]') || previewElement;
          contentToPrint = `<div class="cartel-page">
            <div class="cartel-wrapper">
              <div class="cartel-content">
                ${singleElement.outerHTML}
              </div>
            </div>
          </div>`;
        }
      } else {
        // Fallback: buscar el componente de plantilla directamente
        console.warn('PrintButton - No se encontró [data-preview-content], usando fallback');
        const templateElement = document.querySelector('[class*="font-sans"]');
        contentToPrint = templateElement ? 
          `<div class="cartel-page">
            <div class="cartel-wrapper">
              ${templateElement.outerHTML}
            </div>
          </div>` : 
          '<div class="cartel-page"><p>Error: No se pudo obtener el contenido para imprimir</p></div>';
      }

      return contentToPrint;
    };

    // Si estamos en vista expandida con múltiples productos, necesitamos volver al grid primero
    if (selectedProducts.length > 1 && isReallyExpanded) {
      console.log('PrintButton - Detectada vista expandida, volviendo al grid para capturar todos los productos');
      
      // Buscar el botón "Volver al preview" de manera más robusta
      const allButtons = Array.from(document.querySelectorAll('button'));
      const backButton = allButtons.find(button => {
        const text = button.textContent?.toLowerCase() || '';
        return text.includes('volver') && (text.includes('preview') || text.includes('al preview'));
      });
      
      if (backButton) {
        console.log('PrintButton - Haciendo click en botón volver');
        backButton.click();
        
        // Esperar más tiempo para que se actualice la vista y luego capturar
        setTimeout(() => {
          console.log('PrintButton - Reintentando captura después de volver al grid');
          const contentToPrint = captureContent();
          generatePrintWindow(printWindow, contentToPrint);
        }, 1000); // Aumentar tiempo de espera
        return;
      } else {
        console.warn('PrintButton - No se encontró el botón volver, continuando con captura directa');
      }
    }

    // Capturar contenido directamente
    const contentToPrint = captureContent();
    generatePrintWindow(printWindow, contentToPrint);
  };

  const generatePrintWindow = (printWindow: Window, contentToPrint: string) => {
    // Obtener todos los estilos CSS de la página actual de manera más completa
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

    // Obtener también todos los elementos <style> del documento
    const inlineStyles = Array.from(document.querySelectorAll('style'))
      .map(style => style.innerHTML)
      .join('\n');

    // Obtener estilos de Tailwind específicamente
    const tailwindStyles = Array.from(document.querySelectorAll('link[href*="tailwind"], link[href*="index"]'))
      .map(link => `@import url("${(link as HTMLLinkElement).href}");`)
      .join('\n');

    console.log('PrintButton - Estilos capturados:', {
      allStylesLength: allStyles.length,
      inlineStylesLength: inlineStyles.length,
      tailwindStylesLength: tailwindStyles.length
    });

    // HTML para la impresión con todos los estilos y tamaño de papel correcto
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Impresión de Cartel${selectedProducts.length > 1 ? 'es' : ''} - ${plantillaFamily} - ${paperSize.label}</title>
        
        <!-- Importar Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        
        <style>
          /* Reset básico */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          /* Estilos de Tailwind y la aplicación */
          ${tailwindStyles}
          ${allStyles}
          ${inlineStyles}
          
          /* Estilos específicos para impresión */
          body { 
            font-family: Arial, sans-serif; 
            background: white !important;
            padding: 0;
            margin: 0;
            overflow: hidden;
          }
          
          .print-container {
            width: 100%;
            height: 100%;
            background: white;
          }
          
          .cartel-content {
            transform-origin: center;
            max-width: none;
            max-height: none;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .cartel-page {
            page-break-after: always;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            width: 100%;
            position: relative;
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
          
          .cartel-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100vh;
            position: relative;
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
          
          /* Preservar estilos de Tailwind específicos para carteles */
          .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif; }
          .font-bold { font-weight: 700; }
          .text-white { color: rgb(255 255 255); }
          .text-black { color: rgb(0 0 0); }
          .text-gray-600 { color: rgb(75 85 99); }
          .text-blue-600 { color: rgb(37 99 235); }
          .bg-white { background-color: rgb(255 255 255); }
          .bg-gray-100 { background-color: rgb(243 244 246); }
          .bg-blue-500 { background-color: rgb(59 130 246); }
          .rounded { border-radius: 0.25rem; }
          .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
          .p-4 { padding: 1rem; }
          .p-6 { padding: 1.5rem; }
          .m-4 { margin: 1rem; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .text-center { text-align: center; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
          .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
          .text-5xl { font-size: 3rem; line-height: 1; }
          .text-6xl { font-size: 3.75rem; line-height: 1; }
          .text-8xl { font-size: 6rem; line-height: 1; }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${contentToPrint}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            }, 1500); // Más tiempo para cargar Tailwind
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
      
      // Proceder con la impresión ANTES de limpiar cambios
      navigateToPrintView();
      
      // Limpiar cambios después de la impresión
      setTimeout(() => {
        clearChanges();
      }, 1000); // Dar tiempo para que se abra la ventana de impresión
      
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