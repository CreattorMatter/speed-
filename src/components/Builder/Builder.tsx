import React, { useState, useCallback } from 'react';
import { ArrowLeft, Layout, LayoutTemplate, Tag, Image as ImageIcon, DollarSign, Percent, Gift, Square, Box } from 'lucide-react';
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
import { AIGeneratingModal } from './AIGeneratingModal';
import { builderService } from '../../lib/builderService';
import { PaperFormatSelector } from './PaperFormatSelector';
import { PAPER_FORMATS } from '../../constants/paperFormats';

interface BuilderProps {
  onBack: () => void;
  userEmail: string;
  userName: string;
  userRole?: 'admin' | 'limited';
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

export default function Builder({ onBack, userEmail, userName, userRole = 'admin' }: BuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [savingStep, setSavingStep] = useState<'idle' | 'generating' | 'uploading'>('idle');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(PAPER_FORMATS[2]); // A4 por defecto
  const [isLandscape, setIsLandscape] = useState(false);
  
  // Agregar estados para el canvas
  const [canvasSettings, setCanvasSettings] = useState({
    width: 800,
    height: 1200,
    background: '#ffffff'
  });

  // Efecto para verificar y mantener la sesión
  React.useEffect(() => {
    // Verificar sesión actual
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setSession(user);
    }

    // Suscribirse a cambios en la sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleSaveTemplate = async (name: string, description: string, isPublic: boolean) => {
    try {
      if (!name.trim()) {
        toast.error('Por favor, ingresa un nombre para la plantilla');
        return;
      }

      setIsSaving(true);
      setSavingStep('generating');

      // Preparar los bloques para guardar
      const blocksToSave = blocks.map(block => ({
        ...block,
        children: blocks.filter(b => b.parentId === block.id)
      }));

      // Filtrar solo los bloques raíz (sin parentId)
      const rootBlocks = blocksToSave.filter(block => !block.parentId);

      // Preparar los datos de la plantilla
      const templateData = {
        name,
        description: description || '',
        image_data: await getCanvasImage(),
        blocks: JSON.stringify(rootBlocks),
        canvas_settings: JSON.stringify({
          width: canvasSettings.width,
          height: canvasSettings.height,
          background: canvasSettings.background
        }),
        is_public: isPublic,
        created_by: userName,
        user_email: userEmail,
        version: '1.0'
      };

      console.log('Guardando plantilla:', templateData);

      await builderService.saveTemplate(templateData);
      
      setIsSaveModalOpen(false);
      
      toast.success('Plantilla guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar la plantilla:', error);
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
      console.log('Cargando plantilla:', template);
      
      let blocksToLoad = [];
      
      // Intentar parsear los bloques
      try {
        if (typeof template.blocks === 'string') {
          blocksToLoad = JSON.parse(template.blocks);
          console.log('Bloques parseados:', blocksToLoad);
        } else {
          blocksToLoad = template.blocks || [];
        }
      } catch (error) {
        console.error('Error al parsear bloques:', error);
        blocksToLoad = [];
      }

      // Si no hay bloques, crear un contenedor por defecto
      if (!blocksToLoad || blocksToLoad.length === 0) {
        blocksToLoad = [{
          id: `container-${Date.now()}`,
          type: 'container',
          content: { text: 'Contenedor principal' },
          position: { x: 50, y: 50 },
          size: { width: 800, height: 600 },
          isContainer: true,
          children: []
        }];
      }

      // Función recursiva para procesar bloques y sus hijos
      const processBlocksRecursively = (blocks: any[]): Block[] => {
        const processedBlocks: Block[] = [];

        blocks.forEach(block => {
          // Procesar el bloque actual
          const processedBlock: Block = {
            id: block.id || `block-${Date.now()}-${Math.random()}`,
            type: block.type || 'container',
            content: {
              text: block.content?.text || '',
              imageUrl: block.content?.imageUrl || block.content?.image_url || block.image_url || ''
            },
            position: {
              x: Number(block.position?.x) || 50,
              y: Number(block.position?.y) || 50
            },
            size: {
              width: Number(block.size?.width) || 200,
              height: Number(block.size?.height) || 100
            },
            isContainer: block.type === 'container',
            styles: block.styles || block.style || {},
            parentId: block.parentId || block.parent_id,
            children: [],
            zIndex: Number(block.zIndex || block.z_index) || (block.type === 'container' ? 0 : 1),
            layerOrder: Number(block.layerOrder || block.layer_order) || 0,
            rotation: Number(block.rotation) || 0,
            scale: block.scale || { x: 1, y: 1 }
          };

          processedBlocks.push(processedBlock);

          // Procesar los bloques hijos si existen
          if (block.children && Array.isArray(block.children)) {
            const childBlocks = processBlocksRecursively(block.children);
            childBlocks.forEach(childBlock => {
              childBlock.parentId = processedBlock.id;
              processedBlocks.push(childBlock);
            });
          }
        });

        return processedBlocks;
      };

      // Procesar todos los bloques
      const allBlocks = processBlocksRecursively(blocksToLoad);
      console.log('Todos los bloques procesados:', allBlocks);

      // Actualizar el estado con todos los bloques
      setBlocks(allBlocks);
      
      // Actualizar la configuración del canvas si existe
      if (template.canvas_settings) {
        try {
          const canvasConfig = typeof template.canvas_settings === 'string'
            ? JSON.parse(template.canvas_settings)
            : template.canvas_settings;

          setCanvasSettings({
            width: Number(canvasConfig.width) || 800,
            height: Number(canvasConfig.height) || 1200,
            background: canvasConfig.background || '#ffffff'
          });
        } catch (error) {
          console.error('Error al procesar la configuración del canvas:', error);
        }
      }
      
      toast.success('Plantilla cargada correctamente');
    } catch (error) {
      console.error('Error al cargar la plantilla:', error);
      toast.error('Error al cargar la plantilla');
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    // Crear un nuevo bloque de tipo imagen con la URL seleccionada
    const newBlock: Block = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: { 
        text: 'Imagen capturada',
        imageUrl: imageUrl 
      },
      position: { x: 50, y: 50 },
      size: { width: 300, height: 200 },
      isContainer: false
    };

    // Agregar el nuevo bloque al canvas
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    toast.success('Imagen agregada exitosamente');
  };

  const handleLogout = () => {
    // Implementar la lógica de logout aquí
    console.log('Logout');
  };

  const generateAITemplate = () => {
    // Función para generar números aleatorios dentro de un rango
    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
    
    // Generar tamaño aleatorio para el contenedor
    const containerWidth = random(600, 1000);
    const containerHeight = random(800, 1200);
    
    // Crear un contenedor principal con tamaño aleatorio
    const container: Block = {
      id: `container-${Date.now()}`,
      type: 'container',
      content: { text: 'Contenedor principal' },
      position: { x: 50, y: 50 },
      size: { width: containerWidth, height: containerHeight },
      isContainer: true,
      children: []
    };

    // Definir layouts posibles
    const layoutTypes = [
      'header', 'logo', 'image', 'sku', 'price', 'discount', 'promotion', 'footer'
    ];

    // Generar un orden aleatorio de los bloques
    const shuffledLayout = [...layoutTypes]
      .sort(() => Math.random() - 0.5)
      .map(type => ({
        type,
        height: random(60, type === 'image' ? 400 : 120),
        marginTop: random(10, 40)
      }));

    // Decidir si usar layout en columnas o filas
    const useColumns = Math.random() > 0.5;
    
    if (useColumns) {
      // Layout en columnas
      const numColumns = random(1, 2);
      const columnWidth = (containerWidth - 100) / numColumns;
      const columns = Array(numColumns).fill(null).map(() => [] as any[]);
      
      // Distribuir bloques en columnas
      shuffledLayout.forEach((block, index) => {
        columns[index % numColumns].push(block);
      });

      // Crear bloques para cada columna
      const blocks = columns.flatMap((column, columnIndex) => {
        let currentY = 30;
        return column.map((layout) => {
          const block: Block = {
            id: `${layout.type}-${Date.now()}-${Math.random()}`,
            type: layout.type as BlockType,
            content: { text: `Bloque ${layout.type}` },
            position: {
              x: 50 + (columnWidth * columnIndex),
              y: currentY
            },
            size: {
              width: columnWidth - 20,
              height: layout.height
            },
            parentId: container.id
          };
          currentY += layout.height + layout.marginTop;
          return block;
        });
      });

      // Ajustar altura del contenedor
      const maxColumnHeight = Math.max(...columns.map(column => 
        column.reduce((sum, block) => sum + block.height + block.marginTop, 0)
      ));
      container.size.height = maxColumnHeight + 60;

      setBlocks([container, ...blocks]);
    } else {
      // Layout en filas con posiciones aleatorias
      let currentY = 30;
      const blocks = shuffledLayout.map((layout) => {
        // Generar posición X aleatoria dentro de los mrgenes
        const maxX = containerWidth - (containerWidth - 100);
        const randomX = random(50, maxX);
        
        const block: Block = {
          id: `${layout.type}-${Date.now()}-${Math.random()}`,
          type: layout.type as BlockType,
          content: { text: `Bloque ${layout.type}` },
          position: {
            x: randomX,
            y: currentY
          },
          size: {
            width: random(containerWidth/3, containerWidth - 100),
            height: layout.height
          },
          parentId: container.id
        };
        
        currentY += layout.height + layout.marginTop;
        return block;
      });

      // Ajustar altura del contenedor
      container.size.height = currentY + 30;

      setBlocks([container, ...blocks]);
    }

    // Mostrar notificación de éxito
    toast.success('¡Plantilla generada con éxito!');
  };

  const handleGenerateAI = () => {
    setIsGeneratingAI(true);
  };

  const handleFinishGeneration = () => {
    setIsGeneratingAI(false);
    generateAITemplate();
  };

  // Función para obtener la imagen del canvas
  const getCanvasImage = async () => {
    const canvas = document.querySelector('.builder-canvas');
    if (!canvas) return '';
    
    try {
      const screenshot = await html2canvas(canvas as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: true,
      });
      return screenshot.toDataURL('image/jpeg', 0.9);
    } catch (error) {
      console.error('Error al generar imagen del canvas:', error);
      return '';
    }
  };

