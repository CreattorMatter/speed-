// =====================================
// SPEED BUILDER V3 - STATUS BAR
// =====================================

import React from 'react';
import { 
  Layers, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Wifi, 
  WifiOff,
  MousePointer,
  Grid,
  Ruler
} from 'lucide-react';
import { BuilderStateV3 } from '../types';

interface StatusBarV3Props {
  state: BuilderStateV3;
  zoomLevel: number;
  mousePosition?: { x: number; y: number };
  isOnline?: boolean;
  lastSaved?: string;
  gridVisible?: boolean;
  rulersVisible?: boolean;
}

export const StatusBarV3: React.FC<StatusBarV3Props> = ({
  state,
  zoomLevel,
  mousePosition,
  isOnline = true,
  lastSaved,
  gridVisible = false,
  rulersVisible = false
}) => {
  const formatLastSaved = (timestamp?: string) => {
    if (!timestamp) return 'No guardado';
    
    const now = new Date();
    const savedTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - savedTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Guardado hace unos segundos';
    if (diffInMinutes < 60) return `Guardado hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Guardado hace ${diffInHours}h`;
    
    return `Guardado el ${savedTime.toLocaleDateString()}`;
  };

  const StatusItem: React.FC<{
    icon?: React.ReactNode;
    label: string;
    value?: string | number;
    color?: 'default' | 'success' | 'warning' | 'error';
  }> = ({ icon, label, value, color = 'default' }) => {
    const getColorStyles = () => {
      switch (color) {
        case 'success': return 'text-green-600';
        case 'warning': return 'text-yellow-600';
        case 'error': return 'text-red-600';
        default: return 'text-gray-600';
      }
    };

    return (
      <div className={`flex items-center space-x-1 text-xs ${getColorStyles()}`}>
        {icon}
        <span>{label}</span>
        {value && <span className="font-medium">: {value}</span>}
      </div>
    );
  };

  const Separator = () => (
    <div className="w-px h-4 bg-gray-300" />
  );

  return (
    <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs">
      <div className="flex items-center justify-between">
        {/* Left side - Document info */}
        <div className="flex items-center space-x-4">
          {/* Canvas info */}
          {state?.currentTemplate?.canvas && (
            <StatusItem
              icon={<Grid className="w-3 h-3" />}
              label="Canvas"
              value={`${state.currentTemplate.canvas.width} x ${state.currentTemplate.canvas.height}px`}
            />
          )}

          <Separator />

          {/* Components count */}
          <StatusItem
            icon={<Layers className="w-3 h-3" />}
            label="Componentes"
            value={state?.components?.length || 0}
          />

          <Separator />

          {/* Selection info */}
          {state?.canvas?.selectedComponentIds && state.canvas.selectedComponentIds.length > 0 && (
            <>
              <StatusItem
                icon={<MousePointer className="w-3 h-3" />}
                label="Seleccionados"
                value={state.canvas.selectedComponentIds.length}
                color="success"
              />
              <Separator />
            </>
          )}

          {/* Mouse position */}
          {mousePosition && (
            <>
              <StatusItem
                label="Posición"
                value={`${Math.round(mousePosition.x)}, ${Math.round(mousePosition.y)}`}
              />
              <Separator />
            </>
          )}

          {/* Zoom level */}
          <StatusItem
            label="Zoom"
            value={`${Math.round(zoomLevel)}%`}
          />
        </div>

        {/* Right side - Status indicators */}
        <div className="flex items-center space-x-4">
          {/* View options */}
          <div className="flex items-center space-x-2">
            {gridVisible && (
              <StatusItem
                icon={<Grid className="w-3 h-3" />}
                label="Grilla"
                color="success"
              />
            )}
            {rulersVisible && (
              <StatusItem
                icon={<Ruler className="w-3 h-3" />}
                label="Reglas"
                color="success"
              />
            )}
          </div>

          {(gridVisible || rulersVisible) && <Separator />}

          {/* Save status */}
          <StatusItem
            icon={state?.hasUnsavedChanges ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            label={formatLastSaved(lastSaved)}
            color={state?.hasUnsavedChanges ? 'warning' : 'default'}
          />

          <Separator />

          {/* Online status */}
          <StatusItem
            icon={isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            label={isOnline ? 'Online' : 'Offline'}
            color={isOnline ? 'success' : 'error'}
          />

          <Separator />

          {/* Current family */}
          {state?.currentFamily && (
            <StatusItem
              label="Familia"
              value={state.currentFamily.displayName}
            />
          )}
        </div>
      </div>

      {/* Warning indicators */}
      {(state?.hasUnsavedChanges || !isOnline) && (
        <div className="mt-1 flex items-center space-x-4 text-xs">
          {state?.hasUnsavedChanges && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <AlertCircle className="w-3 h-3" />
              <span>Cambios sin guardar</span>
            </div>
          )}
          {!isOnline && (
            <div className="flex items-center space-x-1 text-red-600">
              <WifiOff className="w-3 h-3" />
              <span>Sin conexión a internet</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 