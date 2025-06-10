// =====================================
// TEMPLATE LIBRARY V3 - COMPONENT
// =====================================

import React, { useState, useCallback } from 'react';
import { FamilyV3, TemplateV3 } from '../../../types/builder-v3';
import { 
  Search,
  Filter,
  Plus,
  Star,
  Clock,
  Eye,
  Copy,
  Edit,
  Trash2,
  Grid,
  List,
  ArrowRight
} from 'lucide-react';

interface TemplateLibraryV3Props {
  family: FamilyV3;
  templates: TemplateV3[];
  onTemplateSelect: (templateId: string) => void;
  onTemplateCreate: () => void;
  userRole: 'admin' | 'limited';
}

export const TemplateLibraryV3: React.FC<TemplateLibraryV3Props> = ({
  family,
  templates,
  onTemplateSelect,
  onTemplateCreate,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'usage'>('updated');

  // Filtrar y ordenar plantillas
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || 
                             (selectedCategory === 'featured' && family.featuredTemplates.includes(template.id)) ||
                             (selectedCategory === 'recent' && template.lastUsed) ||
                             template.category === selectedCategory;
      
      return matchesSearch && matchesCategory && template.isActive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'usage':
          return (b.lastUsed ? new Date(b.lastUsed).getTime() : 0) - 
                 (a.lastUsed ? new Date(a.lastUsed).getTime() : 0);
        default:
          return 0;
      }
    });

  // Categorías disponibles
  const categories = [
    { id: 'all', label: 'Todas', count: templates.length },
    { id: 'featured', label: 'Destacadas', count: family.featuredTemplates.length },
    { id: 'recent', label: 'Recientes', count: templates.filter(t => t.lastUsed).length },
    { id: 'custom', label: 'Personalizadas', count: templates.filter(t => t.category === 'custom').length }
  ];

  const handleTemplateClick = useCallback((template: TemplateV3) => {
    onTemplateSelect(template.id);
  }, [onTemplateSelect]);

  const handleTemplatePreview = useCallback((template: TemplateV3, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementar preview
    console.log('Preview template:', template.id);
  }, []);

  const handleTemplateDuplicate = useCallback((template: TemplateV3, e: React.MouseEvent) => {
    e.stopPropagation();
    // Implementar duplicación
    console.log('Duplicate template:', template.id);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderTemplateCard = (template: TemplateV3) => (
    <div
      key={template.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer overflow-hidden"
      onClick={() => handleTemplateClick(template)}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {template.thumbnail ? (
          <img 
            src={template.thumbnail} 
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                <Edit className="w-8 h-8" />
              </div>
              <div className="text-sm font-medium">Sin vista previa</div>
            </div>
          </div>
        )}
        
        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
            <button
              onClick={(e) => handleTemplatePreview(template, e)}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-lg transition-colors"
              title="Vista previa"
            >
              <Eye className="w-4 h-4" />
            </button>
            {userRole === 'admin' && (
              <button
                onClick={(e) => handleTemplateDuplicate(template, e)}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-lg transition-colors"
                title="Duplicar"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex space-x-2">
          {family.featuredTemplates.includes(template.id) && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>Destacada</span>
            </div>
          )}
          {template.lastUsed && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Reciente</span>
            </div>
          )}
        </div>

        {/* Dimensiones */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {template.canvas.width} × {template.canvas.height}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  +{template.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metadatos */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            Actualizada {formatDate(template.updatedAt)}
          </div>
          <div className="flex items-center space-x-1">
            <span>{template.defaultComponents.length}</span>
            <span>elementos</span>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="mt-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
            <span>Usar plantilla</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTemplateRow = (template: TemplateV3) => (
    <div
      key={template.id}
      className="bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => handleTemplateClick(template)}
    >
      <div className="p-4 flex items-center space-x-4">
        {/* Thumbnail pequeño */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {template.thumbnail ? (
            <img 
              src={template.thumbnail} 
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Edit className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Información */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-1">{template.description}</p>
              
              {/* Tags en línea */}
              {template.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.tags.slice(0, 2).map(tag => (
                    <span 
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right text-sm text-gray-500">
              <div>{template.canvas.width} × {template.canvas.height}</div>
              <div className="mt-1">{formatDate(template.updatedAt)}</div>
              <div className="mt-1">{template.defaultComponents.length} elementos</div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          {family.featuredTemplates.includes(template.id) && (
            <Star className="w-4 h-4 text-yellow-500" />
          )}
          
          <button
            onClick={(e) => handleTemplatePreview(template, e)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Vista previa"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {userRole === 'admin' && (
            <button
              onClick={(e) => handleTemplateDuplicate(template, e)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controles superiores */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Búsqueda */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar plantillas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtros y controles */}
          <div className="flex items-center space-x-4">
            {/* Filtro de categoría */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenamiento */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="updated">Más recientes</option>
              <option value="name">Nombre A-Z</option>
              <option value="created">Fecha de creación</option>
              <option value="usage">Más usadas</option>
            </select>

            {/* Vista */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                title="Vista de cuadrícula"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                title="Vista de lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Nuevo template */}
            <button
              onClick={onTemplateCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Plantillas Disponibles
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredTemplates.length} encontradas)
            </span>
          </h2>
        </div>

        {filteredTemplates.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map(renderTemplateCard)}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map(renderTemplateRow)}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Edit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron plantillas
              </h3>
              <p className="text-gray-500 mb-6">
                Intenta con diferentes términos de búsqueda o crea una nueva plantilla.
              </p>
              <button
                onClick={onTemplateCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Nueva Plantilla</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 