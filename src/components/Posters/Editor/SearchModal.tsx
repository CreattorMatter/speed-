import React from 'react';
import { Search } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';

// Importar selectores y acciones de Redux
import {
  selectIsSearchModalOpen,
  selectSearchTerm,
  selectSearchResults,
  setIsSearchModalOpen,
  setSearchTerm,
  setSearchResults,
  setSelectedPoster,
} from '../../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../../store';

interface SearchModalProps {
  onSearch: (term: string) => void;
  onPosterSelect: (poster: { name: string; url: string }) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  onSearch,
  onPosterSelect
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Obtener estado de Redux
  const isOpen = useSelector(selectIsSearchModalOpen);
  const searchTerm = useSelector(selectSearchTerm);
  const searchResults = useSelector(selectSearchResults);

  const handleClose = () => {
    dispatch(setIsSearchModalOpen(false));
    dispatch(setSearchTerm(""));
    onSearch("");
  };

  const handleSearch = (term: string) => {
    dispatch(setSearchTerm(term));
    onSearch(term);
  };

  const handlePosterSelect = (poster: { name: string; url: string }) => {
    onPosterSelect(poster);
    dispatch(setIsSearchModalOpen(false));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 xs:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-xs xs:max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="p-3 xs:p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-base xs:text-lg font-medium text-gray-900 truncate">
              Carteles Guardados
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 transition-colors p-1 ml-2 flex-shrink-0"
            >
              <svg
                className="w-4 h-4 xs:w-5 xs:h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          
          <div className="mt-3 xs:mt-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar cartel por nombre..."
                className="w-full px-3 xs:px-4 py-2 pl-8 xs:pl-10 pr-3 xs:pr-4 text-sm xs:text-base border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="w-4 h-4 xs:w-5 xs:h-5 text-gray-400 absolute left-2.5 xs:left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="p-3 xs:p-4 sm:p-6 max-h-[calc(95vh-12rem)] sm:max-h-[calc(90vh-12rem)] overflow-y-auto">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4">
            {searchResults.map((poster, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-2 xs:p-3 sm:p-4 hover:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => handlePosterSelect(poster)}
              >
                <img
                  src={poster.url}
                  alt={poster.name}
                  className="w-full h-32 xs:h-36 sm:h-48 object-contain mb-2 xs:mb-3 bg-gray-50 rounded"
                />
                <div className="space-y-1">
                  <p className="text-xs xs:text-sm font-medium text-gray-900 truncate">
                    {poster.name}
                  </p>
                  <p className="text-xxs xs:text-xs text-gray-500">
                    {new Date(poster.created_at).toLocaleDateString()}
                  </p>
                  <button
                    className="mt-1 xs:mt-2 w-full px-2 xs:px-3 py-1 xs:py-1.5 text-xxs xs:text-xs font-medium text-indigo-600 hover:text-indigo-700 
                              bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                  >
                    Editar Cartel
                  </button>
                </div>
              </div>
            ))}
            {searchResults.length === 0 && (
              <div className="col-span-full text-center py-8 xs:py-12">
                <p className="text-sm xs:text-base text-gray-500">
                  No se encontraron carteles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 