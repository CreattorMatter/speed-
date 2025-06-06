import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectElements,
  selectCanvasConfig,
  selectCurrentTemplate,
  setExportFormat,
  setExportQuality,
  setExportDPI,
  CartelElement
} from '../../redux/builderSlice';

// ====================================
// TIPOS Y INTERFACES
// ====================================

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: ExportData) => void;
}

interface ExportData {
  format: 'json' | 'pdf' | 'png' | 'jpg' | 'svg';
  quality: number;
  dpi: number;
  fileName: string;
  includeBackground: boolean;
  transparent: boolean;
  scale: number;
  pageFormat: 'A4' | 'A5' | 'custom';
  customSize?: { width: number; height: number };
}

interface ExportPreviewProps {
  elements: CartelElement[];
  canvasConfig: any;
  scale: number;
}

// ====================================
// COMPONENTES AUXILIARES
// ====================================

const ExportPreview: React.FC<ExportPreviewProps> = ({ elements, canvasConfig, scale }) => {
  const previewWidth = 200;
  const previewHeight = (canvasConfig.format.height / canvasConfig.format.width) * previewWidth;

  return (
    <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
      <h4 className="text-sm font-medium text-gray-800 mb-2">Vista Previa</h4>
      <div 
        className="bg-white border border-gray-300 rounded shadow-sm relative overflow-hidden"
        style={{
          width: previewWidth,
          height: previewHeight,
          backgroundImage: canvasConfig.showGrid ? 
            'linear-gradient(to right, #f3f4f6 1px, transparent 1px), linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)' : 
            'none',
          backgroundSize: '10px 10px'
        }}
      >
        {elements.map((element) => (
          <div
            key={element.id}
            className="absolute"
            style={{
              left: (element.position.x / canvasConfig.format.width) * previewWidth,
              top: (element.position.y / canvasConfig.format.height) * previewHeight,
              width: (element.size.width / canvasConfig.format.width) * previewWidth,
              height: (element.size.height / canvasConfig.format.height) * previewHeight,
              fontSize: Math.max(6, (element.style.fontSize || 16) * scale * 0.1),
              backgroundColor: element.style.backgroundColor || 'transparent',
              color: element.style.color || '#000000',
              opacity: element.visible ? 1 : 0.3,
              border: element.style.border || 'none',
              borderRadius: element.style.borderRadius || 0,
              padding: Math.max(1, (element.style.padding || 0) * scale * 0.1),
            }}
          >
            <div className="truncate text-xs">
              {element.type === 'precio' && `${element.content.moneda}${element.content.precio}`}
              {element.type === 'descuento' && element.content.etiqueta}
              {element.type === 'producto' && element.content.nombre}
              {element.type === 'texto-libre' && element.content.texto}
              {element.type === 'imagen' && '🖼️'}
              {element.type === 'logo' && '🏢'}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        {canvasConfig.format.name} • {elements.length} elemento{elements.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

const FormatCard: React.FC<{
  format: ExportData['format'];
  title: string;
  description: string;
  icon: string;
  features: string[];
  isSelected: boolean;
  onSelect: () => void;
  quality?: number;
  onQualityChange?: (quality: number) => void;
}> = ({ format, title, description, icon, features, isSelected, onSelect, quality, onQualityChange }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          
          <ul className="text-xs text-gray-500 space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="mr-1">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          {isSelected && (format === 'png' || format === 'jpg') && onQualityChange && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Calidad: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => onQualityChange(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ====================================
// COMPONENTE PRINCIPAL
// ====================================

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  const dispatch = useDispatch();
  
  // Selectores Redux
  const elements = useSelector(selectElements);
  const canvasConfig = useSelector(selectCanvasConfig);
  const currentTemplate = useSelector(selectCurrentTemplate);

  // Estado local
  const [exportData, setExportData] = useState<ExportData>({
    format: 'png',
    quality: 90,
    dpi: 300,
    fileName: currentTemplate.name || 'cartel',
    includeBackground: true,
    transparent: false,
    scale: 1,
    pageFormat: 'A4'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState<'format' | 'options' | 'preview'>('format');

  // Configuraciones de formato
  const formatConfigs = [
    {
      format: 'png' as const,
      title: 'PNG',
      description: 'Imagen de alta calidad con transparencia',
      icon: '🖼️',
      features: ['Soporte para transparencia', 'Alta calidad', 'Ideal para web', 'Sin pérdida de calidad']
    },
    {
      format: 'jpg' as const,
      title: 'JPG',
      description: 'Imagen comprimida para tamaño reducido',
      icon: '📷',
      features: ['Tamaño de archivo pequeño', 'Compatible universalmente', 'Ideal para impresión', 'Compresión ajustable']
    },
    {
      format: 'pdf' as const,
      title: 'PDF',
      description: 'Documento vectorial para impresión profesional',
      icon: '📄',
      features: ['Vector escalable', 'Ideal para impresión', 'Texto seleccionable', 'Tamaño profesional']
    },
    {
      format: 'svg' as const,
      title: 'SVG',
      description: 'Gráfico vectorial escalable',
      icon: '⚡',
      features: ['Infinitamente escalable', 'Tamaño mínimo', 'Editable con código', 'Ideal para web']
    },
    {
      format: 'json' as const,
      title: 'JSON',
      description: 'Datos del template para reutilización',
      icon: '💾',
      features: ['Reutilizable', 'Editable', 'Datos completos', 'Para desarrolladores']
    }
  ];

  // Handlers
  const handleFormatSelect = (format: ExportData['format']) => {
    setExportData(prev => ({ ...prev, format }));
    dispatch(setExportFormat(format));
  };

  const handleQualityChange = (quality: number) => {
    setExportData(prev => ({ ...prev, quality }));
    dispatch(setExportQuality(quality));
  };

  const handleDPIChange = (dpi: number) => {
    setExportData(prev => ({ ...prev, dpi }));
    dispatch(setExportDPI(dpi));
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simular proceso de exportación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Llamar callback de exportación
      onExport(exportData);
      
      // Cerrar modal
      onClose();
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getEstimatedFileSize = () => {
    const pixelCount = canvasConfig.format.width * canvasConfig.format.height * (exportData.dpi / 72) ** 2;
    
    switch (exportData.format) {
      case 'png':
        return `~${Math.round(pixelCount * 4 * exportData.scale / 1024 / 1024)}MB`;
      case 'jpg':
        return `~${Math.round(pixelCount * (exportData.quality / 100) * exportData.scale / 1024 / 1024)}MB`;
      case 'pdf':
        return `~${Math.round(elements.length * 50 / 1024)}KB`;
      case 'svg':
        return `~${Math.round(elements.length * 20 / 1024)}KB`;
      case 'json':
        return `~${Math.round(JSON.stringify(elements).length / 1024)}KB`;
      default:
        return 'N/A';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Exportar Cartel</h2>
            <p className="text-sm text-gray-600">
              {currentTemplate.name} • {elements.length} elemento{elements.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Steps indicator */}
          <div className="flex items-center space-x-2">
            {['format', 'options', 'preview'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    exportStep === step 
                      ? 'bg-blue-500 text-white' 
                      : index < ['format', 'options', 'preview'].indexOf(exportStep)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div 
                    className={`w-8 h-0.5 ${
                      index < ['format', 'options', 'preview'].indexOf(exportStep)
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Main content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {exportStep === 'format' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Seleccionar Formato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formatConfigs.map((config) => (
                    <FormatCard
                      key={config.format}
                      {...config}
                      isSelected={exportData.format === config.format}
                      onSelect={() => handleFormatSelect(config.format)}
                      quality={exportData.quality}
                      onQualityChange={handleQualityChange}
                    />
                  ))}
                </div>
              </div>
            )}

            {exportStep === 'options' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Opciones de Exportación</h3>

                {/* Nombre del archivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del archivo
                  </label>
                  <input
                    type="text"
                    value={exportData.fileName}
                    onChange={(e) => setExportData(prev => ({ ...prev, fileName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="nombre-del-cartel"
                  />
                </div>

                {/* DPI para imágenes */}
                {(exportData.format === 'png' || exportData.format === 'jpg') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolución (DPI): {exportData.dpi}
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="72"
                        max="600"
                        step="72"
                        value={exportData.dpi}
                        onChange={(e) => handleDPIChange(Number(e.target.value))}
                        className="flex-1"
                      />
                      <div className="flex space-x-2">
                        {[72, 150, 300, 600].map(dpi => (
                          <button
                            key={dpi}
                            onClick={() => handleDPIChange(dpi)}
                            className={`px-2 py-1 text-xs rounded ${
                              exportData.dpi === dpi
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {dpi}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      72: Web • 150: Impresión básica • 300: Impresión profesional • 600: Alta calidad
                    </p>
                  </div>
                )}

                {/* Escala */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escala: {exportData.scale}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={exportData.scale}
                    onChange={(e) => setExportData(prev => ({ ...prev, scale: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Opciones adicionales */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Opciones Adicionales</h4>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportData.includeBackground}
                      onChange={(e) => setExportData(prev => ({ ...prev, includeBackground: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Incluir fondo del canvas</span>
                  </label>

                  {exportData.format === 'png' && (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportData.transparent}
                        onChange={(e) => setExportData(prev => ({ ...prev, transparent: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Fondo transparente</span>
                    </label>
                  )}
                </div>

                {/* Información del archivo */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Información del Archivo</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Formato:</span>
                      <span className="font-medium">{exportData.format.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tamaño estimado:</span>
                      <span className="font-medium">{getEstimatedFileSize()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimensiones:</span>
                      <span className="font-medium">
                        {Math.round(canvasConfig.format.width * exportData.scale)} × {Math.round(canvasConfig.format.height * exportData.scale)}px
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {exportStep === 'preview' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vista Previa Final</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ExportPreview 
                    elements={elements}
                    canvasConfig={canvasConfig}
                    scale={exportData.scale}
                  />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Resumen de Exportación</h4>
                    
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Archivo:</span>
                        <span className="font-medium">{exportData.fileName}.{exportData.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Formato:</span>
                        <span className="font-medium">{exportData.format.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calidad:</span>
                        <span className="font-medium">{exportData.quality}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">DPI:</span>
                        <span className="font-medium">{exportData.dpi}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Escala:</span>
                        <span className="font-medium">{exportData.scale}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Elementos:</span>
                        <span className="font-medium">{elements.length}</span>
                      </div>
                    </div>

                    {isExporting && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <div>
                            <p className="font-medium text-blue-800">Exportando cartel...</p>
                            <p className="text-sm text-blue-600">Esto puede tomar unos momentos</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {exportStep === 'format' && 'Paso 1 de 3: Selecciona el formato de exportación'}
            {exportStep === 'options' && 'Paso 2 de 3: Configura las opciones'}
            {exportStep === 'preview' && 'Paso 3 de 3: Revisa y confirma la exportación'}
          </div>

          <div className="flex items-center space-x-3">
            {exportStep !== 'format' && (
              <button
                onClick={() => {
                  const steps: typeof exportStep[] = ['format', 'options', 'preview'];
                  const currentIndex = steps.indexOf(exportStep);
                  setExportStep(steps[currentIndex - 1]);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
            )}

            {exportStep !== 'preview' ? (
              <button
                onClick={() => {
                  const steps: typeof exportStep[] = ['format', 'options', 'preview'];
                  const currentIndex = steps.indexOf(exportStep);
                  setExportStep(steps[currentIndex + 1]);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? 'Exportando...' : 'Exportar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 