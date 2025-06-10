import React, { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FIELD_CATEGORIES, PromotionField, FieldCategory } from '../../types/fields';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  Info, 
  Link,
  Eye,
  EyeOff,
  Settings,
  Database,
  Edit3,
  Lock
} from 'lucide-react';

interface AdvancedFieldsPanelProps {
  selectedTemplate?: string;
  onFieldSelect?: (field: PromotionField) => void;
}

interface DraggableFieldProps {
  field: PromotionField;
  isCompatible: boolean;
}

const DraggableField: React.FC<DraggableFieldProps> = ({ field, isCompatible }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `field-${field.id}`,
    data: {
      type: 'field',
      field
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'SAP': return <Database size={12} className="text-blue-600" />;
      case 'SPID': return <Settings size={12} className="text-green-600" />;
      case 'Manual': return <Edit3 size={12} className="text-orange-600" />;
      case 'Macro': return <Lock size={12} className="text-gray-600" />;
      default: return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative bg-white border rounded-lg p-3 cursor-move transition-all duration-200
        ${isDragging ? 'opacity-50 shadow-lg scale-105' : 'hover:shadow-md'}
        ${isCompatible 
          ? 'border-green-200 hover:border-green-400 bg-green-50' 
          : 'border-gray-200 hover:border-blue-400'
        }
        ${!field.editable ? 'bg-gray-50' : ''}
      `}
      {...listeners}
      {...attributes}
    >
      {/* Header del campo */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg" title={field.grupo}>
            {field.icono}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {field.etiqueta}
            </h4>
            <div className="flex items-center gap-1 mt-1">
              {getSourceIcon(field.fuente)}
              <span className={`
                text-xs px-1.5 py-0.5 rounded
                ${field.fuente === 'SAP' ? 'bg-blue-100 text-blue-700' :
                  field.fuente === 'SPID' ? 'bg-green-100 text-green-700' :
                  field.fuente === 'Manual' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'}
              `}>
                {field.fuente}
              </span>
              <span className={`
                text-xs px-1.5 py-0.5 rounded ml-1
                ${field.tipo === 'moneda' ? 'bg-emerald-100 text-emerald-700' :
                  field.tipo === 'numero' ? 'bg-blue-100 text-blue-700' :
                  field.tipo === 'texto' ? 'bg-purple-100 text-purple-700' :
                  field.tipo === 'fecha' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'}
              `}>
                {field.tipo}
              </span>
            </div>
          </div>
        </div>
        
        {/* Indicadores */}
        <div className="flex flex-col gap-1">
          {!field.editable && (
            <Lock size={12} className="text-gray-400" title="Solo lectura" />
          )}
          {field.dependencias.length > 0 && (
            <Link size={12} className="text-blue-400" title={`Depende de: ${field.dependencias.join(', ')}`} />
          )}
          {isCompatible && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Compatible con plantilla actual" />
          )}
        </div>
      </div>

      {/* Descripción */}
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
        {field.tooltip}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
          {field.grupo}
        </span>
        {field.validacion?.required && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
            Requerido
          </span>
        )}
        {field.valor_defecto && (
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
            Por defecto
          </span>
        )}
      </div>

      {/* Indicador de arrastre */}
      <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 rounded-lg pointer-events-none" />
      
      {/* Tooltip extendido en hover */}
      <div className="absolute left-full top-0 ml-2 w-80 bg-black bg-opacity-90 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <div className="font-semibold mb-1">{field.etiqueta}</div>
        <div className="text-gray-300 mb-2">{field.logica}</div>
        
        {field.dependencias.length > 0 && (
          <div className="mb-2">
            <span className="font-medium">Dependencias:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {field.dependencias.map(dep => (
                <span key={dep} className="bg-blue-600 px-1.5 py-0.5 rounded text-xs">
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {field.requerido_en_plantillas.length > 0 && (
          <div>
            <span className="font-medium">Plantillas compatibles:</span>
            <div className="text-gray-300 mt-1">
              {field.requerido_en_plantillas.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdvancedFieldsPanel: React.FC<AdvancedFieldsPanelProps> = ({ 
  selectedTemplate, 
  onFieldSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['precio', 'producto']) // Expandidas por defecto
  );
  const [showOnlyCompatible, setShowOnlyCompatible] = useState(false);

  const filteredFields = useMemo(() => {
    let fields = [...FIELD_CATEGORIES];

    // Filtrar por búsqueda
    if (searchTerm) {
      fields = fields.map(category => ({
        ...category,
        campos: category.campos.filter(field =>
          field.etiqueta.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.grupo.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.campos.length > 0);
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      fields = fields.filter(category => category.id === selectedCategory);
    }

    // Filtrar por compatibilidad con plantilla
    if (showOnlyCompatible && selectedTemplate) {
      fields = fields.map(category => ({
        ...category,
        campos: category.campos.filter(field =>
          field.requerido_en_plantillas.includes(selectedTemplate)
        )
      })).filter(category => category.campos.length > 0);
    }

    return fields;
  }, [searchTerm, selectedCategory, showOnlyCompatible, selectedTemplate]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const isFieldCompatible = (field: PromotionField) => {
    if (!selectedTemplate) return true;
    return field.requerido_en_plantillas.includes(selectedTemplate);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <h3 className="font-semibold text-gray-900 mb-3">
          Campos de Promoción
        </h3>
        
        {/* Barra de búsqueda */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar campos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las categorías</option>
            {FIELD_CATEGORIES.map(category => (
              <option key={category.id} value={category.id}>
                {category.icono} {category.nombre}
              </option>
            ))}
          </select>
          
          {selectedTemplate && (
            <button
              onClick={() => setShowOnlyCompatible(!showOnlyCompatible)}
              className={`
                text-xs px-3 py-1 rounded transition-colors flex items-center gap-1
                ${showOnlyCompatible 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
                }
              `}
            >
              {showOnlyCompatible ? <Eye size={12} /> : <EyeOff size={12} />}
              Solo compatibles
            </button>
          )}
        </div>

        {/* Info de plantilla seleccionada */}
        {selectedTemplate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="text-xs font-medium text-blue-900">
              Plantilla: {selectedTemplate}
            </div>
            <div className="text-xs text-blue-700 mt-1">
              {filteredFields.reduce((acc, cat) => acc + cat.campos.length, 0)} campos disponibles
            </div>
          </div>
        )}
      </div>

      {/* Lista de campos */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredFields.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-sm">No se encontraron campos</div>
            <div className="text-xs text-gray-400 mt-1">
              Prueba ajustando los filtros de búsqueda
            </div>
          </div>
        ) : (
          filteredFields.map(category => (
            <div key={category.id} className="bg-white rounded-lg border">
              {/* Header de categoría */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icono}</span>
                  <div className="text-left">
                    <div className="font-medium text-sm text-gray-900">
                      {category.nombre}
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.descripcion} ({category.campos.length})
                    </div>
                  </div>
                </div>
                {expandedCategories.has(category.id) ? (
                  <ChevronDown size={16} className="text-gray-400" />
                ) : (
                  <ChevronRight size={16} className="text-gray-400" />
                )}
              </button>

              {/* Campos de la categoría */}
              {expandedCategories.has(category.id) && (
                <div className="border-t bg-gray-50 p-3 space-y-2">
                  {category.campos.map(field => (
                    <DraggableField
                      key={field.id}
                      field={field}
                      isCompatible={isFieldCompatible(field)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer con tips */}
      <div className="p-4 bg-white border-t text-xs text-gray-500">
        <div className="flex items-center gap-1 mb-1">
          <Info size={12} />
          <span className="font-medium">Tips:</span>
        </div>
        <div className="space-y-1">
          <div>• Arrastra campos al canvas para agregarlos</div>
          <div>• Los campos verdes son compatibles con tu plantilla</div>
          <div>• Usa el filtro para encontrar campos específicos</div>
        </div>
      </div>
    </div>
  );
}; 