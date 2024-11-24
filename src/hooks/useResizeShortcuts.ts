import { useHotkeys } from 'react-hotkeys-hook';
import { Block } from '../types/builder';

const RESIZE_STEP = 10; // Píxeles por cada ajuste
const FINE_RESIZE_STEP = 1; // Para ajuste fino

export function useResizeShortcuts(
  blocks: Block[],
  setBlocks: (blocks: Block[]) => void,
  selectedBlock: string | null
) {
  // Redimensionar con flechas + Alt
  useHotkeys('alt+up', () => {
    if (!selectedBlock) return;
    setBlocks(blocks.map(block =>
      block.id === selectedBlock
        ? {
            ...block,
            size: {
              ...block.size,
              height: (block.size?.height || 100) - RESIZE_STEP
            }
          }
        : block
    ));
  });

  useHotkeys('alt+down', () => {
    if (!selectedBlock) return;
    setBlocks(blocks.map(block =>
      block.id === selectedBlock
        ? {
            ...block,
            size: {
              ...block.size,
              height: (block.size?.height || 100) + RESIZE_STEP
            }
          }
        : block
    ));
  });

  useHotkeys('alt+left', () => {
    if (!selectedBlock) return;
    setBlocks(blocks.map(block =>
      block.id === selectedBlock
        ? {
            ...block,
            size: {
              ...block.size,
              width: (block.size?.width || 200) - RESIZE_STEP
            }
          }
        : block
    ));
  });

  useHotkeys('alt+right', () => {
    if (!selectedBlock) return;
    setBlocks(blocks.map(block =>
      block.id === selectedBlock
        ? {
            ...block,
            size: {
              ...block.size,
              width: (block.size?.width || 200) + RESIZE_STEP
            }
          }
        : block
    ));
  });

  // Ajuste fino con Shift + Alt + flechas
  useHotkeys('shift+alt+up', () => {
    if (!selectedBlock) return;
    setBlocks(blocks.map(block =>
      block.id === selectedBlock
        ? {
            ...block,
            size: {
              ...block.size,
              height: (block.size?.height || 100) - FINE_RESIZE_STEP
            }
          }
        : block
    ));
  });

  // ... similar para otras direcciones con ajuste fino ...

  // Presets con números
  useHotkeys('alt+1', () => {
    if (!selectedBlock) return;
    setBlocks(blocks.map(block =>
      block.id === selectedBlock
        ? {
            ...block,
            size: getPresetSize(block.type, 'small')
          }
        : block
    ));
  });

  useHotkeys('alt+2', () => {
    if (!selectedBlock) return;
    setBlocks(blocks.map(block =>
      block.id === selectedBlock
        ? {
            ...block,
            size: getPresetSize(block.type, 'medium')
          }
        : block
    ));
  });

  useHotkeys('alt+3', () => {
    if (!selectedBlock) return;
    setBlocks(blocks.map(block =>
      block.id === selectedBlock
        ? {
            ...block,
            size: getPresetSize(block.type, 'large')
          }
        : block
    ));
  });
}

function getPresetSize(blockType: string, size: 'small' | 'medium' | 'large') {
  const presets = {
    header: {
      small: { width: 600, height: 80 },
      medium: { width: 800, height: 100 },
      large: { width: 1000, height: 120 }
    },
    footer: {
      small: { width: 600, height: 60 },
      medium: { width: 800, height: 80 },
      large: { width: 1000, height: 100 }
    },
    image: {
      small: { width: 200, height: 150 },
      medium: { width: 400, height: 300 },
      large: { width: 600, height: 450 }
    },
    // ... otros presets para diferentes tipos de bloques ...
  };

  return presets[blockType]?.[size] || { width: 200, height: 100 };
} 