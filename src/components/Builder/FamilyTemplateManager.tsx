import React, { useState } from 'react';
import { Plus, Copy, Folder, FileText, Star, Calendar, Users } from 'lucide-react';
import { PromotionFamily, TemplateType, FAMILY_TEMPLATE_COMPATIBILITY } from './types/promotion';

interface FamilyTemplateManagerProps {
  selectedFamily: PromotionFamily | null;
  selectedTemplate: TemplateType | null;
  isCreatingNew: boolean;
  onFamilySelect: (family: PromotionFamily) => void;
  onTemplateSelect: (template: TemplateType) => void;
  onCreateNew: () => void;
  onMigrateTemplate?: (sourceFamily: PromotionFamily, targetFamily: PromotionFamily, template: TemplateType) => void;
}

const familyDetails = {
  'Superprecio': {
    description: 'Promociones de precios especiales',
    color: 'bg-blue-500',
    icon: '💰',
    templates: 3
  },
  'Feria de descuentos': {
    description: 'Eventos de descuentos especiales',
    color: 'bg-red-500',
    icon: '🎪',
    templates: 3
  },
  'Financiación': {
    description: 'Opciones de financiamiento',
    color: 'bg-green-500',
    icon: '💳',
    templates: 2
  },
  'Troncales': {
    description: 'Productos principales',
    color: 'bg-purple-500',
    icon: '🏪',
    templates: 2
  },
  'Nuevo': {
    description: 'Productos nuevos',
    color: 'bg-yellow-500',
    icon: '✨',
    templates: 2
  },
  'Temporada': {
    description: 'Ofertas estacionales',
    color: 'bg-orange-500',
    icon: '🌟',
    templates: 3
  },
  'Oportuneasy': {
    description: 'Ofertas especiales Easy',
    color: 'bg-cyan-500',
    icon: '🎯',
    templates: 3
  },
  'Precios que la rompen': {
    description: 'Precios increíbles',
    color: 'bg-pink-500',
    icon: '💥',
    templates: 3
  },
  'Ladrillazos': {
    description: 'Ofertas de construcción',
    color: 'bg-amber-600',
    icon: '🧱',
    templates: 3
  },
  'Herramientas': {
    description: 'Equipos y herramientas',
    color: 'bg-gray-600',
    icon: '🔧',
    templates: 3
  },
  'Club Easy': {
    description: 'Beneficios exclusivos',
    color: 'bg-indigo-500',
    icon: '👥',
    templates: 3
  },
  'Cencopay': {
    description: 'Pagos y financiamiento',
    color: 'bg-teal-500',
    icon: '💎',
    templates: 2
  },
  'Mundo Experto': {
    description: 'Asesoría profesional',
    color: 'bg-emerald-500',
    icon: '🎓',
    templates: 2
  }
};

export const FamilyTemplateManager: React.FC<FamilyTemplateManagerProps> = ({
  selectedFamily,
  selectedTemplate,
  isCreatingNew,
  onFamilySelect,
  onTemplateSelect,
  onCreateNew,
  onMigrateTemplate
}) => {
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  if (!selectedFamily) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Constructor de Plantillas de Promociones
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              Selecciona una familia para comenzar
            </p>
            <p className="text-gray-500">
              Puedes crear nuevas plantillas o editar las existentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(familyDetails).map(([family, details]) => (
              <div
                key={family}
                onClick={() => onFamilySelect(family as PromotionFamily)}
                className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${details.color} rounded-full flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    {details.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {family}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {details.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{details.templates} plantillas</span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedTemplate && !isCreatingNew) {
    const familyInfo = familyDetails[selectedFamily];
    const availableTemplates = FAMILY_TEMPLATE_COMPATIBILITY[selectedFamily] || [];

    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${familyInfo.color} rounded-full flex items-center justify-center text-white text-xl`}>
                {familyInfo.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedFamily}
                </h2>
                <p className="text-gray-600">{familyInfo.description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCreateNew}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Nueva Plantilla
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {availableTemplates.map((template) => (
              <div
                key={template}
                onClick={() => onTemplateSelect(template)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {template}
                      </h3>
                      <p className="text-sm text-gray-500">Plantilla base</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <Copy size={14} className="text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>Última edición: Hace 2 días</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users size={12} />
                    <span>Usado en 15 promociones</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sección de migración de plantillas */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Migrar Plantillas
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Quieres usar una plantilla de otra familia como base? Puedes migrar plantillas existentes y adaptarlas para {selectedFamily}.
            </p>
            <button
              onClick={() => setShowMigrationModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Copy size={16} />
              <span>Migrar Plantilla</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FamilyTemplateManager; 