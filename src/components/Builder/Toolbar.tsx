import React from 'react';
import { Eye, Save, Loader2, Search, Wand2 } from 'lucide-react';

interface ToolbarProps {
  onSave: () => void;
  onPreview: () => void;
  onSearch: () => void;
  onGenerateAI: () => void;
  isSaving: boolean;
}

export default function Toolbar({ onSave, onPreview, onSearch, onGenerateAI, isSaving }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-4">
        <button
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isSaving}
        >
          <Eye className="w-4 h-4" />
          Vista previa
        </button>
        <button
          onClick={onSearch}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isSaving}
        >
          <Search className="w-4 h-4" />
          Buscar plantilla
        </button>
        <button
          onClick={onGenerateAI}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md hover:from-purple-700 hover:to-indigo-700"
          disabled={isSaving}
        >
          <Wand2 className="w-4 h-4" />
          Plantilla AI
        </button>
      </div>
      <button
        onClick={onSave}
        disabled={isSaving}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-all ${
          isSaving 
            ? 'bg-indigo-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Guardar
          </>
        )}
      </button>
    </div>
  );
}