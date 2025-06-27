import React from 'react';
import { Settings, Edit3, Eye } from 'lucide-react';

interface EditModeIndicatorProps {
  isActive: boolean;
  mode: 'floating' | 'sidebar' | 'hidden';
  onToggle: () => void;
  className?: string;
}

export const EditModeIndicator: React.FC<EditModeIndicatorProps> = ({
  isActive,
  mode,
  onToggle,
  className = ''
}) => {
  if (!isActive) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg border border-green-400">
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <Settings className="w-4 h-4" />
          <span>Modo Edición Activo</span>
          <div className="h-4 w-px bg-white/30 mx-1"></div>
          <span className="text-xs opacity-90">
            {mode === 'floating' ? '📋 Flotante' : mode === 'sidebar' ? '📌 Lateral' : '👁️ Oculto'}
          </span>
          <button
            onClick={onToggle}
            className="ml-2 hover:bg-white/20 rounded p-1 transition-colors"
            title="Cambiar modo"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModeIndicator; 