// =====================================
// CATEGORY HEADER - ComponentsPanel
// =====================================

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CategoryHeaderProps } from './types';

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  categoryConfig,
  componentsCount,
  isExpanded,
  onToggle
}) => {
  const IconComponent = categoryConfig.icon;

  return (
    <button
      onClick={onToggle}
      className={`
        w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all
        ${categoryConfig.borderColor} ${categoryConfig.color}
        hover:shadow-md
      `}
    >
      <div className="flex items-center">
        <IconComponent className="w-4 h-4 mr-2" />
        <span className="font-medium text-sm">{category}</span>
        <span className="ml-2 bg-white bg-opacity-70 px-2 py-1 rounded text-xs">
          {componentsCount}
        </span>
      </div>
      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
    </button>
  );
}; 