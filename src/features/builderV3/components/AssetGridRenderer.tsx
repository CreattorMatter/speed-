// =====================================
// ASSET GRID RENDERER - BuilderV3
// =====================================

import React from 'react';
import { ImageIcon, Search } from 'lucide-react';
import { Asset, AssetCategory } from './AssetUploadManager';
import { AssetItemComponent } from './AssetItemComponent';
import { BuilderOperationsV3 } from '../types';

interface AssetGridRendererProps {
  assets: Asset[];
  filteredAssets: Asset[];
  categories: AssetCategory[];
  selectedAssets: string[];
  onAssetSelect: (assetId: string) => void;
  onAssetUse: (asset: Asset) => void;
  onAssetDelete: (assetId: string) => void;
  onBulkDelete: () => void;
  operations: BuilderOperationsV3;
  searchTerm: string;
  UploadAreaComponent: React.ReactNode;
  UploadProgressComponent: React.ReactNode;
}

export const AssetGridRenderer: React.FC<AssetGridRendererProps> = ({
  assets,
  filteredAssets,
  categories,
  selectedAssets,
  onAssetSelect,
  onAssetUse,
  onAssetDelete,
  onBulkDelete,
  operations,
  searchTerm,
  UploadAreaComponent,
  UploadProgressComponent
}) => {
  
  // =====================
  // UTILITY FUNCTIONS
  // =====================
  
  const getCategoryById = (id: string): AssetCategory | undefined => {
    return categories.find(cat => cat.id === id);
  };

  // =====================
  // RENDER FUNCTIONS
  // =====================

  const renderAssetGrid = () => (
    <div className="grid grid-cols-2 gap-3">
      {filteredAssets.map(asset => {
        const isSelected = selectedAssets.includes(asset.id);
        const category = getCategoryById(asset.category);
        
        return (
          <AssetItemComponent
            key={asset.id}
            asset={asset}
            isSelected={isSelected}
            category={category}
            onSelect={onAssetSelect}
            onUse={onAssetUse}
            onDelete={onAssetDelete}
            operations={operations}
          />
        );
      })}
    </div>
  );

  const renderEmptyState = () => {
    if (assets.length === 0) {
      return (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-500 mb-4">No hay assets disponibles</p>
          {UploadAreaComponent}
        </div>
      );
    }
    
    if (filteredAssets.length === 0) {
      return (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-500">No se encontraron assets</p>
          <p className="text-xs text-gray-400 mt-1">
            {searchTerm ? `Intenta con otros términos de búsqueda` : 'Selecciona otra categoría'}
          </p>
        </div>
      );
    }
    
    return null;
  };

  const renderBulkActions = () => {
    if (selectedAssets.length === 0) return null;
    
    return (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">
            {selectedAssets.length} asset(s) seleccionado(s)
          </span>
          <button
            onClick={onBulkDelete}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Eliminar seleccionados
          </button>
        </div>
      </div>
    );
  };

  // =====================
  // MAIN RENDER
  // =====================

  return (
    <div className="flex-1 overflow-y-auto p-3">
      {/* Upload Progress */}
      {UploadProgressComponent}

      {/* Bulk Actions */}
      {renderBulkActions()}

      {/* Content */}
      {renderEmptyState() || (
        <div className="space-y-4">
          {renderAssetGrid()}
          
          {/* Upload area at bottom */}
          <div className="mt-6">
            {UploadAreaComponent}
          </div>
        </div>
      )}
    </div>
  );
}; 