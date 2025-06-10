// =====================================
// SPEED BUILDER V3 - IMAGE UPLOAD COMPONENT
// =====================================

import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Link, 
  Edit3, 
  RotateCw,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useImageUploadV3, formatFileSize, getImageTypeIcon } from '../../../hooks/useImageUploadV3';
import { DraggableComponentV3 } from '../../../types/builder-v3';

// =====================
// TIPOS Y PROPS
// =====================

interface ImageUploadComponentProps {
  component: DraggableComponentV3;
  isSelected: boolean;
  isEditing?: boolean;
  zoom: number;
  onImageUpdate: (imageData: { url: string; alt?: string; file?: File }) => void;
  onEditToggle?: () => void;
  className?: string;
}

interface ImagePreviewProps {
  imageUrl: string;
  imageAlt?: string;
  isSelected: boolean;
  zoom: number;
  onEdit: () => void;
  onRemove: () => void;
}

interface UploadZoneProps {
  isDragging: boolean;
  isUploading: boolean;
  progress: number;
  componentType: string;
  dragHandlers: any;
  onFileSelect: () => void;
  onUrlUpload: () => void;
}

// =====================
// COMPONENTE PRINCIPAL
// =====================

export const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  component,
  isSelected,
  isEditing = false,
  zoom,
  onImageUpdate,
  onEditToggle,
  className = ''
}) => {
  
  // =====================
  // ESTADO LOCAL
  // =====================
  
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [imageAlt, setImageAlt] = useState(component.content?.imageAlt || '');

  // =====================
  // HOOK DE UPLOAD
  // =====================

  const imageUpload = useImageUploadV3({
    onUpload: (imageData) => {
      onImageUpdate({
        url: imageData.url,
        alt: imageAlt || `${component.name} - ${imageData.name}`,
        file: imageData.file
      });
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  });

  // =====================
  // HANDLERS
  // =====================

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      imageUpload.uploadImageFile(file);
    }
  }, [imageUpload]);

  const handleUrlUpload = useCallback(() => {
    if (urlInput.trim()) {
      onImageUpdate({
        url: urlInput.trim(),
        alt: imageAlt || `${component.name} desde URL`
      });
      setShowUrlInput(false);
      setUrlInput('');
    }
  }, [urlInput, imageAlt, onImageUpdate, component.name]);

  const handleRemoveImage = useCallback(() => {
    onImageUpdate({ url: '', alt: '' });
  }, [onImageUpdate]);

  const handleEditAlt = useCallback(() => {
    if (component.content?.imageUrl) {
      onImageUpdate({
        url: component.content.imageUrl,
        alt: imageAlt
      });
    }
  }, [imageAlt, component.content?.imageUrl, onImageUpdate]);

  // =====================
  // RENDER HELPERS
  // =====================

  const getComponentTypeLabel = (type: string): string => {
    switch (type) {
      case 'image-header':
        return 'Header';
      case 'image-brand-logo':
        return 'Logo de Marca';
      case 'image-promotional':
        return 'Imagen Promocional';
      case 'image-product':
        return 'Imagen de Producto';
      default:
        return 'Imagen';
    }
  };

  const getPlaceholderIcon = (type: string): string => {
    switch (type) {
      case 'image-header':
        return '🖼️';
      case 'image-brand-logo':
        return '🏷️';
      case 'image-promotional':
        return '🎨';
      case 'image-product':
        return '📷';
      default:
        return '🖼️';
    }
  };

  // =====================
  // RENDER CONDICIONAL
  // =====================

  const hasImage = component.content?.imageUrl;

  if (hasImage && !isEditing) {
    return (
      <ImagePreview
        imageUrl={component.content.imageUrl || ''}
        imageAlt={component.content?.imageAlt}
        isSelected={isSelected}
        zoom={zoom}
        onEdit={() => onEditToggle?.()}
        onRemove={handleRemoveImage}
      />
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Zona de Upload Principal */}
      <UploadZone
        isDragging={imageUpload.isDragging}
        isUploading={imageUpload.isUploading}
        progress={imageUpload.progress}
        componentType={component.type}
        dragHandlers={imageUpload.dragHandlers}
        onFileSelect={imageUpload.openFileDialog}
        onUrlUpload={() => setShowUrlInput(true)}
      />

      {/* Input de archivo oculto */}
      <input
        ref={imageUpload.fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Modal de URL Input */}
      {showUrlInput && (
        <div className="absolute inset-0 bg-white rounded-lg border-2 border-blue-500 z-10 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Cargar desde URL</h4>
            <button
              onClick={() => setShowUrlInput(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col space-y-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
            
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Descripción de la imagen"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            
            <button
              onClick={handleUrlUpload}
              disabled={!urlInput.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Cargar Imagen
            </button>
          </div>
        </div>
      )}

      {/* Editor de Alt Text cuando hay imagen */}
      {hasImage && isEditing && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Descripción de la imagen"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
            />
            <button
              onClick={handleEditAlt}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              <CheckCircle className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================
// COMPONENTE DE PREVIEW
// =====================

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  imageAlt,
  isSelected,
  zoom,
  onEdit,
  onRemove
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-full h-full relative group">
      {/* Imagen principal */}
      <img
        src={imageUrl}
        alt={imageAlt || 'Imagen'}
        className="w-full h-full object-cover rounded"
        draggable={false}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        style={{
          filter: imageLoaded ? 'none' : 'blur(2px)',
          transition: 'filter 0.3s ease'
        }}
      />

      {/* Overlay de carga */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Overlay de error */}
      {imageError && (
        <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center text-red-600">
          <AlertCircle className="w-8 h-8 mb-2" />
          <span className="text-xs">Error al cargar</span>
        </div>
      )}

      {/* Controles al hacer hover (solo si está seleccionado) */}
      {isSelected && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            title="Editar imagen"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          <button
            onClick={onRemove}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Remover imagen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Badge de información */}
      {isSelected && imageAlt && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded max-w-full truncate">
          {imageAlt}
        </div>
      )}
    </div>
  );
};

// =====================
// COMPONENTE DE ZONA DE UPLOAD
// =====================

const UploadZone: React.FC<UploadZoneProps> = ({
  isDragging,
  isUploading,
  progress,
  componentType,
  dragHandlers,
  onFileSelect,
  onUrlUpload
}) => {
  const getComponentTypeLabel = (type: string): string => {
    switch (type) {
      case 'image-header':
        return 'Header';
      case 'image-brand-logo':
        return 'Logo de Marca';
      case 'image-promotional':
        return 'Imagen Promocional';
      case 'image-product':
        return 'Imagen de Producto';
      default:
        return 'Imagen';
    }
  };

  const getPlaceholderIcon = (type: string): string => {
    switch (type) {
      case 'image-header':
        return '🖼️';
      case 'image-brand-logo':
        return '🏷️';
      case 'image-promotional':
        return '🎨';
      case 'image-product':
        return '📷';
      default:
        return '🖼️';
    }
  };

  return (
    <div
      {...dragHandlers}
      className={`
        w-full h-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer
        ${isDragging 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        }
        ${isUploading ? 'pointer-events-none' : ''}
      `}
      onClick={onFileSelect}
    >
      {/* Estado de upload */}
      {isUploading ? (
        <div className="text-center">
          <div className="animate-spin mb-3">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto" />
          </div>
          <div className="text-sm font-medium text-blue-800">Subiendo imagen...</div>
          <div className="w-32 bg-blue-200 rounded-full h-2 mt-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-blue-600 mt-1">{progress}%</div>
        </div>
      ) : (
        <div className="text-center space-y-3">
          {/* Icono principal */}
          <div className="text-4xl mb-2">
            {getPlaceholderIcon(componentType)}
          </div>
          
          {/* Título */}
          <div className="text-sm font-medium text-gray-700">
            Subir {getComponentTypeLabel(componentType)}
          </div>
          
          {/* Instrucciones */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Arrastra una imagen aquí o haz clic para seleccionar</div>
            <div className="font-medium">JPG, PNG, WebP • Máximo 5MB</div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect();
              }}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-3 h-3" />
              <span>Archivo</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUrlUpload();
              }}
              className="flex items-center space-x-1 px-3 py-1 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-100 transition-colors"
            >
              <Link className="w-3 h-3" />
              <span>URL</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 