  return (
    <HeaderProvider userEmail={userEmail} userName={userName} userRole={userRole}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
        <Header onBack={onBack} onLogout={handleLogout} />
        <div className="min-h-screen flex flex-col bg-white">
          <main className="flex-1 flex flex-col">
            {/* Barra de herramientas */}
            <div className="bg-white border-b border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Guardar
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Vista previa
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSearchModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar plantilla
                  </button>

                  <button
                    onClick={handleGenerateAI}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generar con IA
                  </button>
                </div>
              </div>
            </div>

            {/* Área principal */}
            <div className="flex-1 flex">
              {/* Panel de herramientas */}
              <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
                <div className="space-y-4">
                  {/* Selector de formato de papel */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900">Formato de papel</h3>
                    <PaperFormatSelector
                      selectedFormat={selectedFormat}
                      onFormatChange={setSelectedFormat}
                      isLandscape={isLandscape}
                      onToggleLandscape={() => setIsLandscape(!isLandscape)}
                    />
                  </div>

                  {/* Bloques disponibles */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900">Bloques disponibles</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {blockTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => handleAddBlock(type)}
                          className="p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2"
                        >
                          {getBlockIcon(type)}
                          <span className="capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Área de trabajo */}
              <div className="flex-1 bg-gray-50 p-4">
                <Canvas
                  blocks={blocks}
                  setBlocks={setBlocks}
                  onDropInContainer={handleDropInContainer}
                  selectedFormat={selectedFormat}
                  isLandscape={isLandscape}
                />
              </div>
            </div>
          </main>
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
          onSelectImage={handleSelectImage}
        />

        <AIGeneratingModal 
          isOpen={isGeneratingAI}
          onFinish={handleFinishGeneration}
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
      return <ImageIcon className={iconClass} />;
    case 'price':
      return <DollarSign className={iconClass} />;
    case 'discount':
      return <Percent className={iconClass} />;
    case 'promotion':
      return <Gift className={iconClass} />;
    case 'logo':
      return <ImageIcon className={iconClass} />;
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