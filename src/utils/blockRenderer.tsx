import React, { useRef } from 'react';
import { Block } from '../types/builder';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface RenderBlockContentProps {
  block: Block;
  onImageUpload: (file: File) => void;
}

export function renderBlockContent({ block, onImageUpload }: RenderBlockContentProps): React.ReactNode {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. El tamaño máximo es 5MB');
      return;
    }

    onImageUpload(file);
  };

  // Renderizar bloques que permiten imágenes
  if (['header', 'footer', 'image', 'logo'].includes(block.type)) {
    return (
      <div className="w-full h-full min-h-[100px] relative group">
        {block.content?.imageUrl ? (
          // Si hay una imagen cargada
          <div className="relative w-full h-full">
            <img 
              src={block.content.imageUrl} 
              alt={block.type}
              className="w-full h-full object-contain hover:object-cover transition-all duration-300"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: block.type === 'logo' ? 'contain' : 'cover'
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 
                          transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={handleImageClick}
                className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 
                         transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Cambiar imagen
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const img = document.querySelector(`[data-block-id="${block.id}"] img`) as HTMLImageElement;
                    if (img) {
                      img.style.objectFit = 'contain';
                    }
                  }}
                  className="bg-white text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100 text-sm"
                >
                  Ajustar
                </button>
                <button
                  onClick={() => {
                    const img = document.querySelector(`[data-block-id="${block.id}"] img`) as HTMLImageElement;
                    if (img) {
                      img.style.objectFit = 'cover';
                    }
                  }}
                  className="bg-white text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100 text-sm"
                >
                  Llenar
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Si no hay imagen
          <button 
            onClick={handleImageClick}
            className="w-full h-full bg-gray-50 rounded-lg flex flex-col items-center justify-center 
                     cursor-pointer hover:bg-gray-100 transition-colors border-2 border-dashed 
                     border-gray-300 hover:border-indigo-500 group"
          >
            <div className="transform group-hover:scale-110 transition-transform">
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-500 text-sm font-medium">
                {block.type === 'header' ? 'Subir encabezado' :
                 block.type === 'footer' ? 'Subir pie de página' :
                 block.type === 'logo' ? 'Subir logo' : 'Subir imagen'}
              </span>
              <span className="text-gray-400 text-xs mt-1 block">
                Click para seleccionar
              </span>
            </div>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>
    );
  }

  // Renderizar otros tipos de bloques
  return (
    <div className="w-full h-full flex items-center justify-center">
      {block.content.text || `Bloque ${block.type}`}
    </div>
  );
} 