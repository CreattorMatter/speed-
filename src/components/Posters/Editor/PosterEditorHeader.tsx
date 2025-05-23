import React from 'react';
import { Search } from 'lucide-react';

interface PosterEditorHeaderProps {
  onSearchPosters: () => void;
}

export const PosterEditorHeader: React.FC<PosterEditorHeaderProps> = ({
  onSearchPosters
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-8">
      <h2 className="text-2xl font-medium text-gray-900">
        Editor de Carteles
      </h2>
      
      <button
        onClick={onSearchPosters}
        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 
                  text-white font-medium hover:from-indigo-600 hover:to-indigo-700 
                  transition-all flex items-center gap-2 shadow-md"
      >
        <Search className="w-5 h-5" />
        Buscar Cartel
      </button>
    </div>
  );
}; 