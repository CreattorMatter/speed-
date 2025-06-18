import React from 'react';
import { Search } from 'lucide-react';

interface PosterEditorHeaderProps {
  onSearchPosters: () => void;
}

export const PosterEditorHeader: React.FC<PosterEditorHeaderProps> = ({
  onSearchPosters
}) => {
  return (
    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4 mb-4 xs:mb-6 sm:mb-8">
      <h2 className="text-lg xs:text-xl sm:text-2xl font-medium text-gray-900">
        Editor de Carteles
      </h2>
      
      <button
        onClick={onSearchPosters}
        className="px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 
                  text-white text-sm xs:text-base font-medium hover:from-indigo-600 hover:to-indigo-700 
                  transition-all flex items-center gap-1.5 xs:gap-2 shadow-md w-full xs:w-auto justify-center"
      >
        <Search className="w-4 h-4 xs:w-5 xs:h-5" />
        <span className="xs:inline">Buscar Cartel</span>
      </button>
    </div>
  );
}; 