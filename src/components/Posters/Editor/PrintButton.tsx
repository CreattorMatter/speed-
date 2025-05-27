import React, { useState } from 'react';
import { Printer, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
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
  // Nuevas props necesarias para generar contenido
  templateComponents?: Record<string, React.ComponentType<any>>;
  PLANTILLA_MODELOS?: Record<string, any[]>;
  modeloSeleccionado?: string | null;
  selectedFinancing?: any[];
  getCurrentProductValue?: (product: any, field: string) => any;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  plantillaFamily,
  plantillaType,
  selectedProducts,
  formatoSeleccionado,
  onPrint,
  disabled = false,
  // Nuevas props necesarias para generar contenido
  templateComponents,
  PLANTILLA_MODELOS,
  modeloSeleccionado,
  selectedFinancing,
  getCurrentProductValue
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

    console.log('PrintButton - Generando contenido para impresión:', {
      selectedProductsCount: selectedProducts.length,
      hasTemplateComponents: !!templateComponents,
      hasModelos: !!PLANTILLA_MODELOS,
      plantillaFamily,
      modeloSeleccionado
    });

    // Generar HTML para cada producto usando los componentes de plantilla
    const contentToPrint = selectedProducts
      .map((product, index) => generateProductHTML(product, index))
      .join('');

    console.log('PrintButton - Contenido generado:', {
      contentLength: contentToPrint.length,
      productCount: selectedProducts.length
    });

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

  // Función para generar props de plantilla (similar a PreviewArea)
  const generateTemplateProps = (product: any) => {
    const baseProps = {
      small: false,
      financiacion: selectedFinancing || [],
      productos: [product],
      titulo: "Ofertas Especiales"
    };

    // Generar props dinámicos basados en los valores actuales del producto
    const templateProps: Record<string, any> = {
      // Mapeo directo de campos
      nombre: getCurrentProductValue ? getCurrentProductValue(product, 'nombre') : product.name,
      precioActual: getCurrentProductValue ? getCurrentProductValue(product, 'precioActual')?.toString() : product.price?.toString(),
      porcentaje: getCurrentProductValue ? getCurrentProductValue(product, 'porcentaje')?.toString() : '20',
      sap: getCurrentProductValue ? getCurrentProductValue(product, 'sap')?.toString() : product.sku,
      fechasDesde: getCurrentProductValue ? getCurrentProductValue(product, 'fechasDesde')?.toString() : '15/05/2025',
      fechasHasta: getCurrentProductValue ? getCurrentProductValue(product, 'fechasHasta')?.toString() : '18/05/2025',
      origen: getCurrentProductValue ? getCurrentProductValue(product, 'origen')?.toString() : 'ARG',
      precioSinImpuestos: getCurrentProductValue ? getCurrentProductValue(product, 'precioSinImpuestos')?.toString() : (product.price * 0.83).toFixed(2)
    };

    return { 
      ...baseProps, 
      ...templateProps 
    };
  };

  // Función para generar HTML de cada producto usando los componentes de plantilla
  const generateProductHTML = (product: any, index: number): string => {
    console.log(`PrintButton - Generando HTML para producto ${index + 1}:`, {
      productName: product.name,
      productId: product.id,
      hasTemplateComponents: !!templateComponents,
      hasModelos: !!PLANTILLA_MODELOS,
      modeloSeleccionado
    });

    if (!templateComponents || !PLANTILLA_MODELOS) {
      console.warn('PrintButton - No hay componentes de plantilla disponibles');
      return `<div class="cartel-page">
        <div class="cartel-wrapper">
          <div class="cartel-placeholder">
            <p>Producto: ${product.name}</p>
            <p>SKU: ${product.sku || 'N/A'}</p>
            <p>Precio: $${product.price || '0'}</p>
            <p>Nota: Componentes de plantilla no disponibles</p>
          </div>
        </div>
      </div>`;
    }

    // Obtener el modelo seleccionado o el primero disponible
    const modelos = PLANTILLA_MODELOS[plantillaFamily] || [];
    const modelo = modeloSeleccionado 
      ? modelos.find((m: any) => m.id === modeloSeleccionado)
      : modelos[0];

    if (!modelo) {
      console.warn('PrintButton - No se encontró modelo de plantilla');
      return `<div class="cartel-page">
        <div class="cartel-wrapper">
          <div class="cartel-placeholder">
            <p>Producto: ${product.name}</p>
            <p>SKU: ${product.sku || 'N/A'}</p>
            <p>Precio: $${product.price || '0'}</p>
            <p>Nota: Modelo de plantilla no encontrado</p>
          </div>
        </div>
      </div>`;
    }

    const Component = templateComponents[modelo.componentPath];
    
    if (!Component) {
      console.warn('PrintButton - Componente de plantilla no encontrado:', modelo.componentPath);
      return `<div class="cartel-page">
        <div class="cartel-wrapper">
          <div class="cartel-placeholder">
            <p>Producto: ${product.name}</p>
            <p>SKU: ${product.sku || 'N/A'}</p>
            <p>Precio: $${product.price || '0'}</p>
            <p>Nota: Componente no encontrado</p>
          </div>
        </div>
      </div>`;
    }

    try {
      // Generar props para este producto específico
      const templateProps = generateTemplateProps(product);
      
      console.log(`PrintButton - Props generadas para ${product.name}:`, templateProps);
      
      // Renderizar el componente a HTML
      const componentHTML = renderToString(
        React.createElement(Component, {
          ...templateProps,
          key: `${product.id}-print`
        })
      );

      return `<div class="cartel-page">
        <div class="cartel-wrapper">
          <div class="cartel-content">
            ${componentHTML}
          </div>
        </div>
      </div>`;
    } catch (error) {
      console.error('PrintButton - Error al renderizar componente:', error);
      return `<div class="cartel-page">
        <div class="cartel-wrapper">
          <div class="cartel-placeholder">
            <p>Producto: ${product.name}</p>
            <p>SKU: ${product.sku || 'N/A'}</p>
            <p>Precio: $${product.price || '0'}</p>
            <p>Nota: Error al renderizar plantilla</p>
          </div>
        </div>
      </div>`;
    }
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