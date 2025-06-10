import React, { useState } from 'react';
import { PromotionFamily, TemplateType, PromotionTemplate } from './types/promotion';
import { FAMILY_TEMPLATE_COMPATIBILITY } from './types/promotion';

interface PromotionTemplateSelectorProps {
  selectedFamily: PromotionFamily;
  onSelect: (template: TemplateType) => void;
  selectedTemplate?: TemplateType;
}

const TEMPLATE_CONFIGS: Record<TemplateType, PromotionTemplate> = {
  'Precio Lleno': {
    id: 'precio-lleno',
    nombre: 'Precio Lleno',
    familia: 'Superprecio',
    descripcion: 'Muestra el precio final del producto',
    campos_requeridos: ['sku', 'precio_contado'],
    campos_opcionales: ['descripcion', 'imagen'],
    imagen_preview: '/images/templates/precio-lleno.png',
    configuracion: {
      width: 800,
      height: 600,
      background: '#ffffff'
    }
  },
  'Antes/Ahora': {
    id: 'antes-ahora',
    nombre: 'Antes/Ahora',
    familia: 'Superprecio',
    descripcion: 'Muestra el precio anterior y el precio actual',
    campos_requeridos: ['sku', 'precio_antes', 'precio_ahora'],
    campos_opcionales: ['descripcion', 'imagen', 'descuento'],
    imagen_preview: '/images/templates/antes-ahora.png',
    configuracion: {
      width: 800,
      height: 600,
      background: '#ffffff'
    }
  },
  // ... Agregar configuraciones para otras plantillas
};

export const PromotionTemplateSelector: React.FC<PromotionTemplateSelectorProps> = ({
  selectedFamily,
  onSelect,
  selectedTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const availableTemplates = FAMILY_TEMPLATE_COMPATIBILITY[selectedFamily];
  const filteredTemplates = availableTemplates.filter(template =>
    template.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Seleccionar Plantilla
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Plantillas disponibles para {selectedFamily}
        </p>
        <input
          type="text"
          placeholder="Buscar plantilla..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((templateType) => {
          const template = TEMPLATE_CONFIGS[templateType];
          return (
            <div
              key={template.id}
              onClick={() => onSelect(templateType)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedTemplate === templateType
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col">
                {template.imagen_preview && (
                  <img
                    src={template.imagen_preview}
                    alt={template.nombre}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                )}
                <h3 className="font-medium text-gray-900">{template.nombre}</h3>
                <p className="text-sm text-gray-500 mt-1">{template.descripcion}</p>
                <div className="mt-2">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Campos requeridos:</span>{' '}
                    {template.campos_requeridos.length}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Campos opcionales:</span>{' '}
                    {template.campos_opcionales.length}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 