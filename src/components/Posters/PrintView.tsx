import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PosterPreview } from './PosterPreview';

interface PrintViewProps {
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
  }>;
  promotion?: {
    discount: string;
    bank?: string;
    cardType?: string;
    conditions?: string[];
    startDate?: string;
    endDate?: string;
  };
  onBack: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({ products, promotion, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al editor</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Imprimir
          </button>
        </div>

        {/* Carteles */}
        <div className="space-y-8 print:space-y-0">
          {products.map(product => (
            <div key={product.id} className="print:break-after-page">
              <PosterPreview
                product={product}
                promotion={promotion}
                pricePerUnit={`${product.price * 2}`}
                points="49"
                origin="ARGENTINA"
                barcode="7790895000782"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 