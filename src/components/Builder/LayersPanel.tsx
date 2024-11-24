import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Layers, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { Block } from '../../types/builder';

interface LayersPanelProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
  selectedBlock: string | null;
  setSelectedBlock: (id: string | null) => void;
}

interface Layer extends Block {
  isVisible: boolean;
  isLocked: boolean;
  zIndex: number;
}

export default function LayersPanel({ blocks, setBlocks, selectedBlock, setSelectedBlock }: LayersPanelProps) {
  const [layers, setLayers] = useState<Layer[]>(
    blocks.map((block, index) => ({
      ...block,
      isVisible: true,
      isLocked: false,
      zIndex: blocks.length - index
    }))
  );

  const toggleVisibility = (blockId: string) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === blockId
          ? { ...layer, isVisible: !layer.isVisible }
          : layer
      )
    );
  };

  const toggleLock = (blockId: string) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === blockId
          ? { ...layer, isLocked: !layer.isLocked }
          : layer
      )
    );
  };

  const handleReorder = (reorderedLayers: Layer[]) => {
    const updatedLayers = reorderedLayers.map((layer, index) => ({
      ...layer,
      zIndex: reorderedLayers.length - index
    }));
    setLayers(updatedLayers);
    setBlocks(updatedLayers);
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-gray-500" />
        <h2 className="font-medium text-gray-900">Capas</h2>
      </div>

      <Reorder.Group axis="y" values={layers} onReorder={handleReorder}>
        {layers.map((layer) => (
          <Reorder.Item key={layer.id} value={layer}>
            <motion.div
              className={`p-2 rounded-lg mb-2 cursor-pointer flex items-center justify-between ${
                selectedBlock === layer.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedBlock(layer.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(layer.id);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  {layer.isVisible ? (
                    <Eye className="w-4 h-4 text-gray-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <span className="text-sm text-gray-700">{layer.type}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(layer.id);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                {layer.isLocked ? (
                  <Lock className="w-4 h-4 text-gray-600" />
                ) : (
                  <Unlock className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
} 