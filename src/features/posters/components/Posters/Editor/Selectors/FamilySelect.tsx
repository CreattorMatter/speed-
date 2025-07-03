import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check } from 'lucide-react';
import { PosterFamilyData } from '../../../../../../services/posterTemplateService';

interface FamilySelectProps {
  families: PosterFamilyData[];
  selectedFamily: PosterFamilyData | null;
  onFamilySelect: (family: PosterFamilyData) => void;
  isLoading: boolean;
}

export const FamilySelect: React.FC<FamilySelectProps> = ({
  families,
  selectedFamily,
  onFamilySelect,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredFamilies = useMemo(() => {
    if (!searchTerm) return families;
    return families.filter(family =>
      family.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [families, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (family: PosterFamilyData) => {
    onFamilySelect(family);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center justify-between w-full p-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
      >
        {isLoading ? (
          <span className="text-gray-500">Cargando familias...</span>
        ) : selectedFamily ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedFamily.icon}</span>
            <div className="text-left">
              <span className="font-semibold text-gray-800">{selectedFamily.displayName}</span>
              <span className="text-sm text-gray-500 ml-2">{selectedFamily.templates.length} plantillas</span>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Selecciona una familia</span>
        )}
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl"
          >
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar familia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
            <ul className="py-1 max-h-60 overflow-auto">
              {filteredFamilies.length > 0 ? (
                filteredFamilies.map(family => (
                  <li key={family.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(family)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{family.icon}</span>
                        <div>
                          <span className="font-medium text-gray-800">{family.displayName}</span>
                          <span className="text-sm text-gray-500 ml-2">{family.templates.length} plantillas</span>
                        </div>
                      </div>
                      {selectedFamily?.id === family.id && (
                        <Check className="w-5 h-5 text-indigo-600" />
                      )}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-gray-500 text-center">No se encontraron familias.</li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 