import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  region: string;
}

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  locations: Location[];
  disabled?: boolean;
}

export const LocationSelect: React.FC<LocationSelectProps> = ({ value, onChange, locations, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLocation = locations.find(l => l.id === value);

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
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-left flex items-center justify-between
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
      >
        <span className={selectedLocation ? '' : 'text-gray-500'}>
          {selectedLocation ? selectedLocation.name : 'Seleccionar localidad...'}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {locations.map(location => (
              <li key={location.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(location.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100
                            ${value === location.id ? 'bg-blue-50' : ''}`}
                >
                  {location.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 