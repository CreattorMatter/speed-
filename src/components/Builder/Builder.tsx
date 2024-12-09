import React, { useState, useCallback } from 'react';
import { ArrowLeft, Layout, LayoutTemplate, Tag, Image, DollarSign, Percent, Gift, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import Preview from './Preview';
import { Block, BlockType } from '../../types/builder';
import ErrorBoundary from './ErrorBoundary';
import { Product } from '../../types/product';
import { products as productData } from '../../data/products';
import { COMPANIES, Company } from '../../data/companies';
import { Promotion } from '../../types/promotion';
import { PAPER_FORMATS } from '../../constants/paperFormats';
import { PaperFormat } from '../../types/builder';

interface BuilderProps {
  onBack: () => void;
}

export default function Builder({ onBack }: BuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showPoints, setShowPoints] = useState(true);
  const [showOrigin, setShowOrigin] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [paperFormat, setPaperFormat] = useState<PaperFormat>(PAPER_FORMATS[2]); // A4 por defecto
  const [isLandscape, setIsLandscape] = useState(false);

  const handleCompanySelect = (company: Company | null) => {
    setSelectedCompany(company);
    
    if (company) {
      // Crear bloque de logo automáticamente
      const logoBlock: Block = {
        id: `logo-${Date.now()}`,
        type: 'logo',
        content: { imageUrl: company.logo },
        position: { x: 50, y: 50 },
        size: { width: 200, height: 80 }
      };

      setBlocks(prevBlocks => {
        // Remover logo anterior si existe
        const blocksWithoutLogo = prevBlocks.filter(block => block.type !== 'logo');
        return [...blocksWithoutLogo, logoBlock];
      });
    }
  };

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    
    if (product) {
      // Crear bloques automáticamente
      const newBlocks: Block[] = [
        // SKU
        {
          id: `sku-${Date.now()}`,
          type: 'sku',
          content: { text: product.sku },
          position: { x: 50, y: selectedCompany ? 150 : 50 },
          size: { width: 200, height: 50 }
        },
        // Precio
        {
          id: `price-${Date.now()}`,
          type: 'price',
          content: { text: `$${product.price.toLocaleString()}` },
          position: { x: 50, y: selectedCompany ? 220 : 120 },
          size: { width: 200, height: 80 }
        },
        // Imagen del producto
        {
          id: `image-${Date.now()}`,
          type: 'image',
          content: { imageUrl: product.imageUrl },
          position: { x: 50, y: selectedCompany ? 320 : 220 },
          size: { width: 300, height: 300 }
        },
        // Precio por unidad
        {
          id: `price-per-unit-${Date.now()}`,
          type: 'price-per-unit',
          content: { text: product.pricePerUnit },
          position: { x: 270, y: selectedCompany ? 220 : 120 },
          size: { width: 150, height: 40 }
        },
        // Puntos
        {
          id: `points-${Date.now()}`,
          type: 'points',
          content: { text: product.points },
          position: { x: 270, y: selectedCompany ? 270 : 170 },
          size: { width: 100, height: 40 }
        },
        // Origen
        {
          id: `origin-${Date.now()}`,
          type: 'origin',
          content: { text: product.origin },
          position: { x: 270, y: selectedCompany ? 320 : 220 },
          size: { width: 150, height: 40 }
        },
        // Código de barras
        {
          id: `barcode-${Date.now()}`,
          type: 'barcode',
          content: { text: product.barcode },
          position: { x: 50, y: selectedCompany ? 640 : 540 },
          size: { width: 200, height: 80 }
        },
        // Marca
        {
          id: `brand-${Date.now()}`,
          type: 'brand',
          content: { text: product.brand },
          position: { x: 50, y: selectedCompany ? 180 : 80 },
          size: { width: 200, height: 40 }
        },
        // Unidad de empaque
        {
          id: `pack-unit-${Date.now()}`,
          type: 'pack-unit',
          content: { text: product.packUnit },
          position: { x: 270, y: selectedCompany ? 180 : 80 },
          size: { width: 100, height: 40 }
        }
      ];

      setBlocks(prevBlocks => {
        // Mantener el logo y header/footer si existen
        const persistentBlocks = prevBlocks.filter(block => 
          block.type === 'logo' || 
          block.type === 'header' || 
          block.type === 'footer'
        );
        return [...persistentBlocks, ...newBlocks];
      });
    }
  };

  const handlePromotionSelect = (promotion: Promotion | null) => {
    setSelectedPromotion(promotion);
    
    if (promotion) {
      const promotionBlock: Block = {
        id: `promotion-${Date.now()}`,
        type: 'promotion',
        content: { 
          promotion,
          text: promotion.title 
        },
        position: { x: 50, y: selectedCompany ? 420 : 320 },
        size: { width: 300, height: 150 }
      };

      setBlocks(prevBlocks => {
        const blocksWithoutPromotion = prevBlocks.filter(block => block.type !== 'promotion');
        return [...blocksWithoutPromotion, promotionBlock];
      });
    }
  };

  const handleAddBlock = (block: Block) => {
    setBlocks(prevBlocks => {
      // Si es header o footer, remover el bloque existente del mismo tipo
      if (block.type === 'header' || block.type === 'footer') {
        const blocksWithoutType = prevBlocks.filter(b => b.type !== block.type);
        return [...blocksWithoutType, block];
      }
      return [...prevBlocks, block];
    });
  };

  const handleAlignBlock = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    // Implementar alineación
    console.log('Alineando bloque:', alignment);
  };

  const handleTextChange = useCallback((id: string, text: string) => {
    setBlocks(prevBlocks => prevBlocks.map(block => 
      block.id === id 
        ? { ...block, content: { ...block.content, text } }
        : block
    ));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex items-center bg-white border-b border-gray-200 px-4 h-16">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Volver</span>
        </button>
      </div>

      <div className="border-b border-gray-200 bg-white">
        <Toolbar
          onSave={() => console.log('Guardando...', blocks)}
          onPreview={() => setShowPreview(true)}
          products={productData}
          selectedProduct={selectedProduct}
          onProductSelect={handleProductSelect}
          companies={COMPANIES}
          selectedCompany={selectedCompany}
          onCompanySelect={handleCompanySelect}
          templateId={generateTemplateId()}
          selectedBlock={selectedBlock ? blocks.find(b => b.id === selectedBlock) : null}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          zoom={zoom}
          onZoomChange={setZoom}
          onAlignBlock={handleAlignBlock}
          selectedPromotion={selectedPromotion}
          onPromotionSelect={handlePromotionSelect}
          showPoints={showPoints}
          onTogglePoints={() => setShowPoints(!showPoints)}
          showOrigin={showOrigin}
          onToggleOrigin={() => setShowOrigin(!showOrigin)}
          showBarcode={showBarcode}
          onToggleBarcode={() => setShowBarcode(!showBarcode)}
          paperFormat={paperFormat}
          onPaperFormatChange={setPaperFormat}
          isLandscape={isLandscape}
          onToggleLandscape={() => setIsLandscape(!isLandscape)}
          onAddBlock={handleAddBlock}
        />
      </div>
      
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full bg-white rounded-xl shadow-lg">
          <ErrorBoundary>
            <Canvas 
              blocks={blocks} 
              setBlocks={setBlocks}
              selectedBlock={selectedBlock}
              onSelectBlock={setSelectedBlock}
              showGrid={showGrid}
              zoom={zoom}
              paperFormat={paperFormat}
              isLandscape={isLandscape}
              showPoints={showPoints}
              showOrigin={showOrigin}
              showBarcode={showBarcode}
              onTextChange={handleTextChange}
            />
          </ErrorBoundary>
        </div>
      </div>

      <Preview 
        blocks={blocks}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        paperFormat={paperFormat}
        isLandscape={isLandscape}
        company={selectedCompany}
        promotion={selectedPromotion}
        showPoints={showPoints}
        showOrigin={showOrigin}
        showBarcode={showBarcode}
      />
    </div>
  );
}

function generateTemplateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TPL-${timestamp}-${randomStr}`.toUpperCase();
}

function getBlockIcon(type: BlockType) {
  const iconClass = "w-5 h-5 text-indigo-600";
  switch (type) {
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
  header: 'Encabezado',
  footer: 'Pie de página',
  sku: 'SKU',
  image: 'Imagen',
  price: 'Precio',
  discount: 'Descuento',
  promotion: 'Promoción',
  logo: 'Logo',
  points: 'Puntos',
  origin: 'Origen',
  barcode: 'Código de barras'
};

function getBlockLabel(type: BlockType): string {
  return blockLabels[type] || type;
}