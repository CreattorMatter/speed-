import React, { useRef } from 'react';
import { Block } from '../types/builder';
import { Edit2, Upload, Image as ImageIcon } from 'lucide-react';

interface RenderBlockContentProps {
  block: Block;
  isEditing?: boolean;
  onEdit?: (blockId: string, text: string) => void;
  onStartEdit?: (blockId: string) => void;
  onStopEdit?: () => void;
  onImageUpload?: (blockId: string, file: File) => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

export const renderBlockContent = ({
  block,
  isEditing = false,
  onEdit = () => {},
  onStartEdit = () => {},
  onStopEdit = () => {},
  onImageUpload = () => {},
  fileInputRef
}: RenderBlockContentProps) => {
  const localFileInputRef = useRef<HTMLInputElement>(null);
  const actualFileInputRef = fileInputRef || localFileInputRef;

  const handleImageClick = () => {
    if (actualFileInputRef.current) {
      actualFileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. El tamaño máximo es 5MB');
        return;
      }

      onImageUpload(block.id, file);
    }
  };

  const renderImageUploader = (type: 'header' | 'footer' | 'image' | 'logo') => (
    <div className="relative group w-full h-full min-h-[100px]">
      {block.content?.imageUrl ? (
        <div className="relative w-full h-full group">
          <img 
            src={block.content.imageUrl} 
            alt={type}
            className="w-full h-full object-contain rounded"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleImageClick}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cambiar imagen
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={handleImageClick}
          className="w-full h-full bg-gray-100 rounded flex flex-col items-center justify-center cursor-pointer
                     hover:bg-gray-200 transition-colors"
        >
          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-gray-500 text-sm font-medium">
            {type === 'header' ? 'Subir encabezado' :
             type === 'footer' ? 'Subir pie de página' :
             type === 'logo' ? 'Subir logo' : 'Subir imagen'}
          </span>
          <span className="text-gray-400 text-xs mt-1">
            Click para seleccionar
          </span>
        </div>
      )}
      <input
        ref={actualFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </div>
  );

  switch (block.type) {
    case 'header':
    case 'footer':
      return renderImageUploader(block.type);

    case 'image':
    case 'logo':
      return renderImageUploader(block.type);

    case 'sku':
    case 'price':
    case 'discount':
    case 'promotion':
      return (
        <div className="relative group">
          {isEditing ? (
            <input
              type="text"
              value={block.content?.text || ''}
              onChange={(e) => onEdit(block.id, e.target.value)}
              onBlur={onStopEdit}
              autoFocus
              className="w-full p-2 border rounded"
            />
          ) : (
            <>
              <span className={`
                ${block.type === 'price' ? 'text-2xl font-bold text-gray-800' : ''}
                ${block.type === 'discount' ? 'text-red-500 font-semibold' : ''}
                ${block.type === 'promotion' ? 'bg-yellow-50 text-yellow-800 p-2 rounded' : ''}
                ${block.type === 'sku' ? 'font-mono text-gray-600' : ''}
              `}>
                {block.content?.text || getDefaultText(block.type)}
              </span>
              <button
                onClick={() => onStartEdit(block.id)}
                className="absolute -right-6 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-4 h-4 text-gray-400" />
              </button>
            </>
          )}
        </div>
      );

    default:
      return null;
  }
};

function getDefaultText(blockType: string): string {
  switch (blockType) {
    case 'sku':
      return 'SKU-12345';
    case 'price':
      return '$99.99';
    case 'discount':
      return '-20%';
    case 'promotion':
      return '¡Oferta especial!';
    default:
      return '';
  }
} 