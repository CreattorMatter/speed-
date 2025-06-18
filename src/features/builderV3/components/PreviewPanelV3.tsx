// =====================================
// SPEED BUILDER V3 - ENHANCED PREVIEW PANEL
// =====================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Eye, 
  Download, 
  Image, 
  FileText, 
  Settings,
  Smartphone,
  Tablet,
  Monitor,
  Printer,
  Share2,
  X,
  Zap,
  Database,
  RefreshCw,
  Play,
  Pause,
  Clock
} from 'lucide-react';
import { BuilderStateV3, DraggableComponentV3, TemplateV3 } from '../types';
import { processDynamicContent, MockDataV3 } from '../../../utils/dynamicContentProcessor';

interface PreviewPanelV3Props {
  state: BuilderStateV3;
  onExport: (format: string, options: any) => void;
  onGeneratePreview: () => Promise<string>;
  isVisible: boolean;
  onClose: () => void;
}

export const PreviewPanelV3: React.FC<PreviewPanelV3Props> = ({
  state,
  onExport,
  onGeneratePreview,
  isVisible,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'export' | 'data'>('preview');
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'pdf' | 'svg'>('png');
  const [exportQuality, setExportQuality] = useState(90);
  const [exportDPI, setExportDPI] = useState(300);
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLivePreview, setIsLivePreview] = useState(true);
  const [previewScale, setPreviewScale] = useState(0.5);
  const [selectedPreviewData, setSelectedPreviewData] = useState<string>('mock-data-1');

  // =====================
  // MOCK DATA FOR PREVIEW
  // =====================

  const mockDataSets = {
    'mock-data-1': {
      name: 'Producto Ejemplo 1',
      ProductName: "Coca Cola 2.25L",
      ProductSku: "CC2250",
      ProductBrand: "Coca Cola",
      PriceOriginal: "$2.999",
      PriceNow: "$2.399",
      PriceWithoutTax: "$2.016",
      DiscountPercentage: "20",
      DiscountAmount: "$600",
      DateFrom: "01/12/2024",
      DateTo: "31/12/2024",
      PromotionName: "Hot Sale"
    },
    'mock-data-2': {
      name: 'Producto Ejemplo 2',
      ProductName: "Notebook HP Pavilion",
      ProductSku: "HP15DA",
      ProductBrand: "HP",
      PriceOriginal: "$899.999",
      PriceNow: "$649.999",
      PriceWithoutTax: "$546.218",
      DiscountPercentage: "28",
      DiscountAmount: "$250.000",
      DateFrom: "15/11/2024",
      DateTo: "15/01/2025",
      PromotionName: "Black Friday"
    },
    'mock-data-3': {
      name: 'Producto Ejemplo 3',
      ProductName: "Pan Integral Bimbo",
      ProductSku: "BIM680",
      ProductBrand: "Bimbo",
      PriceOriginal: "$1.899",
      PriceNow: "$1.299",
      PriceWithoutTax: "$1.092",
      DiscountPercentage: "32",
      DiscountAmount: "$600",
      DateFrom: "01/12/2024",
      DateTo: "07/12/2024",
      PromotionName: "Semana del Pan"
    }
  };

  // =====================
  // REAL-TIME PREVIEW LOGIC
  // =====================

  const processedComponents = useMemo(() => {
    if (!state.components || !isLivePreview) return state.components;

    // Convertir mockDataSets al formato MockDataV3
    const currentMockSet = mockDataSets[selectedPreviewData as keyof typeof mockDataSets];
    const mockData: MockDataV3 = {
      product_name: currentMockSet.ProductName,
      product_price: parseFloat(currentMockSet.PriceOriginal.replace(/[$.,]/g, '')),
      price_without_tax: parseFloat(currentMockSet.PriceWithoutTax.replace(/[$.,]/g, '')),
      product_sku: currentMockSet.ProductSku,
      product_brand: currentMockSet.ProductBrand,
      product_category: 'Bebidas',
      product_origin: 'Argentina',
      product_description: `${currentMockSet.ProductBrand} ${currentMockSet.ProductName}`,
      price_now: parseFloat(currentMockSet.PriceNow.replace(/[$.,]/g, '')),
      discount_percentage: parseInt(currentMockSet.DiscountPercentage),
      discount_amount: parseFloat(currentMockSet.DiscountAmount.replace(/[$.,]/g, '')),
      date_from: currentMockSet.DateFrom,
      date_to: currentMockSet.DateTo,
      promotion_name: currentMockSet.PromotionName,
      final_price: parseFloat(currentMockSet.PriceNow.replace(/[$.,]/g, '')),
      store_name: 'Easy Pilar',
      store_address: 'Av. Presidente Perón 1823, Pilar'
    };
    
    return state.components.map(component => {
      const processedValue = processDynamicContent(component, mockData);
      
      return {
        ...component,
        content: {
          ...component.content,
          processedValue
        }
      };
    });
  }, [state.components, selectedPreviewData, isLivePreview]);

  // =====================
  // PREVIEW GENERATION
  // =====================

  const generateLivePreview = useCallback(async () => {
    if (!isLivePreview || isGenerating) return;

    setIsGenerating(true);
    try {
      // Simulate preview generation
      await new Promise(resolve => setTimeout(resolve, 500));
      // In real implementation, this would generate an actual preview
      setPreviewUrl(`data:image/svg+xml,${encodeURIComponent(generateSVGPreview())}`);
    } catch (error) {
      console.error('Error generating live preview:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [isLivePreview, isGenerating, processedComponents, state.currentTemplate]);

  const generateSVGPreview = () => {
    if (!state.currentTemplate) return '';

    const { width, height } = state.currentTemplate.canvas;
    const backgroundColor = state.currentTemplate.canvas.backgroundColor || '#ffffff';

    let componentsHTML = '';

    processedComponents.forEach(component => {
      const { position, size, style, content } = component;
      const x = position.x * previewScale;
      const y = position.y * previewScale;
      const w = size.width * previewScale;
      const h = size.height * previewScale;

      let elementHTML = '';
      const displayValue = (content as any)?.processedValue || (content as any)?.staticValue || 'Texto';

      if (component.type.includes('text') || component.type.includes('field')) {
        const fontSize = (style?.typography?.fontSize || 16) * previewScale;
        const color = style?.color?.color || '#000000';
        const fontFamily = style?.typography?.fontFamily || 'Arial';
        const fontWeight = style?.typography?.fontWeight || 'normal';
        const textAlign = style?.typography?.textAlign || 'left';

        elementHTML = `
          <text x="${x}" y="${y + fontSize}" 
                font-family="${fontFamily}" 
                font-size="${fontSize}px" 
                font-weight="${fontWeight}"
                fill="${color}"
                text-anchor="${textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start'}">
            ${displayValue}
          </text>`;
      } else if (component.type.includes('shape') || component.type.includes('container')) {
        const bgColor = style?.color?.backgroundColor || '#f0f0f0';
        const borderColor = style?.border?.color || '#cccccc';
        const borderWidth = (style?.border?.width || 1) * previewScale;

        elementHTML = `
          <rect x="${x}" y="${y}" width="${w}" height="${h}"
                fill="${bgColor}" 
                stroke="${borderColor}" 
                stroke-width="${borderWidth}"/>`;
      }

      componentsHTML += elementHTML;
    });

    return `
      <svg width="${width * previewScale}" height="${height * previewScale}" 
           xmlns="http://www.w3.org/2000/svg" style="background: ${backgroundColor}">
        ${componentsHTML}
      </svg>`;
  };

  // Auto-update preview when components change
  useEffect(() => {
    if (isLivePreview && isVisible) {
      const debounceTimeout = setTimeout(generateLivePreview, 300);
      return () => clearTimeout(debounceTimeout);
    }
  }, [processedComponents, generateLivePreview, isLivePreview, isVisible]);

  if (!isVisible) return null;

  const getDeviceSize = () => {
    switch (devicePreview) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      default:
        return { width: 1200, height: 800 };
    }
  };

  const renderPreviewTab = () => (
    <div className="p-4 space-y-4">
      {/* Live Preview Controls */}
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLivePreview ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium">Vista Previa en Tiempo Real</span>
        </div>
        <button
          onClick={() => setIsLivePreview(!isLivePreview)}
          className={`p-1 rounded ${isLivePreview ? 'text-green-600' : 'text-gray-600'}`}
        >
          {isLivePreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* Data Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Datos de Prueba</label>
        <select
          value={selectedPreviewData}
          onChange={(e) => setSelectedPreviewData(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Object.entries(mockDataSets).map(([key, data]) => (
            <option key={key} value={key}>{data.name}</option>
          ))}
        </select>
      </div>

      {/* Device selector */}
      <div className="flex space-x-2">
        <button
          onClick={() => setDevicePreview('desktop')}
          className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded ${
            devicePreview === 'desktop'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span className="text-sm">Desktop</span>
        </button>
        
        <button
          onClick={() => setDevicePreview('tablet')}
          className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded ${
            devicePreview === 'tablet'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Tablet className="w-4 h-4" />
          <span className="text-sm">Tablet</span>
        </button>
        
        <button
          onClick={() => setDevicePreview('mobile')}
          className={`flex-1 flex items-center justify-center space-x-2 p-2 rounded ${
            devicePreview === 'mobile'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span className="text-sm">Mobile</span>
        </button>
      </div>

      {/* Scale Control */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Escala ({Math.round(previewScale * 100)}%)
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={previewScale}
          onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Generate preview button */}
      {!isLivePreview && (
        <button
          onClick={generateLivePreview}
          disabled={isGenerating}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generando...' : 'Actualizar Preview'}</span>
        </button>
      )}

      {/* Preview area */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-2 flex items-center justify-between text-sm text-gray-600">
          <span>Vista previa - {devicePreview}</span>
          {isLivePreview && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">Tiempo Real</span>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 min-h-[400px] flex items-center justify-center overflow-auto">
          {previewUrl ? (
            <div 
              className="bg-white shadow-lg rounded overflow-hidden border"
              style={{
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-auto"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>{isLivePreview ? 'Generando preview automático...' : 'Haz clic en actualizar para ver tu diseño'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview info */}
      {state.currentTemplate && (
        <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded">
          <p><strong>Canvas:</strong> {state.currentTemplate.canvas.width} x {state.currentTemplate.canvas.height}px</p>
          <p><strong>Componentes:</strong> {state.components.length} ({processedComponents.filter(c => (c.content as any)?.processedValue).length} con datos)</p>
          <p><strong>Familia:</strong> {state.currentFamily?.displayName}</p>
          <p><strong>Escala:</strong> {Math.round(previewScale * 100)}%</p>
        </div>
      )}
    </div>
  );

  const renderDataTab = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium">Datos de Vista Previa</h3>
      </div>

      {/* Current data set info */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">
          {mockDataSets[selectedPreviewData as keyof typeof mockDataSets].name}
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(mockDataSets[selectedPreviewData as keyof typeof mockDataSets]).map(([key, value]) => {
            if (key === 'name') return null;
            return (
              <div key={key} className="flex justify-between">
                <span className="text-blue-700">{key}:</span>
                <span className="font-mono text-blue-900">{value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Component data mapping */}
      <div>
        <h4 className="font-medium mb-2">Mapeo de Componentes</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {processedComponents.map(component => {
            const content = component.content as any;
            const hasData = content?.processedValue && content.processedValue !== content.staticValue;
            
            if (!hasData) return null;

            return (
              <div key={component.id} className="p-2 bg-gray-50 rounded text-xs">
                <div className="font-medium">{component.name}</div>
                <div className="text-gray-600">Tipo: {content.fieldType}</div>
                <div className="text-green-600 font-mono">{content.processedValue}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection status */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Estado de Conexiones</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>SAP:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              state.sapConnection.isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {state.sapConnection.isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Promociones:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              state.promotionConnection.isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {state.promotionConnection.isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExportTab = () => (
    <div className="p-4 space-y-4">
      {/* Format selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
        <div className="grid grid-cols-2 gap-2">
          {['png', 'jpg', 'pdf', 'svg'].map(format => (
            <button
              key={format}
              onClick={() => setExportFormat(format as any)}
              className={`p-2 text-sm rounded border ${
                exportFormat === format
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Quality setting */}
      {(exportFormat === 'png' || exportFormat === 'jpg') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calidad ({exportQuality}%)
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={exportQuality}
            onChange={(e) => setExportQuality(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* DPI setting */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">DPI</label>
        <select
          value={exportDPI}
          onChange={(e) => setExportDPI(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={72}>72 DPI (Web)</option>
          <option value={150}>150 DPI (Pantalla)</option>
          <option value={300}>300 DPI (Impresión)</option>
          <option value={600}>600 DPI (Alta calidad)</option>
        </select>
      </div>

      {/* Export with current data */}
      <div className="bg-yellow-50 p-3 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">Datos Actuales</span>
        </div>
        <p className="text-xs text-yellow-700">
          El archivo exportado incluirá los datos de: {mockDataSets[selectedPreviewData as keyof typeof mockDataSets].name}
        </p>
      </div>

      {/* Export button */}
      <button
        onClick={() => {
          const exportOptions = {
            format: exportFormat,
            quality: exportQuality,
            dpi: exportDPI,
            width: state.currentTemplate?.canvas.width || 1080,
            height: state.currentTemplate?.canvas.height || 1350,
            dataSet: selectedPreviewData,
            components: processedComponents
          };
          onExport(exportFormat, exportOptions);
        }}
        className="w-full flex items-center justify-center space-x-2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Exportar {exportFormat.toUpperCase()}</span>
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Vista Previa y Exportación</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'preview', label: 'Vista Previa', icon: Eye },
            { id: 'data', label: 'Datos', icon: Database },
            { id: 'export', label: 'Exportar', icon: Download }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 p-3 transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'preview' && renderPreviewTab()}
          {activeTab === 'data' && renderDataTab()}
          {activeTab === 'export' && renderExportTab()}
        </div>
      </div>
    </div>
  );
}; 