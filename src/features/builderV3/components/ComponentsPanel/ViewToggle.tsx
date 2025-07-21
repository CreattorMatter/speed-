// =====================================
// VIEW TOGGLE - ComponentsPanel
// =====================================

import React from 'react';
import { Grid, List } from 'lucide-react';
import { ViewToggleProps } from './types';

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded transition-colors ${
          viewMode === 'grid' 
            ? 'bg-blue-100 text-blue-600' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
        title="Vista de grilla"
      >
        <Grid size={16} />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-2 rounded transition-colors ${
          viewMode === 'list' 
            ? 'bg-blue-100 text-blue-600' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
        title="Vista de lista"
      >
        <List size={16} />
      </button>
    </div>
  );
}; 