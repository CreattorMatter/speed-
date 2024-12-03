import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
}

export const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange, categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allCategories = ['Todos', ...categories];

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
          {value || 'Seleccionar categoría...'}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {allCategories.map(category => (
              <li key={category}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(category);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100
                            ${value === category ? 'bg-blue-50' : ''}`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 