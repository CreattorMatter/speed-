import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo: string;
}

interface CompanySelectProps {
  value: string;
  onChange: (value: string) => void;
  companies: Company[];
}

export const CompanySelect: React.FC<CompanySelectProps> = ({ value, onChange, companies }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedCompany = companies.find(c => c.id === value);

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
        <div className="flex items-center gap-2">
          {selectedCompany ? (
            <>
              <img 
                src={selectedCompany.logo} 
                alt={selectedCompany.name} 
                className="w-6 h-6 object-contain"
              />
              <span>{selectedCompany.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Seleccionar empresa...</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul className="py-1 max-h-60 overflow-auto">
            {companies.map(company => (
              <li key={company.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(company.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-100
                            ${value === company.id ? 'bg-blue-50' : ''}`}
                >
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className="w-6 h-6 object-contain"
                  />
                  <span>{company.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 