// =====================================
// SPEED BUILDER V3 - TOOLBAR
// =====================================

import React, { useState } from 'react';
import { 
  Save, 
  Eye, 
  Download, 
  Undo, 
  Redo,
  Settings,
  Zap,
  Database,
  Grid,
  Ruler,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileText,
  Info
} from 'lucide-react';
import { CustomPaperFormatModal } from './CustomPaperFormatModal';

interface ToolbarV3Props {
  onSave: () => void;
  onPreview: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onConnectSAP: () => void;
  onConnectPromotions: () => void;
  onToggleGrid: () => void;
  onToggleRulers: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignJustify: () => void;
  onPaperFormatChange: (format: string) => void;
  onCustomPaperFormat?: (width: number, height: number) => void;
  onToggleCanvasInfo?: () => void;
  onTitleChange: (title: string) => void;
  
  canUndo?: boolean;
  canRedo?: boolean;
  hasSelection?: boolean;
  gridVisible?: boolean;
  rulersVisible?: boolean;
  showCanvasInfo?: boolean;
  zoomLevel?: number;
  isSaving?: boolean;
  isConnectedSAP?: boolean;
  isConnectedPromotions?: boolean;
  paperFormat?: string;
  customWidth?: number;
  customHeight?: number;
  templateTitle?: string;
  hasUnsavedChanges?: boolean;
  availablePaperFormats?: Array<{
    id: string;
    name: string;
    width: number;
    height: number;
    description?: string;
  }>;
}

