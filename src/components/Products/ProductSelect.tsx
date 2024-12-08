import React from 'react';
import Select from 'react-select';
import { Product } from '../../types/product';
import { Check } from 'lucide-react';

interface ProductSelectProps {
  value: string[];
  onChange: (value: any) => void;
  products: Product[];
  className?: string;
}

export const ProductSelect: React.FC<ProductSelectProps> = ({ 
  value, 
  onChange, 
  products,
  className 
}) => {
  console.log('ProductSelect recibió:', products);

  // Transformar los productos para el Select
  const options = products.map(p => ({ 
    value: p.id, 
    label: `${p.name} - ${p.category}`  // Agregar categoría para mejor identificación
  }));

  // Transformar el value actual para el Select
  const selectedValues = value.map(id => 
    options.find(opt => opt.value === id)
  ).filter(Boolean);

  return (
    <Select
      isMulti
      options={options}
      value={selectedValues}
      onChange={(newValue) => {
        const selectedIds = newValue ? newValue.map(v => v.value) : [];
        onChange(selectedIds);
      }}
      menuPlacement="top"
      maxMenuHeight={200}
      classNames={{
        control: () => className,
        menu: () => "bg-white rounded-lg shadow-lg",
        option: () => "px-3 py-2 hover:bg-gray-100 cursor-pointer"
      }}
      styles={{
        menu: (base) => ({
          ...base,
          zIndex: 40  // Aumentar el z-index para que esté por encima del cartel
        }),
        container: (base) => ({
          ...base,
          zIndex: 40  // Aumentar el z-index para que esté por encima del cartel
        })
      }}
      components={{
        Option: ({ children, isSelected, ...props }) => (
          <div
            {...props.innerProps}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer ${
              isSelected ? 'bg-indigo-50' : ''
            }`}
          >
            <div className={`w-4 h-4 border rounded flex items-center justify-center ${
              isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
            }`}>
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            {children}
          </div>
        )
      }}
    />
  );
}; 