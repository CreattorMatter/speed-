import React, { useState } from 'react';
import { PromotionFamily, PromotionFamilyConfig } from './types/promotion';
import { FAMILY_TEMPLATE_COMPATIBILITY } from './types/promotion';

interface PromotionFamilySelectorProps {
  onSelect: (family: PromotionFamily) => void;
  selectedFamily?: PromotionFamily;
}

const FAMILY_CONFIGS: Record<PromotionFamily, PromotionFamilyConfig> = {
  'Superprecio': {
    id: 'Superprecio',
    nombre: 'Superprecio',
    descripcion: 'Promociones de precios especiales',
    plantillas_compatibles: FAMILY_TEMPLATE_COMPATIBILITY['Superprecio'],
    campos_disponibles: [],
    imagen_preview: '/images/families/superprecio.png'
  },
  'Feria de descuentos': {
    id: 'Feria de descuentos',
    nombre: 'Feria de descuentos',
    descripcion: 'Eventos de descuentos especiales',
    plantillas_compatibles: FAMILY_TEMPLATE_COMPATIBILITY['Feria de descuentos'],
    campos_disponibles: [],
    imagen_preview: '/images/families/feria.png'
  },
  // ... Agregar configuraciones para otras familias
};

export const PromotionFamilySelector: React.FC<PromotionFamilySelectorProps> = ({
  onSelect,
  selectedFamily
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFamilies = Object.values(FAMILY_CONFIGS).filter(family =>
    family.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Seleccionar Familia de Promoción
        </h2>
        <input
          type="text"
          placeholder="Buscar familia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFamilies.map((family) => (
          <div
            key={family.id}
            onClick={() => onSelect(family.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedFamily === family.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              {family.imagen_preview && (
                <img
                  src={family.imagen_preview}
                  alt={family.nombre}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <h3 className="font-medium text-gray-900">{family.nombre}</h3>
                <p className="text-sm text-gray-500">{family.descripcion}</p>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    {family.plantillas_compatibles.length} plantillas disponibles
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 