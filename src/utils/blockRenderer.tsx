import React, { useRef } from 'react';
import { Block } from '../types/builder';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface RenderBlockContentProps {
  block: Block;
  onImageUpload?: (blockId: string, file: File) => void;
}

export const renderBlockContent = ({
  block,
  onImageUpload = () => {}
}: RenderBlockContentProps) => {
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

    onImageUpload(block.id, file);
  };

  // Renderizar bloques de imagen
  if (['header', 'footer', 'image', 'logo'].includes(block.type)) {
    return (
      <div className="w-full h-full min-h-[100px] relative group">
        {block.content?.imageUrl ? (
          // Si hay una imagen cargada
          <div className="relative w-full h-full">
            <img 
              src={block.content.imageUrl} 
              alt={block.type}
              className="w-full h-full object-contain rounded"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 
                          transition-opacity flex items-center justify-center">
              <button
                onClick={handleImageClick}
                className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 
                         transition-colors text-sm font-medium"
              >
                Cambiar imagen
              </button>
            </div>
          </div>
        ) : (
          // Si no hay imagen
          <div 
            onClick={handleImageClick}
            className="w-full h-full bg-gray-100 rounded flex flex-col items-center justify-center 
                     cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed 
                     border-gray-300 hover:border-indigo-500"
          >
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-gray-500 text-sm font-medium">
              {block.type === 'header' ? 'Subir encabezado' :
               block.type === 'footer' ? 'Subir pie de página' :
               block.type === 'logo' ? 'Subir logo' : 'Subir imagen'}
            </span>
            <span className="text-gray-400 text-xs mt-1">
              Click para seleccionar
            </span>
          </div>
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
}; 