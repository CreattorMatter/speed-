import { useHotkeys } from 'react-hotkeys-hook';
import { Block } from '../types/builder';

export function useKeyboardShortcuts(
  blocks: Block[],
  setBlocks: (blocks: Block[]) => void,
  selectedBlock: string | null,
  onSave: () => void,
  onPreview: () => void
) {
  // Guardar
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    onSave();
  });

  // Previsualizar
  useHotkeys('ctrl+p, cmd+p', (e) => {
    e.preventDefault();
    onPreview();
  });

  // Eliminar bloque seleccionado
  useHotkeys('delete, backspace', () => {
    if (selectedBlock) {
      setBlocks(blocks.filter(block => block.id !== selectedBlock));
    }
  });

  // Duplicar bloque
  useHotkeys('ctrl+d, cmd+d', (e) => {
    e.preventDefault();
    if (selectedBlock) {
      const block = blocks.find(b => b.id === selectedBlock);
      if (block) {
        const newBlock = {
          ...block,
          id: `${block.type}-${Date.now()}`,
          position: {
            x: block.position.x + 20,
            y: block.position.y + 20
          }
        };
        setBlocks([...blocks, newBlock]);
      }
    }
  });

  // Mover bloque con flechas
  useHotkeys('up', () => {
    if (selectedBlock) {
      setBlocks(blocks.map(block =>
        block.id === selectedBlock
          ? { ...block, position: { ...block.position, y: block.position.y - 10 } }
          : block
      ));
    }
  });

  useHotkeys('down', () => {
    if (selectedBlock) {
      setBlocks(blocks.map(block =>
        block.id === selectedBlock
          ? { ...block, position: { ...block.position, y: block.position.y + 10 } }
          : block
      ));
    }
  });

  useHotkeys('left', () => {
    if (selectedBlock) {
      setBlocks(blocks.map(block =>
        block.id === selectedBlock
          ? { ...block, position: { ...block.position, x: block.position.x - 10 } }
          : block
      ));
    }
  });

  useHotkeys('right', () => {
    if (selectedBlock) {
      setBlocks(blocks.map(block =>
        block.id === selectedBlock
          ? { ...block, position: { ...block.position, x: block.position.x + 10 } }
          : block
      ));
    }
  });
} 