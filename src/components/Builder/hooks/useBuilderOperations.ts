import { useCallback } from 'react';
import { Block, BlockType } from '../../types/builder';
import { builderService } from '../../../lib/builderService';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';

export const useBuilderOperations = (
  blocks: Block[],
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>,
  canvasRef: React.RefObject<HTMLDivElement>
) => {
  const handleAddBlock = useCallback((type: BlockType) => {
    const newBlock: Block = {
      id: `${type}-${Date.now()}`,
      type,
      content: { text: `Nuevo bloque ${type}` },
      position: { x: 50, y: 50 },
      size: type === 'container' ? { width: 400, height: 300 } : { width: 200, height: 100 },
      isContainer: type === 'container',
      children: type === 'container' ? [] : undefined
    };
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
  }, [setBlocks]);

  const handleDropInContainer = useCallback((containerId: string, blockId: string, position: { x: number, y: number }) => {
    setBlocks(prevBlocks => prevBlocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          parentId: containerId,
          position
        };
      }
      return block;
    }));
  }, [setBlocks]);

  const handleSelectTemplate = useCallback(async (template: any) => {
    try {
      const blocks = JSON.parse(template.blocks);
      setBlocks(blocks);
    } catch (error) {
      console.error('Error al cargar la plantilla:', error);
      toast.error('Error al cargar la plantilla');
    }
  }, [setBlocks]);

  const getCanvasImage = useCallback(async (): Promise<string> => {
    if (!canvasRef.current) return '';
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Error al generar la imagen del canvas:', error);
      toast.error('Error al generar la imagen');
      return '';
    }
  }, [canvasRef]);

  const handleSaveTemplate = useCallback(async (name: string, description: string, isPublic: boolean) => {
    try {
      if (!name.trim()) {
        toast.error('Por favor, ingresa un nombre para la plantilla');
        return;
      }

      const blocksToSave = blocks.map(block => ({
        ...block,
        children: blocks.filter(b => b.parentId === block.id)
      }));

      const rootBlocks = blocksToSave.filter(block => !block.parentId);

      const templateData = {
        name,
        description: description || '',
        image_data: await getCanvasImage(),
        blocks: JSON.stringify(rootBlocks),
        canvas_settings: JSON.stringify({
          width: 800,
          height: 1200,
          background: '#ffffff'
        }),
        is_public: isPublic,
        version: '1.0'
      };

      await builderService.saveTemplate(templateData);
      toast.success('Plantilla guardada exitosamente');
      return true;
    } catch (error) {
      console.error('Error al guardar la plantilla:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar la plantilla');
      return false;
    }
  }, [blocks, getCanvasImage]);

  return {
    handleAddBlock,
    handleDropInContainer,
    handleSelectTemplate,
    getCanvasImage,
    handleSaveTemplate
  };
}; 