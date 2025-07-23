// =====================================
// SPEED BUILDER V3 - TOOLBAR
// =====================================

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  Grid3X3, 
  Ruler, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Trash2,
  Menu,
  FileText,
  Info
} from 'lucide-react';
import { CustomPaperFormatModal } from './CustomPaperFormatModal';

interface ToolbarV3Props {
  onSave: () => void;
  onPreview: () => void;
  onToggleGrid: () => void;
  onToggleRulers: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onDelete: () => void;
  onPaperFormatChange: (format: string) => void;
  onCustomPaperFormat?: (width: number, height: number) => void;
  onToggleCanvasInfo?: () => void;
  onTitleChange: (title: string) => void;
  onOrientationToggle: () => void;
  
  hasSelection?: boolean;
  gridVisible?: boolean;
  rulersVisible?: boolean;
  showCanvasInfo?: boolean;
  zoomLevel?: number;
  isSaving?: boolean;
  paperFormat?: string;
  customWidth?: number;
  customHeight?: number;
  templateTitle?: string;
  hasUnsavedChanges?: boolean;
  orientation?: 'portrait' | 'landscape';
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
  onToggleGrid,
  onToggleRulers,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onDelete,
  onPaperFormatChange,
  onCustomPaperFormat,
  onToggleCanvasInfo,
  onTitleChange,
  onOrientationToggle,
  
  hasSelection = false,
  gridVisible = false,
  rulersVisible = false,
  showCanvasInfo = false,
  zoomLevel = 100,
  isSaving = false,
  paperFormat = 'A4',
  customWidth = 210,
  customHeight = 297,
  templateTitle = 'Nueva Plantilla Sin Título',
  hasUnsavedChanges = false,
  orientation = 'portrait',
  availablePaperFormats = [
    { id: 'A2', name: 'A2', width: 420, height: 594, description: '420 x 594 mm' },
    { id: 'A3', name: 'A3', width: 297, height: 420, description: '297 x 420 mm' },
    { id: 'A4', name: 'A4', width: 210, height: 297, description: '210 x 297 mm' },
    { id: 'LETTER', name: 'Carta', width: 216, height: 279, description: '8.5 x 11 in' },
    { id: 'CUSTOM', name: 'Personalizado', width: 0, height: 0, description: 'Dimensiones personalizadas' }
  ]
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [localTitle, setLocalTitle] = useState(templateTitle);

  useEffect(() => {
    setLocalTitle(templateTitle);
  }, [templateTitle]);

