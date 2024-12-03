import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Region {
  id: string;
  name: string;
}

interface RegionSelectProps {
  value: string;
  onChange: (value: string) => void;
  regions: Region[];
}

export const RegionSelect: React.FC<RegionSelectProps> = ({ value, onChange, regions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedRegion = regions.find(r => r.id === value);

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
        <span className={selectedRegion ? '' : 'text-gray-500'}>
          {selectedRegion ? selectedRegion.name : 'Seleccionar región...'}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {regions.map(region => (
              <li key={region.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(region.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100
                            ${value === region.id ? 'bg-blue-50' : ''}`}
                >
                  {region.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 