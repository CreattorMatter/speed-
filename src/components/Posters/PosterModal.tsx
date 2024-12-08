import React from 'react';
import { X } from 'lucide-react';
import { PosterPreview } from './PosterPreview';
import { Product } from '../../types/product';
import { Promotion } from '../../types/promotion';

interface PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  promotion?: Promotion;
  company?: {
    id: string;
    name: string;
    logo: string;
  };
  showLogo?: boolean;
}

export const PosterModal: React.FC<PosterModalProps> = ({
  isOpen,
  onClose,
  product,
  promotion,
  company,
  showLogo = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/60 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        <PosterPreview
          product={product}
          promotion={promotion}
          company={company}
          showTopLogo={showLogo}
          pricePerUnit={`${product.price * 2}`}
          points="49"
          origin="ARGENTINA"
          barcode="7790895000782"
        />
      </div>
    </div>
  );
}; 