export const ToolbarV3: React.FC<ToolbarV3Props> = ({
  onSave,
  onPreview,
  onExport,
  onUndo,
  onRedo,
  onConnectSAP,
  onConnectPromotions,
  onToggleGrid,
  onToggleRulers,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onCopy,
  onDelete,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignJustify,
  onPaperFormatChange,
  onCustomPaperFormat,
  onToggleCanvasInfo,
  onTitleChange,
  
  canUndo = false,
  canRedo = false,
  hasSelection = false,
  gridVisible = false,
  rulersVisible = false,
  showCanvasInfo = false,
  zoomLevel = 100,
  isSaving = false,
  isConnectedSAP = false,
  isConnectedPromotions = false,
  paperFormat = 'A4',
  customWidth = 210,
  customHeight = 297,
  templateTitle = 'Nueva Plantilla Sin Título',
  hasUnsavedChanges = false,
  availablePaperFormats = [
    { id: 'A4', name: 'A4', width: 210, height: 297, description: '210 x 297 mm' },
    { id: 'A3', name: 'A3', width: 297, height: 420, description: '297 x 420 mm' },
    { id: 'LETTER', name: 'Carta', width: 216, height: 279, description: '8.5 x 11 in' },
    { id: 'CUSTOM', name: 'Personalizado', width: 0, height: 0, description: 'Dimensiones personalizadas' }
  ]
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);

  const handlePaperFormatChange = (format: string) => {
    if (format === 'CUSTOM') {
      setShowCustomModal(true);
    } else {
      onPaperFormatChange(format);
    }
  };

  const handleCustomPaperFormat = (width: number, height: number) => {
    if (onCustomPaperFormat) {
      onCustomPaperFormat(width, height);
    }
    setShowCustomModal(false);
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    disabled?: boolean;
    active?: boolean;
    variant?: 'default' | 'primary' | 'success' | 'warning';
  }> = ({ onClick, icon, title, disabled = false, active = false, variant = 'default' }) => {
    const getButtonStyles = () => {
      if (disabled) return 'bg-gray-100 text-gray-400 cursor-not-allowed';
      
      if (active) {
        switch (variant) {
          case 'primary': return 'bg-blue-600 text-white hover:bg-blue-700';
          case 'success': return 'bg-green-600 text-white hover:bg-green-700';
          case 'warning': return 'bg-yellow-600 text-white hover:bg-yellow-700';
          default: return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
        }
      }
      
      switch (variant) {
        case 'primary': return 'bg-blue-600 text-white hover:bg-blue-700';
        case 'success': return 'bg-green-600 text-white hover:bg-green-700';
        case 'warning': return 'bg-yellow-600 text-white hover:bg-yellow-700';
        default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      }
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`
          p-2 rounded-lg transition-colors duration-200 
          ${getButtonStyles()}
        `}
      >
        {icon}
      </button>
    );
  };

  const Separator = () => (
    <div className="w-px h-8 bg-gray-300 mx-2" />
  );

  const currentPaperFormat = availablePaperFormats.find(f => f.id === paperFormat) || availablePaperFormats[0];

  // Descripción dinámica para formato personalizado
  const getFormatDescription = () => {
    if (paperFormat === 'CUSTOM') {
      return `${customWidth} × ${customHeight} mm`;
    }
    return currentPaperFormat.description;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left side - File operations */}
        <div className="flex items-center space-x-2">
          <ToolbarButton
            onClick={onSave}
            icon={<Save className="w-4 h-4" />}
            title={isSaving ? "Guardando..." : "Guardar plantilla"}
            disabled={isSaving}
            variant="success"
          />

          {/* Template Title Editor */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-xs text-gray-500 font-medium">Título:</span>
            <input
              type="text"
              value={templateTitle}
              onChange={(e) => {
                const newTitle = e.target.value;
                if (newTitle.length <= 100) { // Limitar a 100 caracteres
                  onTitleChange(newTitle);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur(); // Quitar foco al presionar Enter
                }
              }}
              placeholder="Nombre de la plantilla..."
              className="bg-transparent text-sm font-medium text-gray-700 border-none focus:outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded min-w-[200px] max-w-[300px] transition-all"
              title={`Nombre de la plantilla (${templateTitle?.length || 0}/100 caracteres)`}
              maxLength={100}
            />
            {hasUnsavedChanges && (
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Cambios sin guardar" />
            )}
          </div>
          
          <ToolbarButton
            onClick={onPreview}
            icon={<Eye className="w-4 h-4" />}
            title="Vista previa"
            variant="primary"
          />
          
          <ToolbarButton
            onClick={onExport}
            icon={<Download className="w-4 h-4" />}
            title="Exportar"
            variant="primary"
          />

          <Separator />

          {/* History controls */}
          <ToolbarButton
            onClick={onUndo}
            icon={<Undo className="w-4 h-4" />}
            title="Deshacer"
            disabled={!canUndo}
          />
          
          <ToolbarButton
            onClick={onRedo}
            icon={<Redo className="w-4 h-4" />}
            title="Rehacer"
            disabled={!canRedo}
          />

          <Separator />

          {/* Element operations */}
          <ToolbarButton
            onClick={onCopy}
            icon={<Copy className="w-4 h-4" />}
            title="Copiar elemento"
            disabled={!hasSelection}
          />
          
          <ToolbarButton
            onClick={onDelete}
            icon={<Trash2 className="w-4 h-4" />}
            title="Eliminar elemento"
            disabled={!hasSelection}
            variant="warning"
          />

          <Separator />

          {/* Alignment tools */}
          <ToolbarButton
            onClick={onAlignLeft}
            icon={<AlignLeft className="w-4 h-4" />}
            title="Alinear a la izquierda"
            disabled={!hasSelection}
          />
          
          <ToolbarButton
            onClick={onAlignCenter}
            icon={<AlignCenter className="w-4 h-4" />}
            title="Centrar"
            disabled={!hasSelection}
          />
          
          <ToolbarButton
            onClick={onAlignRight}
            icon={<AlignRight className="w-4 h-4" />}
            title="Alinear a la derecha"
            disabled={!hasSelection}
          />
        </div>

        {/* Center - Paper Format and Zoom controls */}
        <div className="flex items-center space-x-3">
          {/* Paper Format Selector */}
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border">
            <FileText className="w-4 h-4 text-gray-600" />
            <select
              value={paperFormat}
              onChange={(e) => handlePaperFormatChange(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
              title="Formato de papel"
            >
              {availablePaperFormats.map(format => (
                <option key={format.id} value={format.id}>
                  {format.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-500">
              {getFormatDescription()}
            </span>
          </div>

          <Separator />

          {/* Zoom Controls */}
          <ToolbarButton
            onClick={onZoomOut}
            icon={<ZoomOut className="w-4 h-4" />}
            title="Reducir zoom"
            disabled={zoomLevel <= 25}
          />
          
          <button
            onClick={onZoomReset}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            title="Restablecer zoom"
          >
            {zoomLevel}%
          </button>
          
          <ToolbarButton
            onClick={onZoomIn}
            icon={<ZoomIn className="w-4 h-4" />}
            title="Aumentar zoom"
            disabled={zoomLevel >= 400}
          />
        </div>

        {/* Right side - View and connectivity */}
        <div className="flex items-center space-x-2">
          {/* View controls */}
          <ToolbarButton
            onClick={onToggleGrid}
            icon={<Grid className="w-4 h-4" />}
            title={gridVisible ? "Ocultar grilla" : "Mostrar grilla"}
            active={gridVisible}
          />
          
          <ToolbarButton
            onClick={onToggleRulers}
            icon={<Ruler className="w-4 h-4" />}
            title={rulersVisible ? "Ocultar reglas" : "Mostrar reglas"}
            active={rulersVisible}
          />

          {onToggleCanvasInfo && (
            <ToolbarButton
              onClick={onToggleCanvasInfo}
              icon={<Info className="w-4 h-4" />}
              title={showCanvasInfo ? "Ocultar información del canvas" : "Mostrar información del canvas"}
              active={showCanvasInfo}
            />
          )}

          <Separator />

          {/* External connections */}
          <ToolbarButton
            onClick={onConnectSAP}
            icon={<Database className="w-4 h-4" />}
            title={isConnectedSAP ? "Conectado a SAP" : "Conectar con SAP"}
            active={isConnectedSAP}
            variant={isConnectedSAP ? "success" : "default"}
          />
          
          <ToolbarButton
            onClick={onConnectPromotions}
            icon={<Zap className="w-4 h-4" />}
            title={isConnectedPromotions ? "Conectado a Promociones" : "Conectar con sistema de Promociones"}
            active={isConnectedPromotions}
            variant={isConnectedPromotions ? "success" : "default"}
          />
        </div>
      </div>

      {/* Connection status bar */}
      {(isConnectedSAP || isConnectedPromotions) && (
        <div className="mt-2 flex items-center space-x-4 text-xs">
          {isConnectedSAP && (
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>SAP conectado</span>
            </div>
          )}
          {isConnectedPromotions && (
            <div className="flex items-center space-x-1 text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Sistema de Promociones conectado</span>
            </div>
          )}
        </div>
      )}

      {/* Custom Paper Format Modal */}
      <CustomPaperFormatModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onConfirm={handleCustomPaperFormat}
        currentWidth={customWidth}
        currentHeight={customHeight}
      />
    </div>
  );
}; 