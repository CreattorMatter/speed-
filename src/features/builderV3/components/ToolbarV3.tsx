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
  Info,
  Calendar,
  PanelLeft,
  PanelRight,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react';
// import { CustomPaperFormatModal } from './CustomPaperFormatModal';
import { ValidityPeriodModal } from './ValidityPeriodModal';

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
  // onCustomPaperFormat?: (width: number, height: number) => void;
  onToggleCanvasInfo?: () => void;
  onTitleChange: (title: string) => void;
  onOrientationToggle: () => void;
  onValidityPeriodChange?: (validityPeriod: { startDate: string; endDate: string; enabled: boolean }) => void;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
  
  hasSelection?: boolean;
  gridVisible?: boolean;
  rulersVisible?: boolean;
  showCanvasInfo?: boolean;
  zoomLevel?: number;
  isSaving?: boolean;
  paperFormat?: string;
  // customWidth?: number;
  // customHeight?: number;
  templateTitle?: string;
  hasUnsavedChanges?: boolean;
  orientation?: 'portrait' | 'landscape';
  validityPeriod?: { startDate: string; endDate: string; enabled: boolean };
  leftPanelOpen?: boolean;
  rightPanelOpen?: boolean;
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
  // onCustomPaperFormat,
  onToggleCanvasInfo,
  onTitleChange,
  onOrientationToggle,
  onValidityPeriodChange,
  onToggleLeftPanel,
  onToggleRightPanel,
  
  hasSelection = false,
  gridVisible = false,
  rulersVisible = false,
  showCanvasInfo = false,
  zoomLevel = 100,
  isSaving = false,
  paperFormat = 'A4',
  // customWidth = 210,
  // customHeight = 297,
  templateTitle = 'Nueva Plantilla Sin Título',
  hasUnsavedChanges = false,
  orientation = 'portrait',
  validityPeriod,
  leftPanelOpen = true,
  rightPanelOpen = true,
  availablePaperFormats = [
    { id: 'A2', name: 'A2', width: 420, height: 594, description: '420 x 594 mm' },
    { id: 'A3', name: 'A3', width: 297, height: 420, description: '297 x 420 mm' },
    { id: 'A4', name: 'A4', width: 210, height: 297, description: '210 x 297 mm' },
    { id: 'LETTER', name: 'Carta', width: 216, height: 279, description: '8.5 x 11 in' },
    // { id: 'CUSTOM', name: 'Personalizado', width: 0, height: 0, description: 'Dimensiones personalizadas' }
  ]
}) => {
  // const [showCustomModal, setShowCustomModal] = useState(false);
  const [showValidityModal, setShowValidityModal] = useState(false);
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
    onPaperFormatChange(format);
  };

  // const handleCustomPaperFormat = (width: number, height: number) => {
  //   if (onCustomPaperFormat) {
  //     onCustomPaperFormat(width, height);
  //   }
  //   setShowCustomModal(false);
  // };

  const handleValidityPeriodChange = (newValidityPeriod: { startDate: string; endDate: string; enabled: boolean }) => {
    if (onValidityPeriodChange) {
      onValidityPeriodChange(newValidityPeriod);
    }
    setShowValidityModal(false);
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

  // Descripción dinámica para formato actual
  const getFormatDescription = () => {
    return currentPaperFormat.description;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 overflow-x-auto scrollbar-custom">
      {/* Mobile view for very small screens */}
      <div className="block sm:hidden">
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

      {/* Compact view - Icons only (optimized for zoom and medium screens) */}
      <div className="hidden sm:block 2xl:hidden">
        <div className="flex items-center justify-between min-w-max gap-x-1 whitespace-nowrap">
          {/* Ultra compact - Only essential buttons */}
          <div className="flex items-center space-x-1 flex-shrink-0">
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
            <ToolbarButton
              onClick={onDelete}
              icon={<Trash2 className="w-4 h-4" />}
              title="Eliminar"
              disabled={!hasSelection}
              variant="warning"
            />
          </div>

          {/* Template title - ultra minimal */}
          <div className="flex-1 min-w-0 max-w-[150px] lg:max-w-[200px] mx-1">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              placeholder="Título..."
              className="w-full px-1 py-1 text-xs lg:text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 truncate"
              title={`Nombre: ${localTitle}`}
              maxLength={100}
            />
          </div>

          {/* Essential controls only */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* Paper format - solo ícono */}
            <div className="flex items-center bg-gray-50 px-1 py-0.5 rounded border">
              <FileText className="w-4 h-4 text-gray-600 mr-1" />
              <select
                value={paperFormat}
                onChange={(e) => handlePaperFormatChange(e.target.value)}
                className="bg-transparent text-xs focus:outline-none max-w-[50px]"
                title={`Formato de papel: ${currentPaperFormat.name} (${currentPaperFormat.description})`}
              >
                {availablePaperFormats.map(format => (
                  <option key={format.id} value={format.id}>
                    {format.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vigencia - solo ícono */}
            <div className="flex items-center bg-gray-50 px-1 py-0.5 rounded border">
              <Calendar className="w-4 h-4 text-gray-600" />
              <button
                onClick={() => setShowValidityModal(true)}
                className="ml-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                title={validityPeriod?.enabled 
                  ? `Vigencia configurada: ${validityPeriod.startDate} - ${validityPeriod.endDate}` 
                  : "Configurar fecha de vigencia"}
              >
                {validityPeriod?.enabled ? (
                  <span className="text-green-600 font-medium">✓</span>
                ) : (
                  <span className="text-gray-500">--</span>
                )}
              </button>
            </div>

            {/* Zoom - ultra compact */}
            <div className="flex items-center bg-gray-50 px-0.5 py-0.5 rounded border">
              <ToolbarButton
                onClick={onZoomOut}
                icon={<ZoomOut className="w-3 h-3" />}
                title="Zoom -"
                disabled={zoomLevel <= 25}
                className="p-0.5"
              />
              <span className="text-xs px-0.5 min-w-[30px] lg:min-w-[35px] text-center">{Math.round(zoomLevel)}%</span>
              <ToolbarButton
                onClick={onZoomIn}
                icon={<ZoomIn className="w-3 h-3" />}
                title="Zoom +"
                disabled={zoomLevel >= 400}
                className="p-0.5"
              />
            </div>

            {/* Panel toggles - ultra compact */}
            {onToggleLeftPanel && (
              <ToolbarButton
                onClick={onToggleLeftPanel}
                icon={leftPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                title={leftPanelOpen ? "Ocultar panel componentes" : "Mostrar panel componentes"}
                active={leftPanelOpen}
              />
            )}
            
            {onToggleRightPanel && (
              <ToolbarButton
                onClick={onToggleRightPanel}
                icon={rightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
                title={rightPanelOpen ? "Ocultar panel propiedades" : "Mostrar panel propiedades"}
                active={rightPanelOpen}
              />
            )}

            {/* View controls - icons only */}
            <ToolbarButton
              onClick={onToggleGrid}
              icon={<Grid3X3 className="w-4 h-4" />}
              title="Grilla"
              active={gridVisible}
            />
            <ToolbarButton
              onClick={onToggleRulers}
              icon={<Ruler className="w-4 h-4" />}
              title="Reglas"
              active={rulersVisible}
            />
          </div>
        </div>
      </div>

      {/* Full desktop view - Only for very large screens without zoom */}
      <div className="hidden 2xl:block">
        <div className="flex items-center justify-between min-w-max gap-x-2 whitespace-nowrap">
          {/* Left side - File operations */}
          <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
            <ToolbarButton
              onClick={onSave}
              icon={<Save className="w-4 h-4" />}
              title={isSaving ? "Guardando plantilla y generando preview..." : "Guardar plantilla"}
              disabled={isSaving}
              variant="success"
            />

            {/* Template Title Editor - Responsive */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors min-w-0 max-w-[200px] xl:max-w-[280px] 2xl:max-w-[320px]">
              <span className="text-xs text-gray-500 font-medium flex-shrink-0 hidden xl:inline">Título:</span>
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
          </div>

          {/* Center-Left - Element operations */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Separator />
            <ToolbarButton
              onClick={onDelete}
              icon={<Trash2 className="w-4 h-4" />}
              title="Eliminar elemento seleccionado"
              disabled={!hasSelection}
              variant="warning"
            />
            <Separator />
          </div>

          {/* Center - Paper Format and Validity - Siempre visible */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Paper Format Selector - Compacto pero siempre visible */}
            <div className="flex items-center bg-gray-50 px-1.5 py-1.5 rounded-lg border min-w-0">
              <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <select
                value={paperFormat}
                onChange={(e) => handlePaperFormatChange(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none ml-1 max-w-[50px]"
                title={`Formato de papel: ${currentPaperFormat.name} (${currentPaperFormat.description})`}
              >
                {availablePaperFormats.map(format => (
                  <option key={format.id} value={format.id}>
                    {format.name}
                  </option>
                ))}
              </select>
              
              {/* Orientation Toggle */}
              <div className="w-px h-3 bg-gray-300 mx-1.5 flex-shrink-0" />
              <button
                onClick={onOrientationToggle}
                title={orientation === 'portrait' ? "Cambiar a horizontal" : "Cambiar a vertical"}
                className="p-0.5 rounded transition-colors duration-200 hover:bg-gray-200 flex-shrink-0"
              >
                <RotateCw className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>

            {/* Validity Period Selector - Compacto pero siempre visible */}
            <div className="flex items-center bg-gray-50 px-1.5 py-1.5 rounded-lg border flex-shrink-0">
              <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <button
                onClick={() => setShowValidityModal(true)}
                className="ml-1 text-xs text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
                title={validityPeriod?.enabled 
                  ? `Vigencia configurada: ${validityPeriod.startDate} - ${validityPeriod.endDate}` 
                  : "Configurar fecha de vigencia"}
              >
                {validityPeriod?.enabled ? (
                  <span className="text-green-600 font-medium">✓</span>
                ) : (
                  <span className="text-gray-500">--</span>
                )}
              </button>
            </div>
          </div>

          {/* Center-Right - Zoom Controls - Compacto */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <Separator />
            <div className="flex items-center space-x-0.5 bg-gray-50 px-1.5 py-1.5 rounded-lg border">
              <ToolbarButton
                onClick={onZoomOut}
                icon={<ZoomOut className="w-3.5 h-3.5" />}
                title="Reducir zoom"
                disabled={zoomLevel <= 25}
                className="p-1"
              />
              
              <button
                onClick={onZoomReset}
                className="px-1.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors min-w-[40px] flex-shrink-0"
                title="Restablecer zoom"
              >
                {Math.round(zoomLevel)}%
              </button>
              
              <ToolbarButton
                onClick={onZoomIn}
                icon={<ZoomIn className="w-3.5 h-3.5" />}
                title="Aumentar zoom"
                disabled={zoomLevel >= 400}
                className="p-1"
              />
            </div>
            <Separator />
          </div>

          {/* Right side - Panel and View controls - Compacto */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {/* Panel toggles */}
            {onToggleLeftPanel && (
              <ToolbarButton
                onClick={onToggleLeftPanel}
                icon={leftPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                title={leftPanelOpen ? "Ocultar panel de componentes" : "Mostrar panel de componentes"}
                active={leftPanelOpen}
                className="p-1.5"
              />
            )}
            
            {onToggleRightPanel && (
              <ToolbarButton
                onClick={onToggleRightPanel}
                icon={rightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
                title={rightPanelOpen ? "Ocultar panel de propiedades" : "Mostrar panel de propiedades"}
                active={rightPanelOpen}
                className="p-1.5"
              />
            )}

            <Separator />

            {/* View controls */}
            <ToolbarButton
              onClick={onToggleGrid}
              icon={<Grid3X3 className="w-4 h-4" />}
              title={gridVisible ? "Ocultar grilla" : "Mostrar grilla"}
              active={gridVisible}
              className="p-1.5"
            />
            
            <ToolbarButton
              onClick={onToggleRulers}
              icon={<Ruler className="w-4 h-4" />}
              title={rulersVisible ? "Ocultar reglas" : "Mostrar reglas"}
              active={rulersVisible}
              className="p-1.5"
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
      {/* Modal de formato personalizado eliminado */}

      {/* Validity Period Modal */}
      <ValidityPeriodModal
        isOpen={showValidityModal}
        onClose={() => setShowValidityModal(false)}
        onConfirm={handleValidityPeriodChange}
        currentValidityPeriod={validityPeriod}
      />
    </div>
  );
}; 