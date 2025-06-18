import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PosterPreview as Poster } from '../features/posters/components/Posters/PosterPreview';
import { ArrowLeft } from 'lucide-react';

export const PosterPreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, promotion, company, showLogo } = location.state || {};

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="p-4 bg-white shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>
      </div>
      <div className="p-4">
        <Poster
          product={product}
          promotion={promotion}
          company={company}
          showTopLogo={showLogo}
          pricePerUnit={`${product.price * 2}`}
          points="49"
          origin="ARGENTINA"
          selectedFormat={{ id: 'a4', width: '210mm', height: '297mm', name: 'A4' }}
          zoom={1}
          cardSize={1}
        />
      </div>
    </div>
  );
}; 