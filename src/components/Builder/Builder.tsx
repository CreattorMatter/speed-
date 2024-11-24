import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import ToolPanel from './ToolPanel';
import Preview from './Preview';
import { Block, BlockType } from '../../types/builder';

type Tab = 'elements' | 'product' | 'history';

interface BuilderProps {
  onBack: () => void;
}

export default function Builder({ onBack }: BuilderProps) {
  const [activeTab, setActiveTab] = useState<Tab>('elements');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [templateId] = useState(() => generateTemplateId());

  const handleAddBlock = (type: BlockType, initialPosition: { x: number; y: number }) => {
    const newBlock: Block = {
      id: `${type}-${Date.now()}`,
      type,
      content: {},
      position: initialPosition,
      size: { width: 200, height: 100 }
    };
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <div className="bg-white/10 backdrop-blur-lg shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Volver al inicio</span>
            </motion.button>
          </div>
        </div>
      </div>
      
      <Toolbar 
        onSave={() => console.log('Guardando...', blocks)} 
        onPreview={() => setShowPreview(true)}
        templateId={templateId}
      />
      
      <div className="flex flex-1 overflow-hidden p-6">
        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
          <Canvas blocks={blocks} setBlocks={setBlocks} />
        </div>
        <ToolPanel 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onAddBlock={handleAddBlock}
        />
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