import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PosterPreview as Poster } from '../components/Posters/PosterPreview';
import { ArrowLeft } from 'lucide-react';

export const PosterPreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, promotion, company, showLogo } = location.state || {};

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white/80 hover:text-white mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Volver al editor</span>
        </button>

        {product && (
          <Poster
            product={product}
            promotion={promotion}
            company={company}
            showTopLogo={showLogo}
            pricePerUnit={`${product.price * 2}`}
            points="49"
            origin="ARGENTINA"
            barcode="7790895000782"
          />
        )}
      </div>
    </div>
  );
}; 