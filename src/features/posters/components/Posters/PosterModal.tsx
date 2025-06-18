import React from 'react';
import { X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';

// Importar selectores y acciones de Redux
import {
  selectSelectedPoster,
  selectShowLogo,
  setSelectedPoster,
} from '../../../../store/features/poster/posterSlice';
import { RootState, AppDispatch } from '../../../../store';

import { PosterPreview } from './PosterPreview';
import { type Product } from '../../../../data/products';
import { type Promotion } from '../../../../types/promotion';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-2 xs:p-4">
      <div className="relative w-full max-w-xs xs:max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-auto">
        <button
          onClick={handleClose}
          className="absolute -top-8 xs:-top-10 sm:-top-12 right-0 text-white/60 hover:text-white p-1 xs:p-2 z-10"
        >
          <X className="w-5 h-5 xs:w-6 xs:h-6" />
        </button>
        
        <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden">
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
    </div>
  );
}; 