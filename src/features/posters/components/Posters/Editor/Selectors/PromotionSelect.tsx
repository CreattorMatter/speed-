import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl: string;
}

interface PromotionSelectProps {
  value: string;
  onChange: (value: string) => void;
  promotions: Promotion[];
}

export const PromotionSelect: React.FC<PromotionSelectProps> = ({ value, onChange, promotions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedPromotion = promotions.find(p => p.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-left flex items-center justify-between
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center gap-3">
          {selectedPromotion ? (
            <>
              <img 
                src={selectedPromotion.imageUrl} 
                alt={selectedPromotion.title}
                className="w-10 h-10 object-cover rounded"
              />
              <div className="flex flex-col">
                <span className="font-medium">{selectedPromotion.title}</span>
                <span className="text-sm text-gray-500">{selectedPromotion.discount}</span>
              </div>
            </>
          ) : (
            <span className="text-gray-500">Seleccionar promoción...</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul className="py-1 max-h-[300px] overflow-auto">
            {promotions.map(promotion => (
              <li key={promotion.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(promotion.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-3
                            ${value === promotion.id ? 'bg-blue-50' : ''}`}
                >
                  <img 
                    src={promotion.imageUrl} 
                    alt={promotion.title}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{promotion.title}</span>
                    <span className="text-sm text-gray-500">{promotion.description}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 