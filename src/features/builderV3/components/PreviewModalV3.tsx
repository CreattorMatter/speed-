// =====================================
// SPEED BUILDER V3 - PREVIEW MODAL
// =====================================

import React, { useState, useCallback } from 'react';
import { 
  X, 
  RotateCw, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Monitor,
  Eye
} from 'lucide-react';
import { BuilderStateV3, TemplateV3 } from '../types';
import { processDynamicContent, defaultMockData } from '../../../utils/dynamicContentProcessor';
import { ComponentRenderer } from './Canvas/ComponentRenderer';

interface PreviewModalV3Props {
  isOpen: boolean;
  onClose: () => void;
  state: BuilderStateV3;
  template: TemplateV3;
}

type PreviewMode = 'desktop';
type DataMode = 'mock';

export const PreviewModalV3: React.FC<PreviewModalV3Props> = ({
  isOpen,
  onClose,
  state,
  template
}) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [dataMode, setDataMode] = useState<DataMode>('mock');
  const [rotation, setRotation] = useState(0);
  const canvasRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      // This is where you would typically render your canvas content
      // For now, we'll just set the dimensions and rotation
      const templateWidth = template.canvas.width;
      const templateHeight = template.canvas.height;
      node.style.width = `${templateWidth}px`;
      node.style.height = `${templateHeight}px`;
      node.style.transform = `rotate(${rotation}deg)`;
    }
  }, [template.canvas.width, template.canvas.height, rotation]);

  // 🚀 OBTENER PRODUCTO MOCK (COMENTADO TEMPORALMENTE - NO SE USA)
  // const mockProduct = {
  //   id: '1',
  //   name: 'Taladro Inalámbrico Makita 18V',
  //   price: 89990,
  //   originalPrice: 129990,
  //   discount: 31,
  //   description: 'Taladro inalámbrico profesional con batería de litio de 18V',
  //   brand: 'Makita',
  //   sku: 'MAK-TD-18V-001',
  //   category: 'Herramientas',
  //   imageUrl: '/images/products/taladro-makita-18v.jpg',
  //   stock: 25
  // };

  const getPreviewDimensions = () => {
    const templateWidth = template.canvas.width;
    const templateHeight = template.canvas.height;
    
    // Usar las dimensiones reales del viewport disponible
    const availableWidth = window.innerWidth * 0.8; // 80% del ancho de pantalla
    const availableHeight = window.innerHeight * 0.75; // 75% del alto de pantalla
    const maxWidth = Math.min(availableWidth, 1400); // Máximo 1400px de ancho
    const maxHeight = Math.min(availableHeight, 900); // Máximo 900px de alto
    
    // Calcular escala para usar el máximo espacio disponible
    const scaleByWidth = maxWidth / templateWidth;
    const scaleByHeight = maxHeight / templateHeight;
    const scale = Math.min(scaleByWidth, scaleByHeight, 2.0); // Permitir hasta 200% si es necesario
    
    return {
      width: templateWidth * scale,
      height: templateHeight * scale,
      scale
    };
  };

  const previewDimensions = getPreviewDimensions();

  // =====================
  // PROCESAR COMPONENTES CON DATOS MOCK
  // =====================
  
  const processedComponents = React.useMemo(() => {
    const processed = state.components.map(component => {
      // Procesar contenido dinámico con datos mock
      const processedContent = processDynamicContent(component, defaultMockData);
      
      return {
        ...component,
        showMockData: false, // Evitar doble procesamiento
        content: {
          ...component.content,
          staticValue: processedContent, // Usar como valor estático
          processedValue: processedContent
        }
      };
    });
    
    return processed;
  }, [state.components]);

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
      // Nota: Solo usamos modo mock, así que no hay validaciones de datos vacíos
    });

    return issues;
  };

  const validationIssues = validateDesign();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[96vw] max-h-[96vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
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
              { mode: 'desktop', icon: Monitor, label: 'Desktop' }
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
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
              Mock
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
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

        {/* Content Area - MEJORADO PARA USAR MÁS ESPACIO */}
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="w-full h-full flex items-center justify-center p-4 min-h-[600px]">
            <div 
              className="bg-white shadow-2xl border border-gray-200 flex items-center justify-center"
              style={{
                width: `${previewDimensions.width}px`,
                height: `${previewDimensions.height}px`,
                transform: `rotate(${rotation}deg)`,
                transition: 'all 0.3s ease',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              {/* Canvas content usando ComponentRenderer para consistencia con BuilderV3 */}
              <div 
                className="relative w-full h-full overflow-hidden"
                style={{ backgroundColor: template.canvas.backgroundColor }}
              >
                {processedComponents.map((component) => (
                  <ComponentRenderer
                    key={component.id}
                    component={component}
                    isSelected={false}
                    isMultiSelected={false}
                    zoom={previewDimensions.scale}
                    snapToGrid={false}
                    gridSize={20}
                    snapTolerance={5}
                    allComponents={processedComponents}
                    onClick={() => {}} // No interaction in preview
                    operations={{} as any} // No operations in preview
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Canvas: {template.canvas.width} × {template.canvas.height}px</span>
              <span>Escala: {Math.round(previewDimensions.scale * 100)}%</span>
              <span>Componentes: {state.components.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Vista: Desktop</span>
              {validationIssues.length > 0 && (
                <span className="text-orange-600">⚠️ {validationIssues.length} problema(s)</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 