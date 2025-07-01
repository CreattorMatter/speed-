// =====================================
// SPEED BUILDER V3 - PREVIEW MODAL
// =====================================

import React, { useState, useRef, useCallback } from 'react';
import { 
  X, 
  Eye, 
  Smartphone, 
  Monitor, 
  Printer, 
  Download, 
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { BuilderStateV3, DraggableComponentV3, TemplateV3 } from '../types';
import { processDynamicContent, MockDataV3 } from '../../../utils/dynamicContentProcessor';

interface PreviewModalV3Props {
  isOpen: boolean;
  onClose: () => void;
  state: BuilderStateV3;
  template: TemplateV3;
}

type PreviewMode = 'desktop' | 'mobile' | 'print' | 'fullscreen';
type DataMode = 'mock' | 'real' | 'empty';



export const PreviewModalV3: React.FC<PreviewModalV3Props> = ({
  isOpen,
  onClose,
  state,
  template
}) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [dataMode, setDataMode] = useState<DataMode>('mock');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // =====================
  // MOCK DATA
  // =====================
  
  const mockData: MockDataV3 = {
    // Datos de producto
    product_name: 'Taladro Percutor Profesional 20V',
    product_price: 159990,
    price_without_tax: 134447,
    product_sku: 'TAL-20V-001',
    product_brand: 'MAKITA',
    product_category: 'Herramientas',
    product_origin: 'Japón',
    product_description: 'Taladro percutor inalámbrico con batería de litio de 20V y estuche incluido',
    
    // Datos de promoción
    price_now: 119990,
    discount_percentage: 25,
    discount_amount: 40000,
    date_from: '15/12/2024',
    date_to: '31/12/2024',
    promotion_name: 'Oferta Especial Navidad',
    
    // Datos calculados
    final_price: 119990,
    
    // Datos de tienda
    store_name: 'Tienda Central',
    store_address: 'Av. Principal 123, Santiago'
  };

  // =====================
  // UTILITY FUNCTIONS (Usando procesador unificado)
  // =====================

  const renderComponentContent = (component: DraggableComponentV3): React.ReactNode => {
    const content = component.content as any;
    
    // =====================
    // PROCESAMIENTO CON EL PROCESADOR UNIFICADO
    // =====================
    
    // Verificar si es un campo de texto o dinámico
    const componentType = component.type as string;
    const isTextField = componentType === 'text' || componentType.startsWith('field-') || componentType === 'field-dynamic-text' || componentType === 'field-dynamic-date';
    
    if (isTextField) {
      let textContent = '';
      
      if (dataMode === 'mock') {
        // Usar el procesador dinámico unificado
        textContent = processDynamicContent(component, mockData);
      } else if (dataMode === 'real') {
        // En modo real, mostrar datos reales (si están disponibles)
        textContent = content?.staticValue || 'Datos reales no disponibles';
      } else {
        // En modo vacío, mostrar placeholder
        textContent = content?.staticValue || `[${component.type}]`;
      }
      
      return (
        <div
          className="preview-text"
          style={{
            // Tipografía desde component.style.typography
            fontFamily: component.style?.typography?.fontFamily || 'Arial',
            fontSize: `${component.style?.typography?.fontSize || 16}px`,
            fontWeight: component.style?.typography?.fontWeight || 'normal',
            fontStyle: component.style?.typography?.fontStyle || 'normal',
            textAlign: component.style?.typography?.textAlign || 'left',
            lineHeight: component.style?.typography?.lineHeight || 1.2,
            
            // Colores desde component.style.color
            color: component.style?.color?.color || '#000000',
            backgroundColor: component.style?.color?.backgroundColor || 'transparent',
            
            // Bordes desde component.style.border
            borderRadius: component.style?.border?.radius?.topLeft ? 
              `${component.style.border.radius.topLeft}px` : '0px',
            border: component.style?.border ? 
              `${component.style.border.width}px ${component.style.border.style || 'solid'} ${component.style.border.color}` : 
              'none',
            
            // Efectos desde component.style.effects
            opacity: component.style?.effects?.opacity ?? 1,
            
            // Transform desde component.position
            transform: `rotate(${component.position.rotation || 0}deg) scale(${component.position.scaleX || 1}, ${component.position.scaleY || 1})`,
            
            // Fallbacks desde content (para compatibilidad)
            ...(content?.padding && { padding: content.padding }),
            ...(content?.textShadow && { textShadow: content.textShadow })
          }}
        >
          {textContent || 'Texto'}
        </div>
      );
    }
    
    // Resto de componentes (imágenes, QR, etc.)
    switch (component.type) {
      
      case 'image-header':
      case 'image-brand-logo':
      case 'image-product':
      case 'image-decorative':
        return (
          <img
            src={content?.imageUrl || '/api/placeholder/400/300'}
            alt={content?.imageAlt || 'Imagen'}
            className="w-full h-full object-cover"
            style={{
              objectFit: content?.imageFit || 'cover',
              borderRadius: content?.borderRadius || '0px',
              border: content?.border || 'none',
              opacity: content?.opacity || 1
            }}
          />
        );
      
      case 'qr-dynamic':
        return (
          <div className="w-full h-full bg-white flex items-center justify-center border">
            <div className="w-24 h-24 bg-black" style={{
              backgroundImage: `url("data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect width="10" height="10" x="0" y="0" fill="black"/><rect width="10" height="10" x="20" y="0" fill="black"/><rect width="10" height="10" x="40" y="0" fill="black"/></svg>')}")`
            }} />
          </div>
        );
      
      default:
        return (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            {component.type}
          </div>
        );
    }
  };

  // =====================
  // PREVIEW MODES
  // =====================

  const getPreviewDimensions = () => {
    const templateWidth = template.canvas.width;
    const templateHeight = template.canvas.height;
    
    switch (previewMode) {
      case 'mobile':
        return {
          width: Math.min(360, templateWidth * 0.8),
          height: templateHeight * 0.8,
          scale: 0.8
        };
      case 'print':
        // Simular 300 DPI
        const dpiScale = 300 / 96; // De DPI de pantalla a DPI de impresión
        return {
          width: templateWidth,
          height: templateHeight,
          scale: 1,
          className: 'print-preview'
        };
      case 'fullscreen':
        return {
          width: templateWidth * 1.5,
          height: templateHeight * 1.5,
          scale: 1.5
        };
      default: // desktop
        return {
          width: templateWidth,
          height: templateHeight,
          scale: 1
        };
    }
  };

  const previewDimensions = getPreviewDimensions();

  // =====================
  // ACTIONS
  // =====================

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleExport = async () => {
    // Simular exportación
    alert('Funcionalidad de exportación - En desarrollo');
  };

  const handleShare = async () => {
    // Simular compartir
    alert('Funcionalidad de compartir - En desarrollo');
  };

  const refreshPreview = () => {
    // Forzar re-render
    setZoom(100);
    setRotation(0);
  };

  // =====================
  // VALIDATION
  // =====================

  const validateDesign = () => {
    const issues: string[] = [];
    
    // Verificar componentes fuera del canvas
    state.components.forEach(component => {
      if (component.position.x < 0 || component.position.y < 0) {
        issues.push(`Componente "${component.name || component.type}" está fuera del área visible`);
      }
      if (component.position.x + component.size.width > template.canvas.width) {
        issues.push(`Componente "${component.name || component.type}" se extiende más allá del ancho del canvas`);
      }
      if (component.position.y + component.size.height > template.canvas.height) {
        issues.push(`Componente "${component.name || component.type}" se extiende más allá del alto del canvas`);
      }
    });

    // Verificar campos dinámicos
    state.components.forEach(component => {
      const content = component.content as any;
      if (content?.dynamicTemplate && dataMode === 'empty') {
        issues.push(`Componente "${component.name || component.type}" contiene campos dinámicos sin datos`);
      }
    });

    return issues;
  };

  const validationIssues = validateDesign();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Vista Previa</h2>
              <p className="text-sm text-gray-500">{template.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Validation status */}
            {validationIssues.length === 0 ? (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Sin problemas</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{validationIssues.length} problema(s)</span>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          {/* Preview Mode */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Modo:</span>
            {[
              { mode: 'desktop', icon: Monitor, label: 'Desktop' },
              { mode: 'mobile', icon: Smartphone, label: 'Mobile' },
              { mode: 'print', icon: Printer, label: 'Impresión' },
              { mode: 'fullscreen', icon: Maximize2, label: 'Pantalla completa' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode as PreviewMode)}
                className={`flex items-center space-x-1 px-3 py-1 rounded ${
                  previewMode === mode 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Data Mode */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Datos:</span>
            {[
              { mode: 'mock', label: 'Mock' },
              { mode: 'real', label: 'Reales' },
              { mode: 'empty', label: 'Vacío' }
            ].map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => setDataMode(mode as DataMode)}
                className={`px-3 py-1 text-sm rounded ${
                  dataMode === mode 
                    ? 'bg-green-100 text-green-800' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tools */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {Math.round(zoom)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <button
              onClick={handleRotate}
              className="p-2 hover:bg-gray-100 rounded"
              title="Rotar"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={refreshPreview}
              className="p-2 hover:bg-gray-100 rounded"
              title="Refrescar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded"
              title="Exportar"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded"
              title="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="flex items-center justify-center min-h-full">
            <div
              ref={canvasRef}
              className="bg-white shadow-lg relative"
              style={{
                width: `${previewDimensions.width * (zoom / 100)}px`,
                height: `${previewDimensions.height * (zoom / 100)}px`,
                transform: `rotate(${rotation}deg)`,
                transition: 'all 0.3s ease'
              }}
            >
              {/* Grid overlay */}
              {showGrid && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                />
              )}

              {/* Canvas content */}
              <div 
                className="relative w-full h-full overflow-hidden"
                style={{ 
                  backgroundColor: template.canvas.backgroundColor || '#ffffff'
                }}
              >
                {/* Components */}
                {state.components
                  .filter(component => component.isVisible !== false)
                  .map(component => (
                    <div
                      key={component.id}
                      className="absolute"
                      style={{
                        left: `${component.position.x}px`,
                        top: `${component.position.y}px`,
                        width: `${component.size.width}px`,
                        height: `${component.size.height}px`,
                        transform: component.position.rotation ? `rotate(${component.position.rotation}deg)` : undefined,
                        opacity: component.isLocked ? 0.7 : 1,
                        zIndex: component.position.z || 1
                      }}
                    >
                      {renderComponentContent(component)}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>

        {/* Footer with validation issues */}
        {validationIssues.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-orange-50">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-orange-800 mb-1">
                  Problemas detectados:
                </h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  {validationIssues.slice(0, 3).map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                  {validationIssues.length > 3 && (
                    <li className="text-orange-600">
                      ... y {validationIssues.length - 3} problema(s) más
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Data preview (when using mock data) */}
        {dataMode === 'mock' && (
          <div className="p-4 border-t border-gray-200 bg-blue-50">
            <details className="group">
              <summary className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-blue-800">
                <span>Datos Mock utilizados</span>
                <span className="group-open:rotate-90 transition-transform">▶</span>
              </summary>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {Object.entries(mockData).map(([key, value]) => (
                  <div key={key} className="bg-white p-2 rounded border">
                    <div className="font-medium text-gray-700">[{key}]</div>
                    <div className="text-gray-600 truncate">{value.toString()}</div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}; 