import React, { useState } from 'react';
import { PosterContent } from './Preview/PosterContent';
import { PriceSection } from './Preview/PriceSection';
import { FinancingInfo } from './Preview/FinancingInfo';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface FinancingOption {
  logo: string;
  bank: string;
  cardName: string;
  plan: string;
}

interface PosterPreviewProps {
  product?: Product;
  category?: string;
  promotion?: {
    discount: string;
    bank?: string;
    cardType?: string;
    conditions?: string[];
    startDate?: string;
    endDate?: string;
    type?: 'percentage' | '2x1' | '3x2' | 'second-70';
    title?: string;
    description?: string;
  };
  company?: {
    id: string;
    name: string;
    logo: string;
  };
  showTopLogo?: boolean;
  pricePerUnit?: string;
  points?: string;
  origin?: string;
  compact?: boolean;
  selectedFormat: {
    id: string;
    width: string;
    height: string;
    name: string;
  };
  zoom: number;
  cardSize: number;
  isLandscape?: boolean;
  financing?: FinancingOption[] | null;
  hideGrid?: boolean;
  fullscreen?: boolean;
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({
  product,
  category,
  promotion,
  company,
  showTopLogo = true,
  pricePerUnit,
  points,
  origin = 'ARGENTINA',
  compact = false,
  selectedFormat,
  zoom,
  cardSize,
  isLandscape = false,
  financing = null,
  hideGrid = false,
  fullscreen = false,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const roundedFontStyle = { 
    fontFamily: 'VAG Rounded BT, VAG Rounded Std, Arial Rounded MT Bold, Arial Black, sans-serif'
  };

  // Manejadores de arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.poster-content')) return;

    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const maxOffset = 500;
    
    setPosition({
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calcular dimensiones
  const paperWidth = isLandscape ? selectedFormat.height : selectedFormat.width;
  const paperHeight = isLandscape ? selectedFormat.width : selectedFormat.height;
  
  const baseWidth = compact ? 200 : 350;
  const aspectRatio = parseFloat(paperHeight.replace('mm', '')) / parseFloat(paperWidth.replace('mm', ''));
  const calculatedHeight = baseWidth * aspectRatio;

  const finalWidth = baseWidth * cardSize * zoom;
  const finalHeight = calculatedHeight * cardSize * zoom;

  return (
    <div 
      className={`flex items-center justify-center ${fullscreen ? 'h-screen' : 'min-h-[600px]'} bg-gray-100 overflow-hidden`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Hoja de papel */}
      <div
        className="bg-white shadow-2xl relative overflow-hidden poster-content"
        style={{
          width: `${finalWidth}px`,
          height: `${finalHeight}px`,
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Contenido principal */}
        <PosterContent
          product={product}
          category={category}
          company={company}
          showTopLogo={showTopLogo}
          hideGrid={hideGrid}
          roundedFontStyle={roundedFontStyle}
        />

        {/* Sección de precios */}
        <PriceSection
          product={product}
          promotion={promotion}
          roundedFontStyle={roundedFontStyle}
        />

        {/* Información de financiación */}
        <FinancingInfo
          financing={financing}
          roundedFontStyle={roundedFontStyle}
        />

        {/* QR Code (si hay producto) */}
        {product && (
          <div className="absolute bottom-4 left-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://speed-plus.com/product/${product.id}`}
              alt="QR Code"
              className="w-16 h-16"
            />
          </div>
        )}

        {/* Información adicional */}
        {product && (origin || points || pricePerUnit) && (
          <div className="absolute bottom-4 right-4 text-xs text-gray-600 text-right">
            {origin && <div>Origen: {origin}</div>}
            {points && <div>Puntos: {points}</div>}
            {pricePerUnit && <div>Precio por unidad: ${pricePerUnit}</div>}
          </div>
        )}
      </div>

      {/* Información del formato */}
      {!compact && (
        <div className="absolute top-4 left-4 bg-black/75 text-white px-3 py-1 rounded text-sm">
          {selectedFormat.name} • Zoom: {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}; 