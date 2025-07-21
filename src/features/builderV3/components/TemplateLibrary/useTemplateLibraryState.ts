// =====================================
// TEMPLATE LIBRARY STATE HOOK - BuilderV3
// =====================================

import { useState, useMemo } from 'react';
import { FamilyV3, TemplateV3, BuilderStateV3 } from '../../types';
import { TemplateLibraryState, TemplateCategory } from './types';

interface UseTemplateLibraryStateProps {
  family: FamilyV3;
  templates: TemplateV3[];
}

export const useTemplateLibraryState = ({
  family,
  templates
}: UseTemplateLibraryStateProps) => {
  
  // =====================
  // STATE MANAGEMENT
  // =====================
  
  const [state, setState] = useState<TemplateLibraryState>({
    // Search and filters
    searchTerm: '',
    selectedCategory: 'all',
    viewMode: 'grid',
    sortBy: 'updated',
    
    // Preview modal
    showPreviewModal: false,
    previewTemplate: null,
    previewState: null,
    
    // Template actions
    isDuplicating: false,
    showDeleteModal: false,
    templateToDelete: null,
    isDeleting: false,
  });

  // =====================
  // CATEGORIES COMPUTATION
  // =====================
  
  const categories: TemplateCategory[] = useMemo(() => [
    { id: 'all', label: 'Todas', count: templates.length },
    { id: 'featured', label: 'Destacadas', count: family.featuredTemplates.length },
    { id: 'recent', label: 'Recientes', count: templates.filter(t => t.lastUsed).length },
    { id: 'custom', label: 'Personalizadas', count: templates.filter(t => t.category === 'custom').length }
  ], [templates, family.featuredTemplates]);

  // =====================
  // FILTERED & SORTED TEMPLATES
  // =====================
  
  const filteredTemplates = useMemo(() => {
    return templates
      .filter(template => {
        // Defensive programming - evitar errores con campos undefined
        const templateName = template.name || '';
        const templateDescription = template.description || '';
        const templateTags = template.tags || [];
        
        const matchesSearch = templateName.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                             templateDescription.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                             templateTags.some(tag => (tag || '').toLowerCase().includes(state.searchTerm.toLowerCase()));
        
        const matchesCategory = state.selectedCategory === 'all' || 
                               (state.selectedCategory === 'featured' && family.featuredTemplates.includes(template.id)) ||
                               (state.selectedCategory === 'recent' && template.lastUsed) ||
                               template.category === state.selectedCategory;
        
        return matchesSearch && matchesCategory && template.isActive;
      })
      .sort((a, b) => {
        switch (state.sortBy) {
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
  }, [templates, family.featuredTemplates, state.searchTerm, state.selectedCategory, state.sortBy]);

  // =====================
  // PREVIEW STATE BUILDER
  // =====================
  
  const createPreviewState = (template: TemplateV3): BuilderStateV3 => {
    return {
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
  };

  // =====================
  // STATE UPDATERS
  // =====================
  
  const updateState = (updates: Partial<TemplateLibraryState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setSearchTerm = (searchTerm: string) => {
    updateState({ searchTerm });
  };

  const setSelectedCategory = (selectedCategory: string) => {
    updateState({ selectedCategory });
  };

  const setViewMode = (viewMode: 'grid' | 'list') => {
    updateState({ viewMode });
  };

  const setSortBy = (sortBy: 'name' | 'created' | 'updated' | 'usage') => {
    updateState({ sortBy });
  };

  const setPreviewModal = (template: TemplateV3 | null) => {
    if (template) {
      const previewState = createPreviewState(template);
      updateState({
        showPreviewModal: true,
        previewTemplate: template,
        previewState
      });
    } else {
      updateState({
        showPreviewModal: false,
        previewTemplate: null,
        previewState: null
      });
    }
  };

  const setDeleteModal = (template: TemplateV3 | null) => {
    updateState({
      showDeleteModal: !!template,
      templateToDelete: template
    });
  };

  const setIsDuplicating = (isDuplicating: boolean) => {
    updateState({ isDuplicating });
  };

  const setIsDeleting = (isDeleting: boolean) => {
    updateState({ isDeleting });
  };

  // =====================
  // DATE FORMATTER
  // =====================
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return {
    // State
    state,
    
    // Computed values
    categories,
    filteredTemplates,
    
    // State updaters
    setSearchTerm,
    setSelectedCategory,
    setViewMode,
    setSortBy,
    setPreviewModal,
    setDeleteModal,
    setIsDuplicating,
    setIsDeleting,
    
    // Utils
    formatDate,
    createPreviewState
  };
}; 