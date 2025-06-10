// ===============================================
// FAMILY SELECTOR COMPONENT
// ===============================================

import React, { useState } from 'react';
import { FamilyConfig, FamilyType } from '../../../types/builder-v2';
import { Search, ChevronRight } from 'lucide-react';

interface FamilySelectorProps {
  families: FamilyConfig[];
  onFamilySelect: (familyType: FamilyType) => void;
  selectedFamily?: FamilyType;
}

export const FamilySelector: React.FC<FamilySelectorProps> = ({
  families,
  onFamilySelect,
  selectedFamily
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFamilies = families.filter(family =>
    family.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    family.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Constructor de Carteles Promocionales
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Selecciona una familia de promoción para comenzar
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Cada familia contiene plantillas específicamente diseñadas para diferentes tipos 
            de promociones y campañas de retail.
          </p>
        </div>

        {/* Buscador */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar familia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Grid de familias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFamilies.map((family) => (
            <div
              key={family.id}
              onClick={() => onFamilySelect(family.name)}
              className={`group relative bg-white rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedFamily === family.name
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Imagen de header si existe */}
              {family.headerImage && (
                <div className="h-32 bg-gray-100 rounded-t-xl overflow-hidden">
                  <img
                    src={family.headerImage}
                    alt={family.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}

              {/* Contenido */}
              <div className="p-6">
                {/* Icono y color de familia */}
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: family.color }}
                  >
                    {family.icon}
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>

                {/* Título y descripción */}
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {family.displayName}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {family.description}
                </p>

                {/* Información adicional */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>
                      {family.compatibleTemplates.length} plantillas
                    </span>
                    <span>
                      {family.recommendedElements.length} elementos
                    </span>
                  </div>
                </div>

                {/* Plantillas destacadas */}
                {family.featuredTemplates.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Plantillas destacadas:</p>
                    <div className="flex flex-wrap gap-1">
                      {family.featuredTemplates.slice(0, 2).map((template, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {template}
                        </span>
                      ))}
                      {family.featuredTemplates.length > 2 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{family.featuredTemplates.length - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Overlay para selección */}
              {selectedFamily === family.name && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-xl pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        {/* Mensaje si no hay resultados */}
        {filteredFamilies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron familias
            </h3>
            <p className="text-gray-500">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {families.length}
              </div>
              <div className="text-sm text-gray-600">
                Familias disponibles
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {families.reduce((sum, family) => sum + family.compatibleTemplates.length, 0)}
              </div>
              <div className="text-sm text-gray-600">
                Plantillas totales
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {families.reduce((sum, family) => sum + family.recommendedElements.length, 0)}
              </div>
              <div className="text-sm text-gray-600">
                Elementos disponibles
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 