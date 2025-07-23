// =====================================
// TEMPLATE LIBRARY V3 - MODULARIZED COMPONENT
// =====================================

import React from 'react';
import { PreviewModalV3 } from './PreviewModalV3';
import { useTemplateImageCache } from './TemplateLibrary/useImageCache';
import { 
  TemplateFilters,
  TemplateGrid,
  TemplateList,
  DeleteConfirmationModal,
  useTemplateLibraryState,
  useTemplateActions,
  TemplateLibraryProps
} from './TemplateLibrary';

export const TemplateLibraryV3: React.FC<TemplateLibraryProps> = ({
  family,
  templates,
  onTemplateSelect,
  onTemplateCreate,
  onTemplateDelete,
  userRole,
  onRefresh
}) => {
  
  // =====================
  // STATE MANAGEMENT
  // =====================
  
  const {
    state,
    categories,
    filteredTemplates,
    setSearchTerm,
    setSelectedCategory,
    setViewMode,
    setSortBy,
    setPreviewModal,
    setDeleteModal,
    setIsDuplicating,
    setIsDeleting
  } = useTemplateLibraryState({
    family,
    templates
  });

  // =====================
  // IMAGE CACHE OPTIMIZATION
  // =====================
  
  // Precargar thumbnails automáticamente
  useTemplateImageCache(templates);

  // =====================
  // TEMPLATE ACTIONS
  // =====================
  
  const {
    handleTemplateClick,
    handleTemplatePreview,
    handleTemplateDuplicate,
    handleTemplateDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleClosePreview
  } = useTemplateActions({
    family,
    onTemplateSelect,
    onTemplateDelete,
    onRefresh,
    isDuplicating: state.isDuplicating,
    setIsDuplicating,
    isDeleting: state.isDeleting,
    setIsDeleting,
    setPreviewModal,
    setDeleteModal,
    templateToDelete: state.templateToDelete
  });

  // =====================
  // MAIN RENDER
  // =====================

  return (
    <div className="space-y-6">
      {/* Filtros y controles superiores */}
      <TemplateFilters
        searchTerm={state.searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={state.selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        sortBy={state.sortBy}
        onSortChange={setSortBy}
        viewMode={state.viewMode}
        onViewModeChange={setViewMode}
        onTemplateCreate={onTemplateCreate}
      />

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

        {/* Contenedor con scroll para la grilla/lista de plantillas */}
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-lg border border-gray-200 bg-white p-4">
          {state.viewMode === 'grid' ? (
            <TemplateGrid
              templates={filteredTemplates}
              onTemplateClick={handleTemplateClick}
              onTemplatePreview={handleTemplatePreview}
              onTemplateDuplicate={handleTemplateDuplicate}
              onTemplateDelete={handleTemplateDeleteClick}
              family={family}
              userRole={userRole}
              isDuplicating={state.isDuplicating}
            />
          ) : (
            <TemplateList
              templates={filteredTemplates}
              onTemplateClick={handleTemplateClick}
              onTemplatePreview={handleTemplatePreview}
              onTemplateDuplicate={handleTemplateDuplicate}
              onTemplateDelete={handleTemplateDeleteClick}
              family={family}
              userRole={userRole}
              isDuplicating={state.isDuplicating}
            />
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {state.showPreviewModal && state.previewTemplate && state.previewState && (
        <PreviewModalV3
          isOpen={state.showPreviewModal}
          template={state.previewTemplate}
          state={state.previewState}
          onClose={handleClosePreview}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={state.showDeleteModal}
        template={state.templateToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={state.isDeleting}
      />
    </div>
  );
}; 