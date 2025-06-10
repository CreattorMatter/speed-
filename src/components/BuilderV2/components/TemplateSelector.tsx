// ===============================================
// TEMPLATE SELECTOR COMPONENT
// ===============================================

import React, { useState } from 'react';
import { FamilyConfig, TemplateType } from '../../../types/builder-v2';
import { Search, ChevronLeft, FileText, Sparkles, Zap, Clock } from 'lucide-react';

interface TemplateSelectorProps {
  family: FamilyConfig;
  onTemplateSelect: (templateType: TemplateType) => void;
  onBack: () => void;
  selectedTemplate?: TemplateType;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  family,
  onTemplateSelect,
  onBack,
  selectedTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = family.compatibleTemplates.filter(template =>
    template.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categorizar plantillas por tipo
  const templateCategories = {
    'Precios': ['Precio Lleno', 'Precio Lleno sin mensaje', 'Antes/Ahora', 'Antes/Ahora con dto'],
    'Flooring': ['Flooring', 'Antes/Ahora Flooring', 'Flooring en cuotas', 'Antes/Ahora Flooring con descuento', 'Flooring antes/ahora en cuotas'],
    'Combos': ['Combo', 'Combo Cuotas', 'Combo con Descuento', 'Combo Cuotas con Descuento'],
    'Promociones': ['Promo 3x2 con precio', 'Promo 3x2 plano categoría', 'Promo 3x2 plano categoría combinable', 'Descuento plano categoría', 'Descuento en la segunda unidad'],
    'Financiación': ['Cuotas', 'Antes/Ahora en cuotas', 'Antes/Ahora en cuotas con descuento', 'Cuota simple 12 s/int', 'Cuota simple 12 Antes/Ahora s/int c/desc'],
    'Especiales': ['Fleje promocional (SPID+)', 'Imágenes personalizadas']
  };

  const getTemplateCategory = (template: TemplateType): string => {
    for (const [category, templates] of Object.entries(templateCategories)) {
      if (templates.includes(template)) {
        return category;
      }
    }
    return 'Otros';
  };

  const getTemplateIcon = (template: TemplateType): React.ReactNode => {
    const category = getTemplateCategory(template);
    switch (category) {
      case 'Precios':
        return <Zap className="w-6 h-6" />;
      case 'Flooring':
        return <FileText className="w-6 h-6" />;
      case 'Combos':
        return <Sparkles className="w-6 h-6" />;
      case 'Promociones':
        return <Zap className="w-6 h-6" />;
      case 'Financiación':
        return <Clock className="w-6 h-6" />;
      case 'Especiales':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getTemplateDescription = (template: TemplateType): string => {
    const descriptions: Record<TemplateType, string> = {
      'Precio Lleno': 'Muestra el precio final del producto de manera destacada',
      'Antes/Ahora con dto': 'Compara el precio anterior con el actual, incluyendo descuento',
      'Antes/Ahora': 'Comparación simple entre precio anterior y actual',
      'Flooring': 'Específico para productos de pisos con precios por M² y caja',
      'Antes/Ahora Flooring': 'Comparación de precios para productos de flooring',
      'Flooring en cuotas': 'Productos de flooring con opciones de financiamiento',
      'Antes/Ahora en cuotas': 'Comparación de precios con financiamiento',
      'Combo': 'Promociones de productos combinados',
      'Combo Cuotas': 'Combos con opciones de financiamiento',
      'Promo 3x2 con precio': 'Promoción 3x2 mostrando precios unitarios',
      'Promo 3x2 plano categoría': 'Promoción 3x2 por categoría sin precios específicos',
      'Promo 3x2 plano categoría combinable': 'Promoción 3x2 combinable entre categorías',
      'Descuento plano categoría': 'Descuento aplicado a toda una categoría',
      'Descuento en la segunda unidad': 'Descuento especial en la segunda unidad',
      'Cuotas': 'Financiamiento básico en cuotas',
      'Antes/Ahora en cuotas con descuento': 'Comparación con financiamiento y descuento',
      'Antes/Ahora Flooring con descuento': 'Flooring con comparación y descuento',
      'Flooring antes/ahora en cuotas': 'Flooring con comparación y financiamiento',
      'Combo con Descuento': 'Combos con descuentos aplicados',
      'Combo Cuotas con Descuento': 'Combos con financiamiento y descuento',
      'Precio Lleno sin mensaje': 'Precio destacado con texto personalizable',
      'Fleje promocional (SPID+)': 'Promociones especiales con destaque SPID+',
      'Cuota simple 12 s/int': 'Financiamiento simple en 12 cuotas sin interés',
      'Cuota simple 12 Antes/Ahora s/int c/desc': 'Financiamiento con comparación y descuento',
      'Imágenes personalizadas': 'Plantilla totalmente personalizable con imágenes'
    };
    
    return descriptions[template] || 'Plantilla especializada para promociones';
  };

  const organizedTemplates = filteredTemplates.reduce((acc, template) => {
    const category = getTemplateCategory(template);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, TemplateType[]>);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: family.color }}
            >
              {family.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {family.displayName}
              </h1>
              <p className="text-gray-600">{family.description}</p>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar plantilla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
          <span>{filteredTemplates.length} plantillas disponibles</span>
          <span>{family.recommendedElements.length} elementos recomendados</span>
          {family.featuredTemplates.length > 0 && (
            <span>{family.featuredTemplates.length} plantillas destacadas</span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto p-6">
        {Object.keys(organizedTemplates).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron plantillas
            </h3>
            <p className="text-gray-500">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(organizedTemplates).map(([category, templates]) => (
              <div key={category}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  {category === 'Precios' && <Zap className="w-5 h-5 text-blue-500" />}
                  {category === 'Flooring' && <FileText className="w-5 h-5 text-green-500" />}
                  {category === 'Combos' && <Sparkles className="w-5 h-5 text-purple-500" />}
                  {category === 'Promociones' && <Zap className="w-5 h-5 text-red-500" />}
                  {category === 'Financiación' && <Clock className="w-5 h-5 text-orange-500" />}
                  {category === 'Especiales' && <Sparkles className="w-5 h-5 text-pink-500" />}
                  {category}
                  <span className="text-sm font-normal text-gray-500">
                    ({templates.length})
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template}
                      onClick={() => onTemplateSelect(template)}
                      className={`group bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedTemplate === template
                          ? 'border-blue-500 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Icono y estado */}
                      <div className="flex items-start justify-between mb-4">
                        <div 
                          className="p-3 rounded-lg group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${family.color}20`, color: family.color }}
                        >
                          {getTemplateIcon(template)}
                        </div>
                        
                        {family.featuredTemplates.includes(template) && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                            Destacada
                          </span>
                        )}
                      </div>

                      {/* Contenido */}
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {template}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {getTemplateDescription(template)}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Categoría: {category}</span>
                        {selectedTemplate === template && (
                          <span className="text-blue-600 font-medium">Seleccionada</span>
                        )}
                      </div>

                      {/* Overlay para selección */}
                      {selectedTemplate === template && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-xl pointer-events-none" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer con información adicional */}
      <div className="p-6 border-t bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold" style={{ color: family.color }}>
              {family.compatibleTemplates.length}
            </div>
            <div className="text-sm text-gray-600">
              Plantillas totales
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">
              {family.featuredTemplates.length}
            </div>
            <div className="text-sm text-gray-600">
              Plantillas destacadas
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {family.recommendedElements.length}
            </div>
            <div className="text-sm text-gray-600">
              Elementos recomendados
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 