  const handleTitleBlur = () => {
    if (localTitle.trim() && localTitle !== templateTitle) {
      onTitleChange(localTitle);
    } else {
      setLocalTitle(templateTitle); // Revert if empty or unchanged
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setLocalTitle(templateTitle);
      e.currentTarget.blur();
    }
  };

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
    className?: string;
  }> = ({ onClick, icon, title, disabled = false, active = false, variant = 'default', className = '' }) => {
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
          p-1.5 sm:p-2 rounded-lg transition-colors duration-200 flex-shrink-0
          ${getButtonStyles()}
          ${className}
        `}
      >
        <div className="w-3 h-3 sm:w-4 sm:h-4">
          {icon}
        </div>
      </button>
    );
  };

  const Separator = () => (
    <div className="w-px h-6 sm:h-8 bg-gray-300 mx-1 sm:mx-2 flex-shrink-0" />
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
    <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2">
      {/* Mobile/Compact view for high zoom levels */}
      <div className="block xl:hidden">
        <div className="flex items-center justify-between">
          {/* Essential controls */}
          <div className="flex items-center space-x-1">
            <ToolbarButton
              onClick={onSave}
              icon={<Save className="w-4 h-4" />}
              title={isSaving ? "Guardando..." : "Guardar"}
              disabled={isSaving}
              variant="success"
            />
            
            <ToolbarButton
              onClick={onPreview}
              icon={<Eye className="w-4 h-4" />}
              title="Vista previa"
              variant="primary"
            />

            {/* Title Editor - Compact */}
            <div className="flex items-center mx-2 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs max-w-[120px] sm:max-w-[200px]">
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                placeholder="Título..."
                className="bg-transparent text-xs font-medium text-gray-700 border-none focus:outline-none w-full truncate"
                title={`${localTitle} (${localTitle.length}/100)`}
                maxLength={100}
              />
              {hasUnsavedChanges && (
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse ml-1 flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center space-x-1">
            {/* Zoom controls - always visible */}
            <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded">
              <ToolbarButton
                onClick={onZoomOut}
                icon={<ZoomOut className="w-3 h-3" />}
                title="Reducir zoom"
                disabled={zoomLevel <= 25}
                className="p-1"
              />
              
              <button
                onClick={onZoomReset}
                className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors min-w-[40px]"
                title="Restablecer zoom"
              >
                {Math.round(zoomLevel)}%
              </button>
              
              <ToolbarButton
                onClick={onZoomIn}
                icon={<ZoomIn className="w-3 h-3" />}
                title="Aumentar zoom"
                disabled={zoomLevel >= 400}
                className="p-1"
              />
            </div>

            <ToolbarButton
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              icon={<Menu className="w-4 h-4" />}
              title="Más opciones"
              active={showMobileMenu}
            />
          </div>
        </div>

        {/* Mobile expanded menu */}
        {showMobileMenu && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg border space-y-2">
            {/* Row 1: Element Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-600 font-medium">Elementos:</span>
                <ToolbarButton
                  onClick={onDelete}
                  icon={<Trash2 className="w-3 h-3" />}
                  title="Eliminar"
                  disabled={!hasSelection}
                  variant="warning"
                  className="p-1"
                />
              </div>
            </div>

            {/* Row 2: Paper Format & Orientation */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 font-medium">Formato:</span>
              <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border text-xs">
                <FileText className="w-3 h-3 text-gray-600" />
                <select
                  value={paperFormat}
                  onChange={(e) => handlePaperFormatChange(e.target.value)}
                  className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none"
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
              
              {/* Orientation Toggle - Mobile */}
              <ToolbarButton
                onClick={onOrientationToggle}
                icon={<RotateCw className="w-3 h-3" />}
                title={orientation === 'portrait' ? "Cambiar a horizontal" : "Cambiar a vertical"}
                className="p-1"
              />
            </div>

            {/* Row 3: View & Connect */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-600 font-medium">Vista:</span>
                <ToolbarButton
                  onClick={onToggleGrid}
                  icon={<Grid3X3 className="w-3 h-3" />}
                  title="Grilla"
                  active={gridVisible}
                  className="p-1"
                />
                <ToolbarButton
                  onClick={onToggleRulers}
                  icon={<Ruler className="w-3 h-3" />}
                  title="Reglas"
                  active={rulersVisible}
                  className="p-1"
                />
              </div>

              {/* Botón de exportar eliminado por solicitud del usuario */}
            </div>
          </div>
        )}
      </div>

      {/* Desktop view - hidden on high zoom */}
      <div className="hidden xl:block">
        <div className="flex items-center justify-between min-w-0">
          {/* Left side - File operations */}
          <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
            <ToolbarButton
              onClick={onSave}
              icon={<Save className="w-4 h-4" />}
              title={isSaving ? "Guardando plantilla y generando preview..." : "Guardar plantilla"}
              disabled={isSaving}
              variant="success"
            />

            {/* Template Title Editor */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors min-w-0 max-w-[250px] 2xl:max-w-[300px]">
              <span className="text-xs text-gray-500 font-medium flex-shrink-0">Título:</span>
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                placeholder="Nombre de la plantilla..."
                className="bg-transparent text-sm font-medium text-gray-700 border-none focus:outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded min-w-0 flex-1 transition-all"
                title={`Nombre de la plantilla (${localTitle.length}/100 caracteres)`}
                maxLength={100}
              />
              {hasUnsavedChanges && (
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse flex-shrink-0" title="Cambios sin guardar" />
              )}
            </div>
            
            <ToolbarButton
              onClick={onPreview}
              icon={<Eye className="w-4 h-4" />}
              title="Vista previa"
              variant="primary"
            />
            
            {/* Botón de exportar eliminado por solicitud del usuario */}

            <Separator />

            {/* Element operations */}
            <ToolbarButton
              onClick={onDelete}
              icon={<Trash2 className="w-4 h-4" />}
              title="Eliminar elemento"
              disabled={!hasSelection}
              variant="warning"
            />
          </div>

          {/* Center - Paper Format and Zoom controls */}
          <div className="flex items-center space-x-3 min-w-0 flex-shrink">
            {/* Paper Format Selector */}
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border min-w-0">
              <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <select
                value={paperFormat}
                onChange={(e) => handlePaperFormatChange(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none min-w-0"
                title="Formato de papel"
              >
                {availablePaperFormats.map(format => (
                  <option key={format.id} value={format.id}>
                    {format.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500 hidden 2xl:inline flex-shrink-0">
                {getFormatDescription()}
              </span>
              
              {/* Orientation Toggle - Desktop */}
              <div className="w-px h-4 bg-gray-300 mx-2" />
              <button
                onClick={onOrientationToggle}
                title={orientation === 'portrait' ? "Cambiar a horizontal" : "Cambiar a vertical"}
                className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-gray-200 flex-shrink-0"
              >
                <RotateCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <Separator />

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-gray-50 px-2 py-2 rounded-lg border">
              <ToolbarButton
                onClick={onZoomOut}
                icon={<ZoomOut className="w-4 h-4" />}
                title="Reducir zoom"
                disabled={zoomLevel <= 25}
                className="p-1.5"
              />
              
              <button
                onClick={onZoomReset}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors min-w-[60px]"
                title="Restablecer zoom"
              >
                {Math.round(zoomLevel)}%
              </button>
              
              <ToolbarButton
                onClick={onZoomIn}
                icon={<ZoomIn className="w-4 h-4" />}
                title="Aumentar zoom"
                disabled={zoomLevel >= 400}
                className="p-1.5"
              />
            </div>
          </div>

          {/* Right side - View and connectivity */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* View controls */}
            <ToolbarButton
              onClick={onToggleGrid}
              icon={<Grid3X3 className="w-4 h-4" />}
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


          </div>
        </div>
      </div>



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