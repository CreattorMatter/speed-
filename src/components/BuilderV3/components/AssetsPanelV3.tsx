// =====================================
// SPEED BUILDER V3 - ASSETS PANEL
// =====================================

import React, { useState, useRef, useCallback } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Filter, 
  Folder,
  Plus,
  Download,
  Trash2,
  MoreVertical,
  FolderPlus,
  X,
  Check,
  AlertCircle,
  FileImage
} from 'lucide-react';
import { BuilderStateV3, BuilderOperationsV3 } from '../../../types/builder-v3';

interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  category: string;
  size: number;
  dimensions?: { width: number; height: number };
  uploadedAt: Date;
  tags: string[];
}

interface AssetCategory {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface AssetsPanelV3Props {
  state: BuilderStateV3;
  operations: BuilderOperationsV3;
}

export const AssetsPanelV3: React.FC<AssetsPanelV3Props> = ({
  state,
  operations
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categorías predefinidas
  const [categories, setCategories] = useState<AssetCategory[]>([
    { id: 'headers', name: 'Headers', color: 'bg-blue-100 text-blue-800', count: 3 },
    { id: 'products', name: 'Productos', color: 'bg-green-100 text-green-800', count: 8 },
    { id: 'logos', name: 'Logos', color: 'bg-purple-100 text-purple-800', count: 5 },
    { id: 'promotional', name: 'Promocionales', color: 'bg-orange-100 text-orange-800', count: 12 },
    { id: 'generic', name: 'Genéricos', color: 'bg-gray-100 text-gray-800', count: 4 }
  ]);

  // Assets de ejemplo (en una implementación real, vendrían de Supabase Storage)
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
  // UTILITY FUNCTIONS
  // =====================

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryById = (id: string): AssetCategory | undefined => {
    return categories.find(cat => cat.id === id);
  };

  // =====================
  // FILTER & SEARCH
  // =====================

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchTerm === '' || 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // =====================
  // FILE UPLOAD HANDLERS
  // =====================

  const handleFileSelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileUpload = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (validFiles.length === 0) {
      alert('Por favor selecciona archivos de imagen válidos (máximo 5MB)');
      return;
    }

    for (const file of validFiles) {
      const fileId = `upload_${Date.now()}_${Math.random()}`;
      
      setUploadingFiles(prev => [...prev, fileId]);

      try {
        // Simular upload (en implementación real, usar Supabase Storage)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Crear nuevo asset
        const newAsset: Asset = {
          id: fileId,
          name: file.name,
          url: URL.createObjectURL(file), // En implementación real, URL de Supabase
          type: 'image',
          category: selectedCategory !== 'all' ? selectedCategory : 'generic',
          size: file.size,
          uploadedAt: new Date(),
          tags: []
        };

        setAssets(prev => [newAsset, ...prev]);

        // Actualizar contador de categoría
        setCategories(prev => prev.map(cat => 
          cat.id === newAsset.category 
            ? { ...cat, count: cat.count + 1 }
            : cat
        ));

      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error al subir ${file.name}`);
      } finally {
        setUploadingFiles(prev => prev.filter(id => id !== fileId));
      }
    }
  }, [selectedCategory]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

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
    // Insertar imagen en el canvas
    operations.addComponent('image', {
      x: 100,
      y: 100
    }, {
      imageUrl: asset.url,
      imageFit: 'cover',
      imageAlt: asset.name
    });
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
  // CATEGORY MANAGEMENT
  // =====================

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: AssetCategory = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, '_'),
        name: newCategoryName.trim(),
        color: 'bg-indigo-100 text-indigo-800',
        count: 0
      };
      
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  // =====================
  // RENDER FUNCTIONS
  // =====================

  const renderUploadArea = () => (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-600 mb-2">
        Arrastra imágenes aquí o{' '}
        <button
          onClick={handleFileSelect}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          navega para seleccionar
        </button>
      </p>
      <p className="text-xs text-gray-500">
        JPG, PNG, WebP hasta 5MB
      </p>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
      />
    </div>
  );

  const renderAssetGrid = () => (
    <div className="grid grid-cols-2 gap-3">
      {filteredAssets.map(asset => {
        const isSelected = selectedAssets.includes(asset.id);
        const category = getCategoryById(asset.category);
        
        return (
          <div
            key={asset.id}
            className={`relative group bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
              isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleAssetSelect(asset.id)}
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
              <div className="text-xs font-medium text-gray-900 truncate mb-1">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssetUse(asset);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Usar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssetDelete(asset.id);
                  }}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
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
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Quick upload button */}
        <button
          onClick={handleFileSelect}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Subir Imágenes</span>
        </button>
      </div>

      {/* Categories */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Categorías</span>
          <button
            onClick={() => setShowNewCategory(true)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-2 py-1 text-sm rounded ${
              selectedCategory === 'all' 
                ? 'bg-blue-100 text-blue-800' 
                : 'hover:bg-gray-100'
            }`}
          >
            Todos ({assets.length})
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-2 py-1 text-sm rounded flex items-center justify-between ${
                selectedCategory === category.id 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <span>{category.name}</span>
              <span className={`text-xs px-1 py-0.5 rounded ${category.color}`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
        
        {/* New category form */}
        {showNewCategory && (
          <div className="mt-2 p-2 border border-gray-200 rounded">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Nombre categoría"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                autoFocus
              />
              <button
                onClick={handleCreateCategory}
                className="text-green-600 hover:text-green-800"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategoryName('');
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {uploadingFiles.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Subiendo {uploadingFiles.length} archivo(s)...
              </span>
            </div>
            <div className="space-y-1">
              {uploadingFiles.map(fileId => (
                <div key={fileId} className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {assets.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-4">No hay assets disponibles</p>
            {renderUploadArea()}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No se encontraron assets</p>
            <p className="text-xs text-gray-400 mt-1">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderAssetGrid()}
            
            {/* Upload area at bottom */}
            <div className="mt-6">
              {renderUploadArea()}
            </div>
          </div>
        )}
      </div>

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