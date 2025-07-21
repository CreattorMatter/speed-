// =====================================
// PROPERTIES PANEL TYPES - BuilderV3
// =====================================

import { DraggableComponentV3, BuilderStateV3, PositionV3, SizeV3, DynamicContentV3 } from '../../types';

export interface PropertiesPanelProps {
  state: BuilderStateV3;
  activeTab: 'properties' | 'styles' | 'content';
  onTabChange: (tab: 'properties' | 'styles' | 'content') => void;
  onComponentUpdate: (componentId: string, updates: Partial<DraggableComponentV3>) => void;
  onComponentDelete: (componentId: string) => void;
  onComponentDuplicate: (componentId: string) => void;
  onComponentToggleVisibility: (componentId: string) => void;
  onComponentToggleLock: (componentId: string) => void;
}

export interface TabProps {
  selectedComponent: DraggableComponentV3 | null;
  multipleSelection: boolean;
  onComponentUpdate: (componentId: string, updates: Partial<DraggableComponentV3>) => void;
  onComponentDelete: (componentId: string) => void;
  onComponentDuplicate: (componentId: string) => void;
  onComponentToggleVisibility: (componentId: string) => void;
  onComponentToggleLock: (componentId: string) => void;
}

export interface PropertiesHandlers {
  handlePositionChange: (field: keyof PositionV3, value: number) => void;
  handleSizeChange: (field: keyof SizeV3, value: number) => void;
  handleStyleChange: (field: string, value: unknown) => void;
  handleContentChange: (field: string, value: unknown) => void;
  handleOutputFormatChange: (field: keyof NonNullable<DynamicContentV3['outputFormat']>, value: unknown) => void;
  handleCalculatedFieldChange: (expression: string) => void;
}

export interface ProductFieldOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  description?: string;
}

export interface CalculatedFieldResult {
  expression: string;
  previewResult: string;
  errorMessage: string;
} 