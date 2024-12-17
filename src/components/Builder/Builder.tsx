import React, { useState, useCallback } from 'react';
import { ArrowLeft, Layout, LayoutTemplate, Tag, Image, DollarSign, Percent, Gift, Square, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import Preview from './Preview';
import { Block, BlockType } from '../../types/builder';
import ErrorBoundary from './ErrorBoundary';
import { HeaderProvider } from '../shared/HeaderProvider';
import { Header } from '../shared/Header';
import { SaveTemplateModal } from './SaveTemplateModal';
import { SearchTemplateModal } from './SearchTemplateModal';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-hot-toast';
// @ts-ignore
import html2canvas from 'html2canvas/dist/html2canvas.min.js';

interface BuilderProps {
  onBack: () => void;
  userEmail: string;
  userName: string;
}

// Función utilitaria para calcular bounds y escala
const calculateBoundsAndScale = (blocks: Block[]) => {
  if (blocks.length === 0) {
    return { bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }, scale: 1 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  blocks.forEach(block => {
    minX = Math.min(minX, block.position.x);
    minY = Math.min(minY, block.position.y);
    maxX = Math.max(maxX, block.position.x + block.size.width);
    maxY = Math.max(maxY, block.position.y + block.size.height);
  });

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const scaleX = 800 / contentWidth;
  const scaleY = 600 / contentHeight;
  const scale = Math.min(scaleX, scaleY, 1);

  return {
    bounds: { minX, minY, maxX, maxY },
    scale
  };
};

export default function Builder({ onBack, userEmail, userName }: BuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [savingStep, setSavingStep] = useState<'idle' | 'generating' | 'uploading'>('idle');
  
  // Agregar estados para el canvas
  const [canvasSettings, setCanvasSettings] = useState({
    width: 800,
    height: 1200,
    background: '#ffffff'
  });

  const handleAddBlock = (type: BlockType) => {
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
  };

  const blockTypes: BlockType[] = [
    'container',
    'header', 
    'footer', 
    'sku', 
    'image', 
    'price', 
    'discount', 
    'promotion', 
    'logo'
  ];

  const generateThumbnail = async (): Promise<string> => {
    const canvas = document.querySelector('.builder-canvas');
    if (!canvas) return '';
    
    const screenshot = await html2canvas(canvas as HTMLElement);
    return screenshot.toDataURL('image/jpeg', 0.5);
  };

  const handleSaveTemplate = async (name: string, description: string) => {
    try {
      setIsSaving(true);
      setSavingStep('uploading');

      // Obtener el usuario actual de la base de datos
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError || !userData) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      // Preparar datos de la plantilla
      const templateData = {
        name,
        description,
        image_data: previewImage,
        canvas_settings: {
          blocks,
          settings: {
            width: 3000,
            height: 2000,
            background: '#ffffff'
          }
        },
        created_by: userData.id,
        is_public: false,
        version: '1.0'
      };

      console.log('Datos a guardar:', templateData); // Para debug

      // Guardar la plantilla
      const { data, error: templateError } = await supabase
        .from('builder')
        .insert([templateData])
        .select();

      if (templateError) {
        console.error('Error de Supabase:', templateError); // Para debug
        throw new Error(`Error al guardar la plantilla: ${templateError.message}`);
      }

      setIsSaveModalOpen(false);
      toast.success('¡Plantilla guardada exitosamente!');
    } catch (error) {
      console.error('Error completo:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar la plantilla');
    } finally {
      setIsSaving(false);
      setSavingStep('idle');
    }
  };

  // Modificar el handler del botón guardar
  const handleSaveClick = async () => {
    try {
      setIsSaving(true);
      setSavingStep('generating');

      const previewContainer = document.createElement('div');
      previewContainer.style.position = 'absolute';
      previewContainer.style.left = '-9999px';
      previewContainer.style.width = '800px';
      previewContainer.style.height = '600px';
      previewContainer.style.backgroundColor = 'white';
      document.body.appendChild(previewContainer);

      const { bounds, scale } = calculateBoundsAndScale(blocks);
      const sortedBlocks = [...blocks].sort((a, b) => {
        if (a.isContainer && !b.isContainer) return -1;
        if (!a.isContainer && b.isContainer) return 1;
        return 0;
      });

      // Crear contenedor para los bloques escalados
      const contentContainer = document.createElement('div');
      contentContainer.style.position = 'relative';
      contentContainer.style.width = `${(bounds.maxX - bounds.minX) * scale}px`;
      contentContainer.style.height = `${(bounds.maxY - bounds.minY) * scale}px`;
      contentContainer.style.transform = `scale(${scale})`;
      contentContainer.style.transformOrigin = '0 0';
      previewContainer.appendChild(contentContainer);

      // Renderizar cada bloque
      sortedBlocks.forEach(block => {
        const blockElement = document.createElement('div');
        blockElement.style.position = 'absolute';
        blockElement.style.left = `${(block.position.x - bounds.minX) * scale}px`;
        blockElement.style.top = `${(block.position.y - bounds.minY) * scale}px`;
        blockElement.style.width = `${block.size.width * scale}px`;
        blockElement.style.height = `${block.size.height * scale}px`;
        
        if (block.isContainer) {
          blockElement.style.border = '2px dashed rgb(165, 180, 252)';
          blockElement.style.backgroundColor = 'rgba(165, 180, 252, 0.1)';
        }
        
        if (block.content.imageUrl) {
          const img = document.createElement('img');
          img.src = block.content.imageUrl;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'contain';
          blockElement.appendChild(img);
        }
        
        contentContainer.appendChild(blockElement);
      });

      const screenshot = await html2canvas(previewContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: true,
      });

      document.body.removeChild(previewContainer);
      
      const imageBase64 = screenshot.toDataURL('image/jpeg', 0.9);
      setPreviewImage(imageBase64);
      setIsSaveModalOpen(true);
    } catch (error) {
      console.error('Error al generar vista previa:', error);
      toast.error('Error al generar la vista previa');
    } finally {
      setIsSaving(false);
      setSavingStep('idle');
    }
  };

  const handleDropInContainer = (containerId: string, blockId: string, position: { x: number, y: number }) => {
    setBlocks(prevBlocks => {
      const blockToMove = prevBlocks.find(b => b.id === blockId);
      const container = prevBlocks.find(b => b.id === containerId);
      
      if (!blockToMove || !container) return prevBlocks;

      // Remover el bloque de su posición actual
      const blocksWithoutMoved = prevBlocks.filter(b => b.id !== blockId);

      // Actualizar la posición del bloque dentro del contenedor
      const updatedBlock = {
        ...blockToMove,
        position,
        parentId: containerId
      };

      return [...blocksWithoutMoved, updatedBlock];
    });
  };

  const handleSelectTemplate = (template: any) => {
    try {
      // Parsear los datos de la plantilla
      const templateData = template.canvas_settings;
      
      // Validar que los bloques tengan la estructura correcta
      if (!Array.isArray(templateData.blocks)) {
        throw new Error('Formato de bloques inválido');
      }

      // Actualizar los bloques
      setBlocks(templateData.blocks);

      // Cerrar el modal de búsqueda
      setIsSearchModalOpen(false);
      
      // Mostrar mensaje de éxito
      toast.success('Plantilla cargada exitosamente');
    } catch (error) {
      console.error('Error al cargar la plantilla:', error);
      toast.error('Error al cargar la plantilla');
    }
  };

  const handleLogout = () => {
    // Implementar la lógica de logout aquí
    console.log('Logout');
  };

  return (
    <HeaderProvider userEmail={userEmail} userName={userName}>
      <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
        <Header onBack={onBack} onLogout={handleLogout} />
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <Toolbar 
              onSave={handleSaveClick} 
              onPreview={() => setShowPreview(true)}
              onSearch={() => setIsSearchModalOpen(true)}
              isSaving={isSaving}
            />
          </div>
        </div>

        {/* Elementos */}
        <div className="bg-white border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {blockTypes.map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAddBlock(type)}
                  className="flex flex-col items-center p-2.5 bg-white rounded-xl border border-gray-100
                           hover:border-indigo-500/20 hover:bg-indigo-50/50 hover:shadow-md 
                           transition-all duration-200 min-w-[85px] group"
                >
                  <div className="p-2 rounded-lg mb-2 group-hover:bg-white transition-colors duration-200">
                    {getBlockIcon(type)}
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-indigo-600 transition-colors duration-200">
                    {getBlockLabel(type)}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Canvas */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full">
            <ErrorBoundary>
              <Canvas 
                blocks={blocks} 
                setBlocks={setBlocks}
                onDropInContainer={handleDropInContainer}
              />
            </ErrorBoundary>
          </div>
        </div>

        <Preview 
          blocks={blocks}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />

        <SaveTemplateModal
          isOpen={isSaveModalOpen}
          onClose={() => {
            if (!isSaving) {
              setIsSaveModalOpen(false);
            }
          }}
          onSave={handleSaveTemplate}
          previewImage={previewImage}
          isSaving={isSaving}
          savingStep={savingStep}
        />

        <SearchTemplateModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>
    </HeaderProvider>
  );
}

function generateTemplateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TPL-${timestamp}-${randomStr}`.toUpperCase();
}

function getBlockIcon(type: BlockType) {
  const iconClass = "w-5 h-5 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-200";
  switch (type) {
    case 'container':
      return <Box className={iconClass} />;
    case 'header':
      return <Layout className={iconClass} />;
    case 'footer':
      return <LayoutTemplate className={iconClass} />;
    case 'sku':
      return <Tag className={iconClass} />;
    case 'image':
      return <Image className={iconClass} />;
    case 'price':
      return <DollarSign className={iconClass} />;
    case 'discount':
      return <Percent className={iconClass} />;
    case 'promotion':
      return <Gift className={iconClass} />;
    case 'logo':
      return <Image className={iconClass} />;
    default:
      return <Square className={iconClass} />;
  }
}

const blockLabels: Record<BlockType, string> = {
  container: 'Contenedor',
  header: 'Encabezado',
  footer: 'Pie de página',
  sku: 'SKU',
  image: 'Imagen',
  price: 'Precio',
  discount: 'Descuento',
  promotion: 'Promoción',
  logo: 'Logo'
};

function getBlockLabel(type: BlockType): string {
  return blockLabels[type] || type;
}