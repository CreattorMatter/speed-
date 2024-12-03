import React, { useState } from 'react';
import { ArrowLeft, Layout, LayoutTemplate, Tag, Image, DollarSign, Percent, Gift, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import Preview from './Preview';
import { Block, BlockType } from '../../types/builder';
import ErrorBoundary from './ErrorBoundary';

interface BuilderProps {
  onBack: () => void;
}

export default function Builder({ onBack }: BuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [templateId] = useState(() => generateTemplateId());

  const handleAddBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `${type}-${Date.now()}`,
      type,
      content: { text: `Nuevo bloque ${type}` },
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 }
    };
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
  };

  const blockTypes: BlockType[] = ['header', 'footer', 'sku', 'image', 'price', 'discount', 'promotion', 'logo'];

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Volver al inicio</span>
            </motion.button>

            <span className="absolute left-1/2 -translate-x-1/2 text-white font-light text-2xl tracking-tight">
              Speed<span className="font-medium">+</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <Toolbar 
            onSave={() => console.log('Guardando...', blocks)} 
            onPreview={() => setShowPreview(true)}
            templateId={templateId}
          />
        </div>
      </div>

      {/* Elementos */}
      <div className="bg-white border-b border-gray-200 py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {blockTypes.map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddBlock(type)}
                className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200
                         hover:border-indigo-500 hover:shadow-lg transition-all min-w-[100px]"
              >
                <div className="p-2 bg-indigo-50 rounded-lg mb-2">
                  {getBlockIcon(type)}
                </div>
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  {getBlockLabel(type)}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
          <ErrorBoundary>
            <Canvas blocks={blocks} setBlocks={setBlocks} />
          </ErrorBoundary>
        </div>
      </div>

      <Preview 
        blocks={blocks}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}

function generateTemplateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TPL-${timestamp}-${randomStr}`.toUpperCase();
}

function getBlockIcon(type: BlockType) {
  const iconClass = "w-5 h-5 text-indigo-600";
  switch (type) {
    case 'header':
      return <Layout className={iconClass} />;
    case 'footer':
      return <LayoutTemplate className={iconClass} />;
    case 'sku':
      return <Tag className={iconClass} />;
    case 'image':
      return <Image className={iconClass} />;
    case 'price':
      return <DollarSign className={iconClass} />;
    case 'discount':
      return <Percent className={iconClass} />;
    case 'promotion':
      return <Gift className={iconClass} />;
    case 'logo':
      return <Image className={iconClass} />;
    default:
      return <Square className={iconClass} />;
  }
}

const blockLabels: Record<BlockType, string> = {
  header: 'Encabezado',
  footer: 'Pie de página',
  sku: 'SKU',
  image: 'Imagen',
  price: 'Precio',
  discount: 'Descuento',
  promotion: 'Promoción',
  logo: 'Logo'
};

function getBlockLabel(type: BlockType): string {
  return blockLabels[type] || type;
}