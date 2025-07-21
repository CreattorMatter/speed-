// =====================================
// SPEED BUILDER V3 - ASSETS PANEL V3 MODULARIZED
// =====================================

import React, { useState, useMemo } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { BuilderStateV3, BuilderOperationsV3 } from '../types';
import { AssetCategoriesManager, AssetCategory } from './AssetCategoriesManager';
import { AssetsSearchFilter } from './AssetsSearchFilter';
import { AssetGridRenderer } from './AssetGridRenderer';
import { 
  useAssetUploadManager, 
  UploadArea, 
  QuickUploadButton, 
  UploadProgress,
  Asset 
} from './AssetUploadManager';

interface AssetsPanelV3Props {
  state: BuilderStateV3;
  operations: BuilderOperationsV3;
}

export const AssetsPanelV3: React.FC<AssetsPanelV3Props> = ({
  operations
}) => {
  // =====================
  // STATE MANAGEMENT
  // =====================
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  // Categorías predefinidas
  const [categories, setCategories] = useState<AssetCategory[]>([
    { id: 'headers', name: 'Headers', color: 'bg-blue-100 text-blue-800', count: 3 },
    { id: 'products', name: 'Productos', color: 'bg-green-100 text-green-800', count: 8 },
    { id: 'logos', name: 'Logos', color: 'bg-purple-100 text-purple-800', count: 5 },
    { id: 'promotional', name: 'Promocionales', color: 'bg-orange-100 text-orange-800', count: 12 },
    { id: 'generic', name: 'Genéricos', color: 'bg-gray-100 text-gray-800', count: 4 }
  ]);

  // Assets de ejemplo
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'header_hot_sale.jpg',
      url: '/images/headers/header_hot_sale.jpg',
      type: 'image',
      category: 'headers',
      size: 245000,
      dimensions: { width: 1200, height: 300 },
      uploadedAt: new Date('2024-12-01'),
      tags: ['hot sale', 'header', 'promocional']
    },
    {
      id: '2',
      name: 'logo_marca.png',
      url: '/images/logos/logo_marca.png',
      type: 'image',
      category: 'logos',
      size: 89000,
      dimensions: { width: 400, height: 200 },
      uploadedAt: new Date('2024-12-02'),
      tags: ['logo', 'marca', 'branding']
    },
    {
      id: '3',
      name: 'producto_ejemplo.jpg',
      url: '/images/products/producto_ejemplo.jpg',
      type: 'image',
      category: 'products',
      size: 156000,
      dimensions: { width: 800, height: 600 },
      uploadedAt: new Date('2024-12-03'),
      tags: ['producto', 'herramienta', 'taladro']
    }
  ]);

  // =====================
  // UPLOAD MANAGEMENT
  // =====================
  
  const uploadManager = useAssetUploadManager({
    selectedCategory,
    setAssets,
    setCategories,
    uploadingFiles,
    setUploadingFiles
  });

  // =====================
  // FILTER & SEARCH
  // =====================

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = searchTerm === '' || 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [assets, searchTerm, selectedCategory]);

  // =====================
  // ASSET ACTIONS
  // =====================

  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleAssetUse = (asset: Asset) => {
    console.log('📸 Asset usado en canvas:', asset.name);
  };

  const handleAssetDelete = (assetId: string) => {
    if (confirm('¿Estás seguro de eliminar este asset?')) {
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        setAssets(prev => prev.filter(a => a.id !== assetId));
        
        // Actualizar contador de categoría
        setCategories(prev => prev.map(cat => 
          cat.id === asset.category 
            ? { ...cat, count: Math.max(0, cat.count - 1) }
            : cat
        ));
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedAssets.length === 0) return;
    
    if (confirm(`¿Eliminar ${selectedAssets.length} asset(s) seleccionado(s)?`)) {
      selectedAssets.forEach(assetId => {
        const asset = assets.find(a => a.id === assetId);
        if (asset) {
          setCategories(prev => prev.map(cat => 
            cat.id === asset.category 
              ? { ...cat, count: Math.max(0, cat.count - 1) }
              : cat
          ));
        }
      });
      
      setAssets(prev => prev.filter(a => !selectedAssets.includes(a.id)));
      setSelectedAssets([]);
    }
  };

  // =====================
  // RENDER COMPONENTS
  // =====================

  const uploadAreaComponent = (
    <UploadArea
      onDrop={uploadManager.handleDrop}
      onDragOver={uploadManager.handleDragOver}
      onFileSelect={uploadManager.handleFileSelect}
      onFileUpload={uploadManager.handleFileUpload}
      fileInputRef={uploadManager.fileInputRef}
    />
  );

  const uploadProgressComponent = (
    <UploadProgress uploadingFiles={uploadingFiles} />
  );

  // =====================
  // MAIN RENDER
  // =====================

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Assets</h3>
        </div>
        <div className="flex items-center space-x-2">
          {selectedAssets.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Eliminar ({selectedAssets.length})
            </button>
          )}
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {assets.length}
          </span>
        </div>
      </div>

      {/* Search and Upload */}
      <div className="p-3 border-b border-gray-200 space-y-3">
        <AssetsSearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <QuickUploadButton onFileSelect={uploadManager.handleFileSelect} />
      </div>

      {/* Categories */}
      <AssetCategoriesManager
        categories={categories}
        setCategories={setCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        totalAssets={assets.length}
      />

      {/* Asset Grid */}
      <AssetGridRenderer
        assets={assets}
        filteredAssets={filteredAssets}
        categories={categories}
        selectedAssets={selectedAssets}
        onAssetSelect={handleAssetSelect}
        onAssetUse={handleAssetUse}
        onAssetDelete={handleAssetDelete}
        onBulkDelete={handleBulkDelete}
        operations={operations}
        searchTerm={searchTerm}
        UploadAreaComponent={uploadAreaComponent}
        UploadProgressComponent={uploadProgressComponent}
      />

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>💡 <strong>Tip:</strong> Arrastra desde el grid al canvas</span>
            <span>{filteredAssets.length} mostrados</span>
          </div>
          <p>Selecciona múltiples assets con Ctrl/Cmd + click</p>
        </div>
      </div>
    </div>
  );
}; 