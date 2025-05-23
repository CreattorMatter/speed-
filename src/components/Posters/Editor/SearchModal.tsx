import React from 'react';
import { Search } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearch: (term: string) => void;
  searchResults: Array<{
    name: string;
    url: string;
    created_at: string;
  }>;
  onPosterSelect: (poster: { name: string; url: string }) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  searchTerm,
  onSearch,
  searchResults,
  onPosterSelect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Carteles Guardados
            </h3>
            <button
              onClick={() => {
                onClose();
                onSearch("");
              }}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg
                className="w-5 h-5"
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
          
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Buscar cartel por nombre..."
                className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            {searchResults.map((poster, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => onPosterSelect(poster)}
              >
                <img
                  src={poster.url}
                  alt={poster.name}
                  className="w-full h-48 object-contain mb-3 bg-gray-50 rounded"
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {poster.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(poster.created_at).toLocaleDateString()}
                  </p>
                  <button
                    className="mt-2 w-full px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 
                              bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                  >
                    Editar Cartel
                  </button>
                </div>
              </div>
            ))}
            {searchResults.length === 0 && (
              <div className="col-span-4 text-center py-12">
                <p className="text-gray-500">
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