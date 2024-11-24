import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import ToolPanel from './ToolPanel';
import Preview from './Preview';
import { Block } from '../../types/builder';

type Tab = 'elements' | 'product' | 'history';

interface BuilderProps {
  onBack: () => void;
}

export default function Builder({ onBack }: BuilderProps) {
  const [activeTab, setActiveTab] = useState<Tab>('elements');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [templateId] = useState(() => generateTemplateId());

  const handleSave = () => {
    console.log('Guardando plantilla:', { id: templateId, blocks });
    // Implementar lógica de guardado
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Volver al inicio</span>
            </motion.button>
          </div>
        </div>
      </div>
      
      <Toolbar 
        onSave={handleSave} 
        onPreview={handlePreview}
        templateId={templateId}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Canvas blocks={blocks} setBlocks={setBlocks} />
        <ToolPanel activeTab={activeTab} setActiveTab={setActiveTab} />
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