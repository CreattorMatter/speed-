import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Toolbar from './components/Toolbar/Toolbar';
import Palette from './components/Palette/Palette';
import Canvas from './components/Canvas/Canvas';
import PropertiesPanel from './components/PropertiesPanel/PropertiesPanel';
import LayersPanel from './components/LayersPanel/LayersPanel';

// ====================================
// TIPOS Y INTERFACES
// ====================================

interface BuilderMainProps {
  className?: string;
  onSave?: (templateData: any) => void;
  onExport?: (exportData: any) => void;
  onPreview?: () => void;
  initialTemplate?: any;
}

interface PanelState {
  showPalette: boolean;
  showProperties: boolean;
  showLayers: boolean;
}

// ====================================
// COMPONENTE PRINCIPAL
// ====================================

const BuilderContent: React.FC<BuilderMainProps> = ({
  className = '',
  onSave,
  onExport,
  onPreview,
  initialTemplate
}) => {
  // Estado de paneles
  const [panelState, setPanelState] = useState<PanelState>({
    showPalette: true,
    showProperties: true,
    showLayers: true
  });

  // Estado de la interfaz
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S para guardar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave) onSave({});
      }
      
      // Ctrl/Cmd + E para exportar
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (onExport) onExport({});
      }
      
      // F11 para pantalla completa
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
      
      // F1 para alternar paleta
      if (e.key === 'F1') {
        e.preventDefault();
        setPanelState(prev => ({ ...prev, showPalette: !prev.showPalette }));
      }
      
      // F2 para alternar propiedades
      if (e.key === 'F2') {
        e.preventDefault();
        setPanelState(prev => ({ ...prev, showProperties: !prev.showProperties }));
      }
      
      // F3 para alternar capas
      if (e.key === 'F3') {
        e.preventDefault();
        setPanelState(prev => ({ ...prev, showLayers: !prev.showLayers }));
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [onSave, onExport, isFullscreen]);

  // Handlers
  const handleSave = () => {
    // Aquí se implementaría la lógica de guardado
    console.log('Guardando template...');
    if (onSave) {
      onSave({
        timestamp: new Date().toISOString(),
        // Aquí se incluirían los datos del Redux store
      });
    }
  };

  const handleExport = () => {
    // Aquí se implementaría la lógica de exportación
    console.log('Exportando cartel...');
    if (onExport) {
      onExport({
        timestamp: new Date().toISOString(),
        // Aquí se incluirían los datos del Redux store
      });
    }
  };

  const handlePreview = () => {
    // Aquí se implementaría la lógica de vista previa
    console.log('Mostrando vista previa...');
    if (onPreview) {
      onPreview();
    }
  };

  const togglePanel = (panel: keyof PanelState) => {
    setPanelState(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  // Calcular ancho disponible para el canvas
  const getCanvasWidth = () => {
    let width = '100%';
    if (panelState.showPalette && panelState.showProperties && panelState.showLayers) {
      width = 'calc(100% - 960px)'; // 320px * 3 paneles
    } else if ((panelState.showPalette && panelState.showProperties) || 
               (panelState.showPalette && panelState.showLayers) || 
               (panelState.showProperties && panelState.showLayers)) {
      width = 'calc(100% - 640px)'; // 320px * 2 paneles
    } else if (panelState.showPalette || panelState.showProperties || panelState.showLayers) {
      width = 'calc(100% - 320px)'; // 320px * 1 panel
    }
    return width;
  };

  return (
    <div className={`builder-main h-screen flex flex-col bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      {/* Toolbar */}
      <Toolbar
        onSave={handleSave}
        onExport={handleExport}
        onPreview={handlePreview}
        className="flex-shrink-0"
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Palette */}
        {panelState.showPalette && (
          <div className="flex-shrink-0 relative">
            <Palette className="h-full" />
            
            {/* Toggle button */}
            <button
              onClick={() => togglePanel('showPalette')}
              className="absolute top-2 right-2 w-6 h-6 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center z-10"
              title="Ocultar paleta (F1)"
            >
              <span className="text-xs">✕</span>
            </button>
          </div>
        )}

        {/* Center - Canvas Area */}
        <div 
          className="flex-1 flex flex-col relative"
          style={{ width: getCanvasWidth() }}
        >
          <Canvas className="flex-1" />
          
          {/* Floating panels toggle buttons when hidden */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2 z-20">
            {!panelState.showPalette && (
              <button
                onClick={() => togglePanel('showPalette')}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                title="Mostrar paleta (F1)"
              >
                <span className="text-lg">📝</span>
              </button>
            )}
          </div>

          <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
            {!panelState.showProperties && (
              <button
                onClick={() => togglePanel('showProperties')}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                title="Mostrar propiedades (F2)"
              >
                <span className="text-lg">⚙️</span>
              </button>
            )}
            
            {!panelState.showLayers && (
              <button
                onClick={() => togglePanel('showLayers')}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                title="Mostrar capas (F3)"
              >
                <span className="text-lg">📋</span>
              </button>
            )}
          </div>

          {/* Fullscreen toggle */}
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
              title={isFullscreen ? 'Salir de pantalla completa (F11)' : 'Pantalla completa (F11)'}
            >
              <span className="text-lg">{isFullscreen ? '🗗' : '🗖'}</span>
            </button>
          </div>
        </div>

        {/* Right Panels */}
        <div className="flex-shrink-0 flex">
          {/* Properties Panel */}
          {panelState.showProperties && (
            <div className="relative">
              <PropertiesPanel className="h-full" />
              
              {/* Toggle button */}
              <button
                onClick={() => togglePanel('showProperties')}
                className="absolute top-2 left-2 w-6 h-6 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center z-10"
                title="Ocultar propiedades (F2)"
              >
                <span className="text-xs">✕</span>
              </button>
            </div>
          )}

          {/* Layers Panel */}
          {panelState.showLayers && (
            <div className="relative">
              <LayersPanel className="h-full" />
              
              {/* Toggle button */}
              <button
                onClick={() => togglePanel('showLayers')}
                className="absolute top-2 left-2 w-6 h-6 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center z-10"
                title="Ocultar capas (F3)"
              >
                <span className="text-xs">✕</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex-shrink-0 bg-gray-800 text-white px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>🎨 Editor de Carteles Promocionales</span>
          <span>•</span>
          <span>Versión 2.0</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>F1: Paleta</span>
          <span>F2: Propiedades</span>
          <span>F3: Capas</span>
          <span>F11: Pantalla completa</span>
          <span>Ctrl+S: Guardar</span>
          <span>Ctrl+E: Exportar</span>
        </div>
      </div>

      {/* Loading overlay (si fuera necesario) */}
      {/* 
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span>Cargando...</span>
          </div>
        </div>
      )}
      */}
    </div>
  );
};

// ====================================
// WRAPPER CON PROVIDER
// ====================================

const BuilderMain: React.FC<BuilderMainProps> = (props) => {
  return (
    <Provider store={store}>
      <BuilderContent {...props} />
    </Provider>
  );
};

export default BuilderMain; 