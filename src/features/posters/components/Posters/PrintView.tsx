import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PosterPreview } from './PosterPreview';
import { useLocation, useNavigate } from 'react-router-dom';
import { type Product } from '../../data/products';

const PAPER_SIZES = [
  { id: 'a3', name: 'A3', width: '297mm', height: '420mm', previewWidth: 595, previewHeight: 842 },
  { id: 'a4', name: 'A4', width: '210mm', height: '297mm', previewWidth: 420, previewHeight: 595 },
  { id: 'letter', name: 'Carta', width: '215.9mm', height: '279.4mm', previewWidth: 432, previewHeight: 559 },
  { id: 'legal', name: 'Oficio', width: '215.9mm', height: '355.6mm', previewWidth: 432, previewHeight: 711 },
  { id: 'tabloid', name: 'Tabloide', width: '279.4mm', height: '431.8mm', previewWidth: 559, previewHeight: 864 },
  { id: 'banderilla', name: 'Banderilla', width: '215.9mm', height: '279.4mm', previewWidth: 432, previewHeight: 559 },
  { id: 'cenefa-1-3', name: 'Cenefa 1/3', width: '215.9mm', height: '93.1mm', previewWidth: 432, previewHeight: 186 },
  { id: 'cenefa-1-6', name: 'Cenefa 1/6', width: '215.9mm', height: '46.6mm', previewWidth: 432, previewHeight: 93 },
];

export const PrintView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { products, promotion } = location.state || { products: [], promotion: undefined };
  const [selectedSize, setSelectedSize] = useState(PAPER_SIZES[1]); // A4 por defecto

  const handleBack = () => {
    navigate('/', { 
      replace: true,
      state: { 
        showPosterEditor: true,
        selectedProducts: products.map((p: Product) => p.id),
        selectedPromotion: promotion
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al editor</span>
          </button>
          <div className="flex items-center gap-4">
            <select
              value={selectedSize.id}
              onChange={(e) => {
                const size = PAPER_SIZES.find(s => s.id === e.target.value);
                if (size) setSelectedSize(size);
              }}
              className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none 
                       focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {PAPER_SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.name} ({size.width} × {size.height})
                </option>
              ))}
            </select>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Imprimir
            </button>
          </div>
        </div>

        {/* Carteles */}
        <div className="space-y-8 print:space-y-0">
          {products.map((product: Product) => (
            <div key={product.id} className="print:break-after-page mb-8">
              {/* Papel de fondo */}
              <div 
                className="bg-white shadow-lg mx-auto relative"
                style={{ 
                  width: selectedSize.previewWidth,
                  height: selectedSize.previewHeight,
                  padding: '20px',
                }}
              >
                {/* Guías de margen (solo en vista previa) */}
                <div className="absolute inset-0 border-2 border-dashed border-gray-200 m-4 print:hidden" />
                
                {/* Cartel */}
                <div 
                  className="absolute"
                  style={{ 
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '90%',
                    maxHeight: '90%',
                  }}
                >
                  <PosterPreview
                    product={product}
                    promotion={promotion}
                    pricePerUnit={`${product.price * 2}`}
                    points="49"
                    origin="ARGENTINA"
                    selectedFormat={{ id: selectedSize.id, width: selectedSize.width, height: selectedSize.height, name: selectedSize.name }}
                    zoom={1}
                    cardSize={0.8}
                  />
                </div>
              </div>
              
              {/* Información del tamaño (solo en vista previa) */}
              <div className="text-center mt-2 text-sm text-gray-500 print:hidden">
                {selectedSize.name} ({selectedSize.width} × {selectedSize.height})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>
        {`
          @media print {
            @page {
              size: ${selectedSize.width} ${selectedSize.height};
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .print\\:break-after-page {
              break-after: page;
            }
          }
        `}
      </style>
    </div>
  );
}; 