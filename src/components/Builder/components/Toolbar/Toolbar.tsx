import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCanvasConfig,
  selectCurrentTool,
  selectCanUndo,
  selectCanRedo,
  selectCurrentTemplate,
  setZoom,
  setCurrentTool,
  toggleGrid,
  toggleRulers,
  toggleSnapToGrid,
  setCanvasFormat,
  undo,
  redo,
  clearCanvas,
  DEFAULT_PAPER_FORMATS,
  PaperFormat
} from '../../redux/builderSlice';

// ====================================
// TIPOS Y INTERFACES
// ====================================

interface ToolbarProps {
  className?: string;
  onSave?: () => void;
  onExport?: () => void;
  onPreview?: () => void;
}

interface ToolButtonProps {
  icon: string;
  tooltip: string;
  isActive?: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

interface ZoomControlProps {
  value: number;
  onChange: (zoom: number) => void;
}

// ====================================
// COMPONENTES AUXILIARES
// ====================================

const ToolButton: React.FC<ToolButtonProps> = ({ 
  icon, 
  tooltip, 
  isActive = false, 
  onClick, 
  variant = 'secondary',
  disabled = false 
}) => {
  const baseClasses = `
    flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-200
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
  `;
  
  const variantClasses = {
    primary: isActive 
      ? 'bg-blue-500 border-blue-500 text-white shadow-lg' 
      : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300',
    secondary: isActive 
      ? 'bg-gray-800 border-gray-800 text-white shadow-lg' 
      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
    danger: isActive 
      ? 'bg-red-500 border-red-500 text-white shadow-lg' 
      : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300'
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
      title={tooltip}
      disabled={disabled}
    >
      <span className="text-lg">{icon}</span>
    </button>
  );
};

const ZoomControl: React.FC<ZoomControlProps> = ({ value, onChange }) => {
  const zoomLevels = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5];
  
  const handleZoomIn = () => {
    const currentIndex = zoomLevels.findIndex(level => level >= value);
    const nextIndex = Math.min(currentIndex + 1, zoomLevels.length - 1);
    onChange(zoomLevels[nextIndex]);
  };

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.findIndex(level => level >= value);
    const prevIndex = Math.max(currentIndex - 1, 0);
    onChange(zoomLevels[prevIndex]);
  };

  const handleZoomReset = () => {
    onChange(1);
  };

  return (
    <div className="flex items-center space-x-1 bg-white border border-gray-300 rounded-lg px-2 py-1">
      <button
        onClick={handleZoomOut}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
        title="Alejar"
        disabled={value <= 0.25}
      >
        <span className="text-sm">➖</span>
      </button>
      
      <button
        onClick={handleZoomReset}
        className="min-w-[60px] px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="Restablecer zoom (100%)"
      >
        {Math.round(value * 100)}%
      </button>
      
      <button
        onClick={handleZoomIn}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
        title="Acercar"
        disabled={value >= 5}
      >
        <span className="text-sm">➕</span>
      </button>
    </div>
  );
};

