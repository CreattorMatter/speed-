import { useState, useEffect } from 'react';
import { Block } from '../types/builder';

interface Guide {
  position: number;
  type: 'vertical' | 'horizontal';
  strength: number;
}

export function useSmartGuides(blocks: Block[], selectedBlock: string | null) {
  const [guides, setGuides] = useState<Guide[]>([]);

  useEffect(() => {
    if (!selectedBlock) {
      setGuides([]);
      return;
    }

    const activeBlock = blocks.find(b => b.id === selectedBlock);
    if (!activeBlock) return;

    const newGuides: Guide[] = [];

    blocks.forEach(block => {
      if (block.id === selectedBlock) return;

      // Alineación central
      const blockCenterX = block.position.x + (block.size?.width || 0) / 2;
      const activeCenterX = activeBlock.position.x + (activeBlock.size?.width || 0) / 2;
      
      if (Math.abs(blockCenterX - activeCenterX) < 10) {
        newGuides.push({
          position: blockCenterX,
          type: 'vertical',
          strength: 1 - Math.abs(blockCenterX - activeCenterX) / 10
        });
      }

      // Alineación de bordes
      // ... similar lógica para bordes y alineación horizontal
    });

    setGuides(newGuides);
  }, [blocks, selectedBlock]);

  return guides;
} 