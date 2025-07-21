// =====================================
// TEMPLATE LIBRARY TYPES - BuilderV3
// =====================================

import { FamilyV3, TemplateV3, BuilderStateV3 } from '../../types';

export interface TemplateLibraryProps {
  family: FamilyV3;
  templates: TemplateV3[];
  onTemplateSelect: (templateId: string) => void;
  onTemplateCreate: () => void;
  onTemplateDelete?: (templateId: string) => void;
  userRole: 'admin' | 'limited';
  onRefresh?: () => void;
}

export interface TemplateLibraryState {
  // Search and filters
  searchTerm: string;
  selectedCategory: string;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'created' | 'updated' | 'usage';
  
  // Preview modal
  showPreviewModal: boolean;
  previewTemplate: TemplateV3 | null;
  previewState: BuilderStateV3 | null;
  
  // Template actions
  isDuplicating: boolean;
  showDeleteModal: boolean;
  templateToDelete: TemplateV3 | null;
  isDeleting: boolean;
}

export interface TemplateCategory {
  id: string;
  label: string;
  count: number;
}

export interface TemplateFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: TemplateCategory[];
  sortBy: 'name' | 'created' | 'updated' | 'usage';
  onSortChange: (sort: 'name' | 'created' | 'updated' | 'usage') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onTemplateCreate: () => void;
}

export interface TemplateGridProps {
  templates: TemplateV3[];
  onTemplateClick: (template: TemplateV3) => void;
  onTemplatePreview: (template: TemplateV3, e: React.MouseEvent) => void;
  onTemplateDuplicate: (template: TemplateV3, e: React.MouseEvent) => void;
  onTemplateDelete: (template: TemplateV3, e: React.MouseEvent) => void;
  family: FamilyV3;
  userRole: 'admin' | 'limited';
  isDuplicating: boolean;
}

export interface TemplateListProps {
  templates: TemplateV3[];
  onTemplateClick: (template: TemplateV3) => void;
  onTemplatePreview: (template: TemplateV3, e: React.MouseEvent) => void;
  onTemplateDuplicate: (template: TemplateV3, e: React.MouseEvent) => void;
  onTemplateDelete: (template: TemplateV3, e: React.MouseEvent) => void;
  family: FamilyV3;
  userRole: 'admin' | 'limited';
  isDuplicating: boolean;
}

export interface TemplateCardProps {
  template: TemplateV3;
  family: FamilyV3;
  onTemplateClick: (template: TemplateV3) => void;
  onTemplatePreview: (template: TemplateV3, e: React.MouseEvent) => void;
  onTemplateDuplicate: (template: TemplateV3, e: React.MouseEvent) => void;
  onTemplateDelete: (template: TemplateV3, e: React.MouseEvent) => void;
  userRole: 'admin' | 'limited';
  isDuplicating: boolean;
}

export interface TemplateRowProps {
  template: TemplateV3;
  family: FamilyV3;
  onTemplateClick: (template: TemplateV3) => void;
  onTemplatePreview: (template: TemplateV3, e: React.MouseEvent) => void;
  onTemplateDuplicate: (template: TemplateV3, e: React.MouseEvent) => void;
  onTemplateDelete: (template: TemplateV3, e: React.MouseEvent) => void;
  userRole: 'admin' | 'limited';
  isDuplicating: boolean;
}

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  template: TemplateV3 | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export interface TemplateActionsReturn {
  handleTemplateClick: (template: TemplateV3) => void;
  handleTemplatePreview: (template: TemplateV3, e: React.MouseEvent) => void;
  handleTemplateDuplicate: (template: TemplateV3, e: React.MouseEvent) => void;
  handleTemplateDeleteClick: (template: TemplateV3, e: React.MouseEvent) => void;
  handleConfirmDelete: () => void;
  handleCancelDelete: () => void;
  handleClosePreview: () => void;
} 