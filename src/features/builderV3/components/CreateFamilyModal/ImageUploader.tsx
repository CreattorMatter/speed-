// =====================================
// IMAGE UPLOADER - CreateFamilyModal
// =====================================

import React from 'react';
import { Upload, Image as ImageIcon, Check } from 'lucide-react';
import { ImageUploaderProps } from './types';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  headerFile,
  headerImageUrl,
  isUploadingHeader,
  onFileSelect,
  onRemoveImage,
  className = ''
}) => {
  
  if (!headerImageUrl) {
    return (
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${className}`}>
        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <div className="text-sm text-gray-600 mb-2">
          Sube una imagen para reemplazar todos los headers
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          className="hidden"
          id="header-upload"
        />
        <label
          htmlFor="header-upload"
          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer"
        >
          <Upload className="w-4 h-4 mr-1" />
          Seleccionar Imagen
        </label>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 p-2 bg-gray-50 rounded border ${className}`}>
      <img
        src={headerImageUrl}
        alt="Header preview"
        className="w-12 h-8 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {headerFile?.name || 'Imagen seleccionada'}
        </div>
        <div className="text-xs text-gray-500">
          {headerFile?.size ? `${(headerFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
        </div>
      </div>
      <div className="text-green-600">
        <Check className="w-5 h-5" />
      </div>
    </div>
  );
}; 