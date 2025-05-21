import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import Select from 'react-select';

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

interface ProductOption {
  value: string;
  label: string;
  price: number;
  category: string;
}


// Función para transformar un producto en una opción del selector
const mapProductToOption = (product: Product): ProductOption => ({
  value: product.id,
  label: product.name,
  price: product.price,
  category: product.category
});

export const ProductSelect: React.FC<ProductSelectProps> = ({
  value,
  onChange,
  products,
  ...props
}) => {
  // Transformar productos a opciones
  const options = products.map(mapProductToOption);

  // Personalizar el renderizado de cada opción
  const customOption = ({ label, price, category }: ProductOption) => (
    <div className="flex justify-between items-center py-1">
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-600">{category}</div>
      </div>
      <div className="text-sm font-medium text-gray-900">
        ${price.toLocaleString('es-AR')}
      </div>
    </div>
  );

  return (
    <Select
      isMulti
      options={options}
      value={options.filter(option => value.includes(option.value))}
      onChange={(selected) => {
        onChange(selected ? selected.map(option => option.value) : []);
      }}
      formatOptionLabel={customOption}
      styles={{
        control: (base) => ({
          ...base,
          backgroundColor: 'white',
          maxHeight: '120px',
          overflowY: 'auto'
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
          color: 'black',
          '&:hover': {
            backgroundColor: '#f3f4f6',

          }
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: '#f3f4f6',

        }),
        multiValueLabel: (base) => ({
          ...base,
          color: 'black'
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: 'white'
        })
      }}
      {...props}
    />
  );
}; 