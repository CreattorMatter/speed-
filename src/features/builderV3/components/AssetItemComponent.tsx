// =====================================
// ASSET ITEM COMPONENT - BuilderV3
// =====================================

import React from 'react';
import { Check, FileImage } from 'lucide-react';
import { Asset, AssetCategory } from './AssetUploadManager';
import { BuilderOperationsV3 } from '../types';

interface AssetItemComponentProps {
  asset: Asset;
  isSelected: boolean;
  category?: AssetCategory;
  onSelect: (assetId: string) => void;
  onUse: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
  operations: BuilderOperationsV3;
}

export const AssetItemComponent: React.FC<AssetItemComponentProps> = ({
  asset,
  isSelected,
  category,
  onSelect,
  onUse,
  onDelete,
  operations
}) => {
  
  // =====================
  // UTILITY FUNCTIONS
  // =====================
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUse = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Crear y insertar imagen en el canvas
    const imageComponent = operations.createComponent('image-product', {
      x: 100,
      y: 100,
      z: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    });
    
    // Actualizar el componente con los datos del asset
    imageComponent.content = {
      ...imageComponent.content,
      staticValue: asset.url,
      fieldType: 'static'
    };
    
    operations.addComponent(imageComponent);
    onUse(asset);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(asset.id);
  };

  const handleSelect = () => {
    onSelect(asset.id);
  };

  return (
    <div
      className={`relative group bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={handleSelect}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center z-10">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      
      {/* Asset preview */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {asset.type === 'image' ? (
          <img
            src={asset.url}
            alt={asset.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
            }}
          />
        ) : (
          <FileImage className="w-8 h-8 text-gray-400" />
        )}
        
        {/* Fallback icon */}
        <div className="hidden w-full h-full flex items-center justify-center">
          <FileImage className="w-8 h-8 text-gray-400" />
        </div>
      </div>
      
      {/* Asset info */}
      <div className="p-2">
        <div className="text-xs font-medium text-gray-900 truncate mb-1" title={asset.name}>
          {asset.name}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(asset.size)}</span>
          {category && (
            <span className={`px-1 py-0.5 rounded text-xs ${category.color}`}>
              {category.name}
            </span>
          )}
        </div>
        {asset.dimensions && (
          <div className="text-xs text-gray-400 mt-1">
            {asset.dimensions.width}×{asset.dimensions.height}
          </div>
        )}
      </div>
      
      {/* Actions overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex space-x-2">
          <button
            onClick={handleUse}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            title="Usar en canvas"
          >
            Usar
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            title="Eliminar asset"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}; 