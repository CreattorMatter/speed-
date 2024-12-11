import React, { useState } from 'react';

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
  barcode?: string;
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
}

// Definimos los formatos de papel disponibles
const PAPER_FORMATS = [
  { id: 'A2', width: '420mm', height: '594mm', name: 'A2 (420 × 594 mm)' },
  { id: 'A3', width: '297mm', height: '420mm', name: 'A3 (297 × 420 mm)' },
  { id: 'A4', width: '210mm', height: '297mm', name: 'A4 (210 × 297 mm)' },
  { id: 'letter', width: '215.9mm', height: '279.4mm', name: 'Carta (215.9 × 279.4 mm)' },
  { id: 'legal', width: '215.9mm', height: '355.6mm', name: 'Legal (215.9 × 355.6 mm)' }
];

export const PosterPreview: React.FC<PosterPreviewProps> = ({
  product,
  category,
  promotion,
  company,
  showTopLogo = true,
  pricePerUnit,
  points,
  origin = 'ARGENTINA',
  barcode,
  compact = false,
  selectedFormat,
  zoom,
  cardSize,
  isLandscape = false,
  financing = null
}) => {
  // En el componente, agregamos el estado para el formato seleccionado
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Manejadores de movimiento
  const handleMouseDown = (e: React.MouseEvent) => {
    // Solo activar el arrastre si se hace clic en el cartel
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
    
    // Calcular nueva posición
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Limitar el movimiento dentro de la hoja
    const maxOffset = 500; // Aumentamos el rango de movimiento
    setPosition({
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, newY))
    });
  };

  // Calcular el precio con descuento
  const calculatePrice = () => {
    if (!promotion) return {
      finalPrice: product?.price || 0,
      unitPrice: product?.price || 0,
      totalUnits: 1,
      savedAmount: 0,
      secondUnitPrice: 0
    };

    switch (promotion.type) {
      case 'second-70':
        const secondUnitPrice = product?.price * 0.3 || 0; // 70% de descuento en la segunda unidad
        return {
          finalPrice: product?.price + secondUnitPrice || 0,
          unitPrice: (product?.price + secondUnitPrice) / 2,
          totalUnits: 2,
          savedAmount: product?.price * 0.7 || 0,
          secondUnitPrice
        };
      case '2x1':
        return {
          finalPrice: product?.price || 0,
          unitPrice: product?.price / 2 || 0,
          totalUnits: 2,
          savedAmount: product?.price || 0
        };
      case '3x2':
        return {
          finalPrice: product?.price * 2 || 0,
          unitPrice: (product?.price * 2) / 3 || 0,
          totalUnits: 3,
          savedAmount: product?.price || 0
        };
      default:
        // Descuento porcentual normal
        const discountMatch = promotion.discount.match(/(\d+)/);
        if (!discountMatch) return {
          finalPrice: product?.price || 0,
          unitPrice: product?.price || 0,
          totalUnits: 1,
          savedAmount: 0
        };
        
        const discountPercent = parseInt(discountMatch[0]);
        const finalPrice = product?.price * (1 - discountPercent / 100) || 0;
        return {
          finalPrice,
          unitPrice: finalPrice,
          totalUnits: 1,
          savedAmount: product?.price - finalPrice || 0
        };
    }
  };

  const priceInfo = calculatePrice();

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://speed-plus.com/product/${product?.id}`;

  const roundedFontStyle = { 
    fontFamily: 'VAG Rounded BT, VAG Rounded Std, Arial Rounded MT Bold, Arial Black, sans-serif'
  };

  // Función para renderizar las condiciones y vigencia
  const renderConditionsAndDates = () => {
    if (!promotion) return null;

    return (
      <div className="text-right px-4">
        {promotion.conditions && promotion.conditions.length > 0 && (
          <div className="text-[14px]" style={roundedFontStyle}>
            <span className="text-gray-600">Condiciones:</span><br />
            {promotion.conditions.map((condition, index) => (
              <div key={index}>• {condition}</div>
            ))}
          </div>
        )}
        {(promotion.startDate || promotion.endDate) && (
          <div className="text-[14px] mt-2" style={roundedFontStyle}>
            <span className="text-gray-600">Vigencia:</span><br />
            {promotion.startDate && <div>Del {new Date(promotion.startDate).toLocaleDateString()}</div>}
            {promotion.endDate && <div>al {new Date(promotion.endDate).toLocaleDateString()}</div>}
          </div>
        )}
      </div>
    );
  };

  // Función para renderizar el contenido principal
  const renderContent = () => {
    if (product) {
      return (
        <>
          <div className="text-4xl font-bold text-black tracking-tight leading-tight uppercase px-4 max-h-[120px] overflow-hidden">
            {product.name}
          </div>
          {/* Descuento y Condiciones para productos */}
          {promotion && (
            <div className="relative h-[70px]">
              <div className="flex items-center justify-center">
                <div className="bg-red-600 text-white px-6 py-2 rounded-full text-3xl font-bold">
                  {promotion.discount}
                </div>
              </div>
              {/* Condiciones y vigencia */}
              <div className="absolute top-0 right-4">
                {renderConditionsAndDates()}
              </div>
            </div>
          )}
        </>
      );
    } else if (category) {
      return (
        <div className="flex h-full">
          {/* Contenido principal centrado */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-6xl font-black text-black tracking-tight leading-tight uppercase text-center mb-8">
              {category}
            </div>
            {promotion && (
              <div className="text-4xl font-bold text-red-600 text-center mb-8">
                {promotion.title || promotion.discount}
              </div>
            )}
            {financing && financing.length > 0 && (
              <div className="flex flex-col gap-1">
                {financing.map((fin, index) => (
                  <div key={index} className="bg-indigo-600 text-white py-0.5 px-2 rounded text-xs">
                    {fin.plan} - {fin.bank}
                  </div>
                ))}
              </div>
            )}
            <div className="text-2xl text-gray-600 text-center">
              Ver productos seleccionados
            </div>
          </div>

          {/* Condiciones y vigencia al costado */}
          {promotion && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-[300px] text-right">
              {promotion.conditions && promotion.conditions.length > 0 && (
                <div className="text-[14px] mb-4" style={roundedFontStyle}>
                  <span className="text-gray-600 font-medium">Condiciones:</span><br />
                  {promotion.conditions.map((condition, index) => (
                    <div key={index} className="mt-1">• {condition}</div>
                  ))}
                </div>
              )}
              {(promotion.startDate || promotion.endDate) && (
                <div className="text-[14px]" style={roundedFontStyle}>
                  <span className="text-gray-600 font-medium">Vigencia:</span><br />
                  {promotion.startDate && (
                    <div className="mt-1">Del {new Date(promotion.startDate).toLocaleDateString()}</div>
                  )}
                  {promotion.endDate && (
                    <div>al {new Date(promotion.endDate).toLocaleDateString()}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Función para renderizar la sección de precios
  const renderPriceSection = () => {
    if (!product) return null;

    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[160px] relative">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[50px] text-gray-400 line-through">
            ${product.price.toLocaleString('es-AR')}
          </span>
        </div>

        <div className="text-center">
          <span className="text-[90px] font-black leading-none block">
            ${Math.round(priceInfo.finalPrice).toLocaleString('es-AR')}
          </span>

          {financing && financing.length > 0 && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3">
              {financing.map((fin, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-white rounded-lg p-0 shadow-sm"
                  style={{
                    minWidth: '130px',
                    height: '90px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <img 
                    src={fin.logo} 
                    alt={fin.bank} 
                    className="w-full h-full object-contain p-2"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {financing && financing.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {financing.map((fin, index) => (
                <div 
                  key={index} 
                  className="bg-indigo-600 text-white py-1.5 px-4 rounded-full text-sm font-medium"
                >
                  {fin.plan}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Función para renderizar la sección inferior
  const renderBottomSection = () => {
    if (!product) return null; // No mostrar sección inferior si no hay producto

    return (
      <div className="h-[120px] flex flex-col justify-end pb-4">
        <div className="grid grid-cols-2 gap-4 text-gray-800 px-4">
          <div className="space-y-1 text-left">
            <div className="text-base font-medium">
              ORIGEN: {origin}
            </div>
          </div>
          <div className="text-right">
            {points && (
              <div className="text-base font-bold">
                SUMÁ {points} PUNTOS JUMBO MÁS
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-end mt-4 px-4">
          <div className="text-base text-left">
            SKU: {barcode}
          </div>
          <div className="flex items-center gap-2">
            <img 
              src={qrUrl}
              alt="QR Code"
              className="w-16 h-16 rounded bg-white"
            />
            <span className="text-xs text-gray-500 text-left">
              más información<br />del producto
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Renderizado normal cuando no es modal
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
      <div className="flex gap-4 items-start">
        {/* Área de la hoja con zoom y movimiento */}
        <div 
          className="relative overflow-hidden flex items-center justify-center"
          style={{
            width: '100vw',
            height: '90vh',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <div className="relative"> {/* Contenedor para la hoja y los controles */}
            {/* Mantener solo la hoja */}
            <div 
              className="bg-white shadow-xl relative transition-transform"
              style={{ 
                width: isLandscape ? selectedFormat.height : selectedFormat.width, 
                height: isLandscape ? selectedFormat.width : selectedFormat.height,
                transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center center',
                backgroundImage: `
                  linear-gradient(to right, #f0f0f0 1px, transparent 1px),
                  linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
                `,
                backgroundSize: '10mm 10mm',
              }}
            >
              {/* Cartel */}
              <div 
                className="poster-content absolute inset-0 flex items-center justify-center z-[9000]"
              >
                {compact ? (
                  <div className="transform" style={{ transform: `scale(${cardSize})` }}>
                    <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden z-0 w-[900px] h-[200px] flex">
                      {/* Logo en modo lista */}
                      {company?.logo && showTopLogo && (
                        <div className="w-[200px] p-4 flex items-center justify-center border-r border-gray-100">
                          <img 
                            src={company.logo}
                            alt={company.name}
                            className="h-full w-auto object-contain"
                          />
                        </div>
                      )}

                      {/* Contenido en modo lista */}
                      <div className="flex-1 p-6 flex justify-between items-center">
                        <div className="flex-1 px-6" style={roundedFontStyle}>
                          <h1 className="text-2xl font-black text-black leading-none">
                            {product?.name.toLowerCase()}
                          </h1>
                          <div className="mt-2 flex items-center gap-4">
                            <span className="text-2xl text-gray-400 line-through">
                              ${product?.price.toLocaleString('es-AR')}
                            </span>
                            {promotion && (
                              <div className="bg-red-600 text-center text-white px-4 py-1 rounded-full text-lg font-bold">
                                {promotion.discount}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="text-4xl font-black text-black" style={roundedFontStyle}>
                            ${Math.round(priceInfo.finalPrice).toLocaleString('es-AR')}
                          </div>
                          {financing && financing.length > 0 && (
                            <div className="flex flex-col gap-1">
                              {financing.map((fin, index) => (
                                <div key={index} className="bg-indigo-600 text-white py-0.5 px-2 rounded text-xs">
                                  {fin.plan} - {fin.bank}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-4">
                            <div className="text-sm text-gray-600">SKU: {barcode}</div>
                            <img src={qrUrl} alt="QR Code" className="w-12 h-12" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="transform bg-white rounded-lg shadow-2xl overflow-hidden"
                    style={{ 
                      transform: `scale(${cardSize})`,
                      width: '900px',  // Ancho fijo
                      height: '600px', // Alto fijo
                    }}
                  >
                    <div className="space-y-4 text-center relative h-full flex flex-col justify-center" style={roundedFontStyle}>
                      {/* Logo de fondo translúcido - Movido fuera de la sección de logo */}
                      {company?.logo && (
                        <div className="absolute inset-0 z-0 pointer-events-none">
                          <img 
                            src={company.logo}
                            alt={company.name}
                            style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%) rotate(-30deg)',
                              opacity: 0.08,
                              objectFit: 'contain',
                              filter: 'grayscale(0%)',
                              mixBlendMode: 'multiply',
                              transformOrigin: 'center center'
                            }}
                          />
                        </div>
                      )}

                      {/* Logo section - solo para el logo superior */}
                      <div className="h-[100px] relative z-10">
                        {showTopLogo && company?.logo && (
                          <div className="absolute left-1 top-1">
                            <img 
                              src={company.logo}
                              alt={company.name}
                              className="h-24 w-auto object-contain"
                            />
                          </div>
                        )}
                      </div>

                      {renderContent()}

                      {/* Sección de precios - solo si hay producto */}
                      {renderPriceSection()}

                      {/* Sección inferior - solo si hay producto */}
                      {renderBottomSection()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 