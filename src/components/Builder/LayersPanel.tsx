import React from 'react';
import { motion, Reorder } from 'framer-motion';
import { Layers, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { Block } from '../../types/builder';

interface LayersPanelProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
  selectedBlock: string | null;
  setSelectedBlock: (id: string | null) => void;
}

export default function LayersPanel({ blocks, setBlocks, selectedBlock, setSelectedBlock }: LayersPanelProps) {
  const [hiddenLayers, setHiddenLayers] = React.useState<string[]>([]);
  const [lockedLayers, setLockedLayers] = React.useState<string[]>([]);

  const toggleVisibility = (blockId: string) => {
    setHiddenLayers(prev =>
      prev.includes(blockId)
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    );
  };

  const toggleLock = (blockId: string) => {
    setLockedLayers(prev =>
      prev.includes(blockId)
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    );
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-gray-500" />
        <h2 className="font-medium text-gray-900">Capas</h2>
      </div>

      <Reorder.Group axis="y" values={blocks} onReorder={setBlocks}>
        {blocks.map((block) => (
          <Reorder.Item key={block.id} value={block}>
            <motion.div
              className={`p-2 rounded-lg mb-2 cursor-pointer flex items-center justify-between ${
                selectedBlock === block.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedBlock(block.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(block.id);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  {hiddenLayers.includes(block.id) ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <span className="text-sm text-gray-700">{block.type}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(block.id);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                {lockedLayers.includes(block.id) ? (
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