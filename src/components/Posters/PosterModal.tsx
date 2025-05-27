import React from 'react';
import { X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';

// Importar selectores y acciones de Redux
import {
  selectSelectedPoster,
  selectShowLogo,
  setSelectedPoster,
} from '../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../store';

import { PosterPreview } from './PosterPreview';
import { type Product } from '../../data/products';
import { Promotion } from '../../types/promotion';

interface PosterModalProps {
  promotion?: Promotion;
  company?: {
    id: string;
    name: string;
    logo: string;
  };
}

export const PosterModal: React.FC<PosterModalProps> = ({
  promotion,
  company
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Obtener estado de Redux
  const selectedPoster = useSelector(selectSelectedPoster);
  const showLogo = useSelector(selectShowLogo);
  
  const isOpen = !!selectedPoster;

  const handleClose = () => {
    dispatch(setSelectedPoster(null));
  };

  if (!isOpen || !selectedPoster) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 text-white/60 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        <PosterPreview
          product={selectedPoster}
          promotion={promotion}
          company={company}
          showTopLogo={showLogo}
          pricePerUnit={`${selectedPoster.price * 2}`}
          points="49"
          origin="ARGENTINA"
          selectedFormat={{ id: 'A4', width: '210mm', height: '297mm', name: 'A4' }}
          zoom={1}
          cardSize={0.8}
        />
      </div>
    </div>
  );
}; 