const FormatSelector: React.FC<{ 
  value: PaperFormat; 
  onChange: (format: PaperFormat) => void; 
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="Formato de papel"
      >
        <span className="text-sm">📄</span>
        <span className="text-xs font-medium text-gray-700">{value.name}</span>
        <span className="text-xs text-gray-500">
          {value.width}×{value.height}{value.unit}
        </span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
            {DEFAULT_PAPER_FORMATS.map((format) => (
              <button
                key={format.id}
                onClick={() => {
                  onChange(format);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  value.id === format.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{format.name}</div>
                <div className="text-xs text-gray-500">
                  {format.width} × {format.height} {format.unit} • {format.orientation}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ====================================
// COMPONENTE PRINCIPAL
// ====================================

const Toolbar: React.FC<ToolbarProps> = ({ 
  className = '', 
  onSave, 
  onExport, 
  onPreview 
}) => {
  const dispatch = useDispatch();
  
  // Selectores Redux
  const canvasConfig = useSelector(selectCanvasConfig);
  const currentTool = useSelector(selectCurrentTool);
  const canUndo = useSelector(selectCanUndo);
  const canRedo = useSelector(selectCanRedo);
  const currentTemplate = useSelector(selectCurrentTemplate);

  // Estado local
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Handlers
  const handleToolChange = (tool: 'select' | 'pan' | 'zoom') => {
    dispatch(setCurrentTool(tool));
  };

  const handleClearCanvas = () => {
    if (confirm('¿Estás seguro de que quieres limpiar el canvas? Esta acción no se puede deshacer.')) {
      dispatch(clearCanvas());
    }
  };

  return (
    <div className={`toolbar bg-white border-b border-gray-200 ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* SECCIÓN IZQUIERDA - Información del template */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🏷️</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                {currentTemplate.name}
              </h3>
              <p className="text-xs text-gray-500">
                Editor de Carteles • {new Date().toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN CENTRAL - Herramientas principales */}
        <div className="flex items-center space-x-6">
          {/* Herramientas de selección */}
          <div className="flex items-center space-x-2">
            <ToolButton
              icon="🖱️"
              tooltip="Herramienta de selección"
              isActive={currentTool === 'select'}
              onClick={() => handleToolChange('select')}
              variant="primary"
            />
            <ToolButton
              icon="✋"
              tooltip="Herramienta de panorámica"
              isActive={currentTool === 'pan'}
              onClick={() => handleToolChange('pan')}
              variant="primary"
            />
            <ToolButton
              icon="🔍"
              tooltip="Herramienta de zoom"
              isActive={currentTool === 'zoom'}
              onClick={() => handleToolChange('zoom')}
              variant="primary"
            />
          </div>

          {/* Separador */}
          <div className="w-px h-8 bg-gray-300" />

          {/* Historial */}
          <div className="flex items-center space-x-2">
            <ToolButton
              icon="↶"
              tooltip="Deshacer (Ctrl+Z)"
              onClick={() => dispatch(undo())}
              disabled={!canUndo}
              variant="secondary"
            />
            <ToolButton
              icon="↷"
              tooltip="Rehacer (Ctrl+Y)"
              onClick={() => dispatch(redo())}
              disabled={!canRedo}
              variant="secondary"
            />
          </div>

          {/* Separador */}
          <div className="w-px h-8 bg-gray-300" />

          {/* Controles de vista */}
          <div className="flex items-center space-x-2">
            <ToolButton
              icon="📏"
              tooltip="Mostrar/ocultar reglas"
              isActive={canvasConfig.showRulers}
              onClick={() => dispatch(toggleRulers())}
              variant="secondary"
            />
            <ToolButton
              icon="⚏"
              tooltip="Mostrar/ocultar grilla"
              isActive={canvasConfig.showGrid}
              onClick={() => dispatch(toggleGrid())}
              variant="secondary"
            />
            <ToolButton
              icon="🧲"
              tooltip="Ajustar a grilla"
              isActive={canvasConfig.snapToGrid}
              onClick={() => dispatch(toggleSnapToGrid())}
              variant="secondary"
            />
          </div>

          {/* Separador */}
          <div className="w-px h-8 bg-gray-300" />

          {/* Zoom */}
          <ZoomControl
            value={canvasConfig.zoom}
            onChange={(zoom) => dispatch(setZoom(zoom))}
          />

          {/* Formato de papel */}
          <FormatSelector
            value={canvasConfig.format}
            onChange={(format) => dispatch(setCanvasFormat(format))}
          />
        </div>

        {/* SECCIÓN DERECHA - Acciones principales */}
        <div className="flex items-center space-x-3">
          {/* Acciones secundarias */}
          <div className="flex items-center space-x-2">
            <ToolButton
              icon="👁️"
              tooltip="Vista previa"
              onClick={onPreview || (() => {})}
              variant="secondary"
            />
            <ToolButton
              icon="🗑️"
              tooltip="Limpiar canvas"
              onClick={handleClearCanvas}
              variant="danger"
            />
          </div>

          {/* Separador */}
          <div className="w-px h-8 bg-gray-300" />

          {/* Acciones principales */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              💾 Guardar
            </button>
            <button
              onClick={onExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              📤 Exportar
            </button>
          </div>

          {/* Menú de opciones adicionales */}
          <div className="relative">
            <ToolButton
              icon="⚙️"
              tooltip="Más opciones"
              isActive={showMoreOptions}
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              variant="secondary"
            />

            {showMoreOptions && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMoreOptions(false)}
                />
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        // Lógica de configuraciones
                        setShowMoreOptions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      ⚙️ Configuraciones
                    </button>
                    <button
                      onClick={() => {
                        // Lógica de ayuda
                        setShowMoreOptions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      ❓ Ayuda
                    </button>
                    <button
                      onClick={() => {
                        // Lógica de atajos de teclado
                        setShowMoreOptions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      ⌨️ Atajos de teclado
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Barra secundaria con información adicional */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>
            📏 Canvas: {canvasConfig.format.width}×{canvasConfig.format.height}{canvasConfig.format.unit}
          </span>
          <span>
            🔍 Zoom: {Math.round(canvasConfig.zoom * 100)}%
          </span>
          <span>
            🧲 Grilla: {canvasConfig.gridSize}px
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>
            📝 Herramienta: {
              currentTool === 'select' ? 'Selección' :
              currentTool === 'pan' ? 'Panorámica' :
              currentTool === 'zoom' ? 'Zoom' : 'Desconocida'
            }
          </span>
          {currentTemplate.tags.length > 0 && (
            <span>
              🏷️ Tags: {currentTemplate.tags.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar; 