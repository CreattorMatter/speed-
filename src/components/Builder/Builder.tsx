import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import ToolPanel from './ToolPanel';
import { Block } from '../../types/builder';

type Tab = 'elements' | 'product' | 'history';

interface BuilderProps {
  onBack: () => void;
}

export default function Builder({ onBack }: BuilderProps) {
  const [activeTab, setActiveTab] = useState<Tab>('elements');
  const [blocks, setBlocks] = useState<Block[]>([]);

  const handleSave = () => {
    console.log('Guardando bloques:', blocks);
    // Aquí implementarías la lógica para guardar los bloques
  };

  const handlePreview = () => {
    console.log('Previsualizando bloques:', blocks);
    // Aquí implementarías la lógica para previsualizar
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="p-4 bg-white shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al inicio
        </button>
      </div>
      
      <Toolbar onSave={handleSave} onPreview={handlePreview} />
      
      <div className="flex flex-1 overflow-hidden">
        <Canvas />
        <ToolPanel activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}