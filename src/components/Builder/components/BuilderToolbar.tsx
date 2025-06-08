import React from 'react';
import { ArrowLeft, Layout, LayoutTemplate, Tag, Image as ImageIcon, DollarSign, Percent, Gift, Square, Box } from 'lucide-react';
import { BlockType } from '../../types/builder';

interface BuilderToolbarProps {
  onBack: () => void;
  onAddBlock: (type: BlockType) => void;
  onSave: () => void;
  onSearch: () => void;
  onExport: () => void;
  onGenerateAI: () => void;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  onBack,
  onAddBlock,
  onSave,
  onSearch,
  onExport,
  onGenerateAI
}) => {
  const blockTypes: { type: BlockType; icon: React.ReactNode; label: string }[] = [
    { type: 'container', icon: <Box className="w-5 h-5" />, label: 'Contenedor' },
    { type: 'header', icon: <Layout className="w-5 h-5" />, label: 'Encabezado' },
    { type: 'footer', icon: <LayoutTemplate className="w-5 h-5" />, label: 'Pie de página' },
    { type: 'sku', icon: <Tag className="w-5 h-5" />, label: 'SKU' },
    { type: 'image', icon: <ImageIcon className="w-5 h-5" />, label: 'Imagen' },
    { type: 'price', icon: <DollarSign className="w-5 h-5" />, label: 'Precio' },
    { type: 'discount', icon: <Percent className="w-5 h-5" />, label: 'Descuento' },
    { type: 'promotion', icon: <Gift className="w-5 h-5" />, label: 'Promoción' },
    { type: 'logo', icon: <Square className="w-5 h-5" />, label: 'Logo' }
  ];

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-2">
          {blockTypes.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => onAddBlock(type)}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={label}
            >
              {icon}
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onSearch}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Buscar Plantilla
        </button>
        
        <button
          onClick={onGenerateAI}
          className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors"
        >
          Generar con IA
        </button>
        
        <button
          onClick={onExport}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Exportar
        </button>
        
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}; 