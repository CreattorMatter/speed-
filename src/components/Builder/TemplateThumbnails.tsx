import React from 'react';
import { motion } from 'framer-motion';
import { Block } from '../../types/builder';

interface TemplateThumbnailsProps {
  templates: { id: string; name: string; blocks: Block[]; updatedAt: Date }[];
  onSelect: (template: any) => void;
}

export default function TemplateThumbnails({ templates, onSelect }: TemplateThumbnailsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {templates.map((template) => (
        <motion.div
          key={template.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
          onClick={() => onSelect(template)}
        >
          <div className="relative aspect-video bg-gray-50">
            {/* Miniatura de la plantilla */}
            <div className="absolute inset-0 p-2">
              {template.blocks.map((block) => (
                <div
                  key={block.id}
                  className="absolute bg-gray-200 rounded"
                  style={{
                    left: `${(block.position.x / 1000) * 100}%`,
                    top: `${(block.position.y / 1000) * 100}%`,
                    width: `${(block.size?.width || 100) / 10}px`,
                    height: `${(block.size?.height || 50) / 10}px`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-medium text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-500">
              {new Date(template.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 