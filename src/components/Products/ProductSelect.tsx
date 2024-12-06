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
  const customOption = {
    option: (provided: any, state: any) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      cursor: 'pointer',
      backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
      '&:hover': {
        backgroundColor: '#f3f4f6'
      }
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#e5e7eb',
      borderRadius: '4px'
    })
  };

  return (
    <Select
      isMulti
      options={products.map(p => ({ value: p.id, label: p.name }))}
      value={value}
      onChange={onChange}
      menuPlacement="top"
      maxMenuHeight={200}
      classNames={{
        control: () => className,
        menu: () => "bg-white rounded-lg shadow-lg",
        option: () => "px-3 py-2 hover:bg-gray-100 cursor-pointer"
      }}
      styles={customOption}
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