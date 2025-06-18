import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export type PromoType = 'Productos' | 'Todos los productos' | 'Medios de pago' | 'Financieras';

interface PromoTypeSelectProps {
  value: PromoType | '';
  onChange: (value: PromoType) => void;
}

const PROMO_TYPES: PromoType[] = [
  'Productos',
  'Todos los productos',
  'Medios de pago',
  'Financieras'
];

export const PromoTypeSelect: React.FC<PromoTypeSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        <span className={value ? '' : 'text-gray-500'}>
          {value || 'Seleccionar tipo de promoción...'}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {PROMO_TYPES.map(type => (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(type);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100
                            ${value === type ? 'bg-blue-50' : ''}`}
                >
                  {type}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 