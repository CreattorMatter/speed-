// ===============================================
// TOOLBAR COMPONENT
// ===============================================

import React from 'react';
import { BuilderState } from '../../../types/builder-v2';
import { 
  Save, 
  Eye, 
  Download,
  Undo,
  Redo,
  Play,
  FileImage,
  FileDown,
  Share2,
  Settings
} from 'lucide-react';

interface ToolbarProps {
  state: BuilderState;
  onSave: () => void;
  onPreview: () => void;
  onExport: (format: 'png' | 'jpg' | 'pdf' | 'svg') => void;
  onUndo: () => void;
  onRedo: () => void;
  onGeneratePreview: () => void;
  isLoading?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  state,
  onSave,
  onPreview,
  onExport,
  onUndo,
  onRedo,
  onGeneratePreview,
  isLoading = false
}) => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left Section - History & Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!state.canvas.canUndo || isLoading}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Deshacer"
        >
          <Undo className="w-5 h-5" />
        </button>
        
        <button
          onClick={onRedo}
          disabled={!state.canvas.canRedo || isLoading}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Rehacer"
        >
          <Redo className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={onGeneratePreview}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Generar vista previa"
        >
          <Play className="w-4 h-4" />
          <span className="text-sm font-medium">Vista previa</span>
        </button>
      </div>

      {/* Center Section - Project Info */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {state.currentFamily?.displayName || 'Sin familia seleccionada'}
          </div>
          {state.currentTemplate && (
            <div className="text-xs text-gray-500">
              {state.currentTemplate.name}
            </div>
          )}
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center gap-2 ml-6">
          {state.hasUnsavedChanges && (
            <div className="w-2 h-2 bg-orange-400 rounded-full" title="Cambios sin guardar" />
          )}
          
          {state.isSaving && (
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" title="Guardando..." />
          )}
          
          {state.isExporting && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Exportando..." />
          )}
          
          {state.errors.length > 0 && (
            <div className="w-2 h-2 bg-red-400 rounded-full" title={`${state.errors.length} errores`} />
          )}
        </div>
      </div>

      {/* Right Section - Save & Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={state.isSaving || isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            state.hasUnsavedChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Save className="w-4 h-4" />
          <span>{state.isSaving ? 'Guardando...' : 'Guardar'}</span>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={onPreview}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Vista previa completa"
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Previsualizar</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative group">
          <button
            disabled={isLoading || state.elements.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exportar"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Exportar</span>
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <button
                onClick={() => onExport('png')}
                disabled={state.isExporting}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <FileImage className="w-4 h-4 text-blue-500" />
                Exportar como PNG
                <span className="ml-auto text-xs text-gray-500">Alta calidad</span>
              </button>
              
              <button
                onClick={() => onExport('jpg')}
                disabled={state.isExporting}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <FileImage className="w-4 h-4 text-green-500" />
                Exportar como JPG
                <span className="ml-auto text-xs text-gray-500">Comprimido</span>
              </button>
              
              <button
                onClick={() => onExport('pdf')}
                disabled={state.isExporting}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <FileDown className="w-4 h-4 text-red-500" />
                Exportar como PDF
                <span className="ml-auto text-xs text-gray-500">Impresión</span>
              </button>
              
              <button
                onClick={() => onExport('svg')}
                disabled={state.isExporting}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <Share2 className="w-4 h-4 text-purple-500" />
                Exportar como SVG
                <span className="ml-auto text-xs text-gray-500">Vector</span>
              </button>
            </div>
            
            <div className="border-t border-gray-200 py-2">
              <div className="px-4 py-2">
                <div className="text-xs text-gray-500 mb-2">Configuración de exportación:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Calidad:</span>
                    <span className="ml-1 font-medium">{state.exportConfig.quality}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">DPI:</span>
                    <span className="ml-1 font-medium">{state.exportConfig.resolution}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 