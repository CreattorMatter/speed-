import React, { useState, useRef } from 'react';
import { DraggableComponentV3 as OriginalComponentV3 } from '../../../builderV3/types';

// Extend the type to include missing properties used in this component
interface DraggableComponentV3 extends OriginalComponentV3 {
  transform?: {
    rotation?: number;
  };
  zIndex?: number;
}
import { supabase } from '../../../../lib/supabaseClient';

// Helper to get the Supabase function URL for the proxy
const getSupabaseFunctionUrl = (functionName: string) => {
  if (!supabase) return '';
  const { VITE_SUPABASE_URL } = import.meta.env;
  return `${VITE_SUPABASE_URL}/functions/v1/${functionName}`;
};

// Helper to proxy external images
const getProxiedImageUrl = (imageUrl: string): string => {
  if (!imageUrl || imageUrl.startsWith('blob:')) {
    return imageUrl;
  }

  try {
    const url = new URL(imageUrl);
    const { VITE_SUPABASE_URL } = import.meta.env;

    // Don't proxy images that are already on our Supabase storage
    if (VITE_SUPABASE_URL && url.hostname.endsWith(new URL(VITE_SUPABASE_URL).hostname)) {
      return imageUrl;
    }

    // For all other external images, use the proxy
    const proxyUrl = getSupabaseFunctionUrl('image-proxy');
    return `${proxyUrl}?url=${encodeURIComponent(imageUrl)}`;

  } catch (error) {
    // If it's not a valid URL, return it as is
    return imageUrl;
  }
};

// ==========================================
// INTERFACES
// ==========================================

interface DynamicImageRendererProps {
  component: DraggableComponentV3;
  isSelected?: boolean;
  isEditMode?: boolean;
  scale?: number;
  onUpdateComponent?: (componentId: string, updates: Partial<DraggableComponentV3>) => void;
}

// ==========================================
// RENDERER ESPECIAL PARA IMAGEN DINÁMICA
// ==========================================

export const DynamicImageRenderer: React.FC<DynamicImageRendererProps> = ({
  component,
  isSelected = false,
  isEditMode = false,
  scale = 1,
  onUpdateComponent
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extraer información del contenido
  const imageUrl = component.content?.imageUrl || '';
  const imageAlt = component.content?.imageAlt || 'Imagen dinámica';

  // Get the proxied URL for rendering
  const displayImageUrl = getProxiedImageUrl(imageUrl);

  // Verificar si Supabase está configurado
  const isSupabaseConfigured = !!supabase;

  // Manejar selección de archivo
  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1) Crear URL local inmediatamente para preview
      const localUrl = URL.createObjectURL(file);
      
      // Actualizar componente con URL local
      if (onUpdateComponent) {
        onUpdateComponent(component.id, {
          content: {
            ...component.content,
            imageUrl: localUrl,
            imageAlt: file.name,
            fieldType: 'dynamic-upload'
          }
        });
      }

      setUploadProgress(50);

      // 2) Si Supabase está configurado, subir en segundo plano y reemplazar URL
      if (isSupabaseConfigured) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `dynamic-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('assets')
            .getPublicUrl(filePath);

          if (publicUrl && onUpdateComponent) {
            // Reemplazar URL local con URL de Supabase
            onUpdateComponent(component.id, {
              content: {
                ...component.content,
                imageUrl: publicUrl,
                imageAlt: file.name
              }
            });
          }
          setUploadProgress(100);
        } else {
          console.warn('Upload falló, se mantiene URL local:', uploadError);
          setUploadProgress(100);
        }
      } else {
        setUploadProgress(100);
      }

    } catch (error) {
      console.error('Error procesando imagen:', error);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Manejar clic en el componente
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Solo abrir selector si estamos en modo edición y no subiendo
    if (isEditMode && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor selecciona un archivo de imagen válido (JPEG, PNG, WebP)');
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('El archivo es muy grande. Máximo 10MB permitido.');
        return;
      }

      handleFileSelect(file);
    }
    
    // Limpiar input para permitir seleccionar el mismo archivo
    e.target.value = '';
  };

  // Estilos del componente
  const componentStyle = {
    position: 'absolute' as const,
    left: `${(component.position?.x || 0) * scale}px`,
    top: `${(component.position?.y || 0) * scale}px`,
    width: `${(component.size?.width || 200) * scale}px`,
    height: `${(component.size?.height || 150) * scale}px`,
    transform: `rotate(${component.transform?.rotation || 0}deg)`,
    opacity: component.style?.effects?.opacity ?? 1,
    zIndex: component.zIndex || 1,
    cursor: isEditMode ? 'pointer' : 'default',
    backgroundColor: component.style?.color?.backgroundColor || 'transparent',
    borderRadius: component.style?.border?.radius?.topLeft || 0
  };

  return (
    <>
      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Componente de imagen */}
      <div
        style={componentStyle}
        onClick={handleClick}
        className={`
          dynamic-image-component
          ${isSelected ? 'ring-2 ring-blue-500' : ''}
          ${isEditMode ? 'hover:ring-2 hover:ring-purple-400 cursor-pointer' : ''}
          transition-all duration-200
          ${isUploading ? 'opacity-75' : ''}
        `}
        title={isEditMode ? 'Clic para subir imagen' : 'Imagen dinámica'}
      >
        {/* Imagen dinámica */}
        {displayImageUrl ? (
          <div className="relative w-full h-full">
            <img
              src={displayImageUrl}
              crossOrigin="anonymous" // Important for canvas capture
              alt={imageAlt}
              className="w-full h-full object-contain"
              style={{
                filter: component.style?.effects?.filter || 'none',
                borderRadius: 'inherit'
              }}
              onError={(e) => {
                // Si falla la carga, mostrar placeholder
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            
            {/* Indicador de subida */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Subiendo imagen...
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {uploadProgress}%
                  </div>
                </div>
              </div>
            )}

            {/* Indicador de edición en hover */}
            {isEditMode && !isUploading && (
              <div className="absolute inset-0 bg-purple-500 bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center rounded-lg">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white rounded-lg px-3 py-1 text-sm font-medium text-purple-700">
                  📁 Cambiar imagen
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Placeholder cuando no hay imagen seleccionada */
          <div 
            className={`
              w-full h-full bg-gradient-to-br from-purple-50 to-indigo-50 
              border-2 border-dashed border-purple-300 rounded-lg 
              flex flex-col items-center justify-center text-purple-600
              ${isEditMode ? 'hover:bg-purple-100 hover:border-purple-400 cursor-pointer' : ''}
              transition-all duration-200
            `}
            onClick={isEditMode ? handleClick : undefined}
          >
            <div className="text-4xl mb-2">📁</div>
            <div className="text-sm font-medium text-center px-2">
              {isEditMode ? 'Clic para subir imagen' : 'Imagen dinámica'}
            </div>
            {isEditMode && (
              <div className="text-xs text-purple-500 mt-1 text-center px-2">
                Desde tu carpeta local
              </div>
            )}

          </div>
        )}

        {/* Indicador de modo edición */}
        {isEditMode && displayImageUrl && !isUploading && (
          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
            📁
          </div>
        )}
      </div>
    </>
  );
};
