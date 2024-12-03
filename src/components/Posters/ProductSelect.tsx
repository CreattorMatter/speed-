import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface ProductSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  products: Product[];
}

export const ProductSelect: React.FC<ProductSelectProps> = ({ value, onChange, products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selectedProducts = products.filter(p => value.includes(p.id));
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProduct = (productId: string) => {
    if (value.includes(productId)) {
      onChange(value.filter(id => id !== productId));
    } else {
      onChange([...value, productId]);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-left flex items-center justify-between
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex flex-wrap gap-2">
          {selectedProducts.length > 0 ? (
            selectedProducts.map(product => (
              <div 
                key={product.id}
                className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-md"
              >
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-6 h-6 object-cover rounded"
                />
                <span className="text-sm">{product.name}</span>
              </div>
            ))
          ) : (
            <span className="text-gray-500">Seleccionar productos...</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <ul className="py-1 max-h-[300px] overflow-auto">
            {filteredProducts.map(product => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-3
                            ${value.includes(product.id) ? 'bg-blue-50' : ''}`}
                >
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-gray-500">${product.price}</span>
                    </div>
                    <p className="text-sm text-gray-500">{product.description}</p>
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