// =====================================
// SPEED BUILDER V3 - PREVIEW MODAL
// =====================================

import React, { useState, useRef } from 'react';
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
import { BuilderTemplateRenderer } from '../../posters/components/Posters/Editor/Renderers/BuilderTemplateRenderer';
import { defaultMockData, processDynamicContent } from '@/utils/dynamicContentProcessor';

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
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 🚀 OBTENER PRODUCTO MOCK (CORREGIDO)
  const mockProduct = defaultMockData.producto;

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

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const refreshPreview = () => {
    // Forzar re-render
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
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="flex items-center justify-center min-h-full">
            <div
              ref={canvasRef}
              className="bg-white shadow-lg relative"
              style={{
                width: `${previewDimensions.width}px`,
                height: `${previewDimensions.height}px`,
                transform: `rotate(${rotation}deg)`,
                transition: 'all 0.3s ease'
              }}
            >
              {/* Canvas content */}
              <div 
                className="relative w-full h-full overflow-hidden"
                style={{ 
                  transform: `scale(${previewDimensions.scale})`,
                  transformOrigin: 'top left',
                  width: `${template.canvas.width}px`,
                  height: `${template.canvas.height}px`,
                  backgroundColor: template.canvas.backgroundColor || '#ffffff'
                }}
              >
                {state.components.map(component => {
                  const dynamicContent = processDynamicContent(component, defaultMockData);
                  const componentStyle: React.CSSProperties = {
                    position: 'absolute',
                    left: component.position.x,
                    top: component.position.y,
                    width: component.size.width,
                    height: component.size.height,
                    transform: `rotate(${component.position.rotation || 0}deg)`,
                    opacity: component.style?.effects?.opacity ?? 1,
                    backgroundColor: component.style?.color?.backgroundColor || 'transparent',
                    border: component.style?.border && component.style.border.width > 0
                      ? `${component.style.border.width}px ${component.style.border.style || 'solid'} ${component.style.border.color || '#000000'}`
                      : 'none',
                    borderRadius: component.style?.border?.radius ? `${component.style.border.radius.topLeft}px` : undefined,
                    color: component.style?.color?.color,
                    fontFamily: component.style?.typography?.fontFamily,
                    fontSize: component.style?.typography?.fontSize,
                    fontWeight: component.style?.typography?.fontWeight,
                    textAlign: component.style?.typography?.textAlign as any,
                    boxSizing: 'border-box'
                  };

                  if (component.type.startsWith('image-')) {
                    return (
                      <div key={component.id} style={componentStyle}>
                         <img 
                            src={component.content.imageUrl} 
                            alt={component.content.imageAlt} 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                      </div>
                    )
                  }
                  
                  return (
                    <div key={component.id} style={componentStyle} className="flex items-center justify-center p-1">
                      {dynamicContent}
                    </div>
                  )
                })}
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
      </div>
    </div>
  );
}; 