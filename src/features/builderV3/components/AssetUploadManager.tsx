// =====================================
// ASSET UPLOAD MANAGER - BuilderV3
// =====================================

import React, { useRef, useCallback } from 'react';
import { Upload, Plus } from 'lucide-react';

export interface Asset {
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

export interface AssetCategory {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface AssetUploadManagerProps {
  selectedCategory: string;
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  setCategories: React.Dispatch<React.SetStateAction<AssetCategory[]>>;
  uploadingFiles: string[];
  setUploadingFiles: React.Dispatch<React.SetStateAction<string[]>>;
}

// =====================
// CUSTOM HOOK FOR ASSET UPLOAD
// =====================

export const useAssetUploadManager = ({
  selectedCategory,
  setAssets,
  setCategories,
  uploadingFiles,
  setUploadingFiles
}: AssetUploadManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, [selectedCategory, setAssets, setCategories, setUploadingFiles]);

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

  return {
    fileInputRef,
    handleFileSelect,
    handleFileUpload,
    handleDrop,
    handleDragOver
  };
};

// =====================
// UPLOAD COMPONENTS
// =====================

interface UploadAreaProps {
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onFileSelect: () => void;
  onFileUpload: (files: FileList) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  onDrop,
  onDragOver,
  onFileSelect,
  onFileUpload,
  fileInputRef
}) => (
  <div 
    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
    onDrop={onDrop}
    onDragOver={onDragOver}
  >
    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
    <p className="text-sm text-gray-600 mb-2">
      Arrastra imágenes aquí o{' '}
      <button
        onClick={onFileSelect}
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
      onChange={(e) => e.target.files && onFileUpload(e.target.files)}
    />
  </div>
);

interface QuickUploadButtonProps {
  onFileSelect: () => void;
}

export const QuickUploadButton: React.FC<QuickUploadButtonProps> = ({ onFileSelect }) => (
  <button
    onClick={onFileSelect}
    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
  >
    <Plus className="w-4 h-4" />
    <span>Subir Imágenes</span>
  </button>
);

interface UploadProgressProps {
  uploadingFiles: string[];
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ uploadingFiles }) => {
  if (uploadingFiles.length === 0) return null;

  return (
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
  );
}; 