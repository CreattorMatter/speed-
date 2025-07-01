// =====================================
// TEMPLATE LIBRARY V3 - COMPONENT
// =====================================

import React, { useState, useCallback } from 'react';
import { FamilyV3, TemplateV3, BuilderStateV3 } from '../types';
import { PreviewModalV3 } from './PreviewModalV3';
import { templatesV3Service } from '../../../services/builderV3Service';
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
  ArrowRight,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { BuilderTemplateRenderer } from '../../posters/components/Posters/Editor/Renderers/BuilderTemplateRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface TemplateLibraryV3Props {
  family: FamilyV3;
  templates: TemplateV3[];
  onTemplateSelect: (templateId: string) => void;
  onTemplateCreate: () => void;
  onTemplateDelete?: (templateId: string) => void;
  userRole: 'admin' | 'limited';
  onRefresh?: () => void; // Para refrescar la lista después de duplicar
}

export const TemplateLibraryV3: React.FC<TemplateLibraryV3Props> = ({
  family,
  templates,
  onTemplateSelect,
  onTemplateCreate,
  onTemplateDelete,
  userRole,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'usage'>('updated');
  
  // Estados para preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateV3 | null>(null);
  const [previewState, setPreviewState] = useState<BuilderStateV3 | null>(null);
  
  // Estados para duplicación
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  // Estados para eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<TemplateV3 | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtrar y ordenar plantillas
  const filteredTemplates = templates
    .filter(template => {
      // Defensive programming - evitar errores con campos undefined
      const templateName = template.name || '';
      const templateDescription = template.description || '';
      const templateTags = template.tags || [];
      
      const matchesSearch = templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           templateDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           templateTags.some(tag => (tag || '').toLowerCase().includes(searchTerm.toLowerCase()));
      
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
    
    // Crear un estado básico para la previsualización
    const previewBuilderState: BuilderStateV3 = {
      currentFamily: family,
      currentTemplate: template,
      components: template.defaultComponents || [],
      canvas: {
        // Vista y navegación
        zoom: 1,
        minZoom: 0.1,
        maxZoom: 5,
        panX: 0,
        panY: 0,
        
        // Herramientas activas
        activeTool: 'select',
        selectedComponentIds: [],
        
        // Configuración visual del canvas
        showGrid: false,
        gridSize: 20,
        gridColor: '#e5e5e5',
        showRulers: false,
        showGuides: false,
        guides: [],
        
        // Configuración de ajuste
        snapToGrid: false,
        snapToGuides: false,
        snapToObjects: false,
        snapTolerance: 5,
        
        // Configuración de selección
        selectionMode: 'single',
        selectionStyle: {
          strokeColor: '#2563eb',
          strokeWidth: 2,
          handleColor: '#2563eb',
          handleSize: 8
        },
        
        // Estado de navegación
        canUndo: false,
        canRedo: false,
        historyIndex: 0,
        maxHistorySize: 50
      },
      history: [],
      sapConnection: {
        isConnected: false
      },
      promotionConnection: {
        isConnected: false
      },
      exportConfig: {
        format: 'png',
        quality: 90,
        dpi: 300,
        includeBleed: false,
        bleedSize: 3,
        cropMarks: false,
        colorSpace: 'RGB'
      },
      ui: {
        leftPanelOpen: false,
        rightPanelOpen: false,
        bottomPanelOpen: false,
        activeLeftTab: 'components',
        activeRightTab: 'properties',
        activeBottomTab: 'preview'
      },
      isLoading: false,
      isSaving: false,
      isExporting: false,
      isConnecting: false,
      hasUnsavedChanges: false,
      errors: [],
      userPreferences: {
        autoSave: true,
        autoSaveInterval: 30000,
        gridSnap: false,
        showTooltips: true,
        theme: 'light',
        language: 'es'
      },
      componentsLibrary: {}
    };
    
    setPreviewTemplate(template);
    setPreviewState(previewBuilderState);
    setShowPreviewModal(true);
  }, [family]);

  const handleTemplateDuplicate = useCallback(async (template: TemplateV3, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isDuplicating) return; // Prevenir duplicaciones múltiples
    
    setIsDuplicating(true);
    
    try {
      // Generar nombre único para la copia
      const newName = `${template.name} - Copia`;
      
      // Duplicar la plantilla usando el servicio existente
      const duplicatedTemplate = await templatesV3Service.duplicate(template.id, newName);
      
      // Mostrar mensaje de éxito
      console.log('Plantilla duplicada exitosamente:', duplicatedTemplate.name);
      
      // Refrescar la lista para mostrar la nueva plantilla
      if (onRefresh) {
        onRefresh();
      }
      
      // Navegar directamente al constructor con la plantilla duplicada
      onTemplateSelect(duplicatedTemplate.id);
      
    } catch (error) {
      console.error('Error al duplicar plantilla:', error);
      alert('Error al duplicar la plantilla. Inténtalo de nuevo.');
    } finally {
      setIsDuplicating(false);
    }
  }, [isDuplicating, onTemplateSelect, onRefresh]);

  const handleTemplateDeleteClick = useCallback((template: TemplateV3, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!templateToDelete || isDeleting) return;

    setIsDeleting(true);

    try {
      // Eliminar usando el servicio
      await templatesV3Service.delete(templateToDelete.id);

      // Mostrar mensaje de éxito
      toast.success(`Plantilla "${templateToDelete.name}" eliminada exitosamente`);
      
      // Cerrar modal
      setShowDeleteModal(false);
      setTemplateToDelete(null);
      
      // Refrescar la lista para actualizar la vista
      if (onRefresh) {
        onRefresh();
      }

      // Llamar callback de eliminación si existe
      if (onTemplateDelete) {
        onTemplateDelete(templateToDelete.id);
      }
      
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      toast.error('Error al eliminar la plantilla. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  }, [templateToDelete, isDeleting, onRefresh, onTemplateDelete]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setTemplateToDelete(null);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreviewModal(false);
    setPreviewTemplate(null);
    setPreviewState(null);
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
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-200">
            {/* Marco tipo tablet con sombra */}
            <div className="w-40 h-32 bg-gray-800 rounded-lg p-2 shadow-2xl transform rotate-1 group-hover:rotate-0 transition-transform duration-300">
              <div className="w-full h-full bg-white rounded-md overflow-hidden shadow-inner relative">
                {/* Indicador de encendido */}
                <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                
                {/* Vista previa de la plantilla */}
                <div className="w-full h-full bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                  <div 
                    className="absolute inset-0 scale-[0.8] origin-center flex items-center justify-center"
                    style={{ filter: 'brightness(0.9)' }}
                  >
                    <BuilderTemplateRenderer
                      template={template}
                      components={template.defaultComponents}
                      isPreview={true}
                      scale={0.15}
                    />
                  </div>
                  
                  {/* Overlay con información */}
                  <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-60 text-white text-center py-1 rounded text-[0.5rem] font-bold">
                    {template.name.substring(0, 12)}...
                  </div>
                </div>
              </div>
            </div>
            
            {/* Elementos decorativos */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full opacity-70 animate-pulse"></div>
            <div className="absolute bottom-3 right-3 w-1 h-1 bg-green-400 rounded-full opacity-80"></div>
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
              <>
                <button
                  onClick={(e) => handleTemplateDuplicate(template, e)}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-lg transition-colors"
                  title="Duplicar"
                  disabled={isDuplicating}
                >
                  {isDuplicating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={(e) => handleTemplateDeleteClick(template, e)}
                  className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white p-2 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
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
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
            {/* Marco tipo smartphone pequeño */}
            <div className="w-8 h-10 bg-gray-800 rounded-md p-0.5 shadow-lg">
              <div className="w-full h-full bg-white rounded-sm overflow-hidden relative">
                {/* Vista previa mini */}
                <div className="w-full h-full bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center">
                  <div 
                    className="scale-[0.3] origin-center"
                    style={{ filter: 'brightness(0.8)' }}
                  >
                    <BuilderTemplateRenderer
                      template={template}
                      components={template.defaultComponents}
                      isPreview={true}
                      scale={0.08}
                    />
                  </div>
                </div>
              </div>
            </div>
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
            <>
              <button
                onClick={(e) => handleTemplateDuplicate(template, e)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Duplicar"
                disabled={isDuplicating}
              >
                {isDuplicating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={(e) => handleTemplateDeleteClick(template, e)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
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

            {/* Nuevo template - CTA principal */}
            <button
              onClick={onTemplateCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Plantilla</span>
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Nueva Plantilla</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && previewState !== null && (
        <PreviewModalV3
          isOpen={showPreviewModal}
          template={previewTemplate}
          state={previewState}
          onClose={handleClosePreview}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && templateToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Eliminar Plantilla
                    </h3>
                    <p className="text-sm text-gray-500">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {templateToDelete.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {templateToDelete.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {templateToDelete.defaultComponents.length} componentes
                    </span>
                    <span>
                      Actualizada {formatDate(templateToDelete.updatedAt)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  ¿Estás seguro de que quieres eliminar esta plantilla? 
                  Esta acción eliminará permanentemente la plantilla y todos sus componentes.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isDeleting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}; 