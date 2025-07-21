// =====================================
// BUILDER V3 TYPES - Main Component
// =====================================

import { FamilyV3, FamilyTypeV3, ComponentTypeV3, PositionV3, DraggableComponentV3, TemplateV3 } from '../../types';

export type BuilderView = 'builder' | 'admin';
export type BuilderStepV3 = 'family-selection' | 'template-library' | 'canvas-editor';

export interface BuilderV3Props {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
  userRole?: 'admin' | 'editor' | 'viewer';
}

export interface PaperFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  description: string;
}

export interface BuilderV3State {
  // View and step management
  currentView: BuilderView;
  currentStep: BuilderStepV3;
  
  // Modal states
  showPreview: boolean;
  isCreateFamilyModalOpen: boolean;
  showConfirmExitModal: boolean;
  isPaperModalOpen: boolean;
  
  // Paper format settings
  paperFormat: string;
  customWidth: number;
  customHeight: number;
  orientation: 'portrait' | 'landscape';
  rulerUnit: 'mm' | 'cm';
  
  // Navigation state
  pendingNavigation: () => void;
}

export interface BreadcrumbItem {
  label: string;
  active: boolean;
}

export interface BuilderV3Navigation {
  handleIntelligentBack: () => void;
  executeNavigation: (navigationFn: () => void) => void;
  handleSaveAndExit: () => Promise<void>;
  handleExitWithoutSaving: () => void;
  getBreadcrumbs: () => BreadcrumbItem[];
  renderBreadcrumbs: () => JSX.Element;
}

export interface BuilderV3TemplateActions {
  handleFamilySelect: (family: FamilyV3) => Promise<void>;
  handleTemplateSelect: (templateId: string) => Promise<void>;
  handleCreateNewTemplate: () => Promise<void>;
  handleCreateFamily: () => void;
  handleFamilyCreated: (familyData: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt' | 'templates'>) => Promise<FamilyV3>;
  handleCloneTemplates: (sourceTemplateIds: string[], targetFamilyId: string, replaceHeaders?: boolean, headerImageUrl?: string) => Promise<void>;
  handleTitleChange: (newTitle: string) => void;
}

export interface BuilderV3CanvasActions {
  handleComponentAdd: (type: ComponentTypeV3, position: PositionV3) => void;
  handleComponentSelect: (componentId: string | null) => void;
  handleMultipleComponentSelect: (componentIds: string[]) => void;
  handlePaperFormatChange: (formatId: string) => void;
  handleOrientationToggle: () => void;
}

export interface BuilderV3StateUpdaters {
  setCurrentView: (view: BuilderView) => void;
  setCurrentStep: (step: BuilderStepV3) => void;
  setShowPreview: (show: boolean) => void;
  setIsCreateFamilyModalOpen: (open: boolean) => void;
  setShowConfirmExitModal: (show: boolean) => void;
  setPaperFormat: (format: string) => void;
  setCustomWidth: (width: number) => void;
  setCustomHeight: (height: number) => void;
  setOrientation: (orientation: 'portrait' | 'landscape') => void;
  setRulerUnit: (unit: 'mm' | 'cm') => void;
  setPendingNavigation: (fn: () => void) => void;
  setIsPaperModalOpen: (open: boolean) => void;
}

export interface ContentRendererProps {
  currentStep: BuilderStepV3;
  families: FamilyV3[];
  templates: TemplateV3[];
  componentsLibrary: any;
  state: any;
  operations: any;
  userRole: 'admin' | 'editor' | 'viewer';
  templateActions: BuilderV3TemplateActions;
  canvasActions: BuilderV3CanvasActions;
  paperFormat: string;
  orientation: 'portrait' | 'landscape';
  availablePaperFormats: PaperFormat[];
  rulerUnit: 'mm' | 'cm';
  refreshData: () => Promise<void>;
  setShowPreview: (show: boolean) => void;
} 