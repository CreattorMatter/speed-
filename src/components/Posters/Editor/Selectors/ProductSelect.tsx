import React from 'react';
import Select, { components, OptionProps, MultiValue } from "react-select";

// Importamos la interfaz Product desde el archivo de tipos
import { type Product } from '../../../../data/products';

interface ProductOption {
  label: string;
  value: Product;
}

interface ProductSelectProps {
  products: Product[];
  value: ProductOption | ProductOption[] | null;
  onChange: (selectedOption: ProductOption | ProductOption[] | null) => void;
  className?: string;
  placeholder?: string;
  isMulti?: boolean;
}

// Componente personalizado para mostrar el SKU junto al nombre
const CustomOption = (props: OptionProps<ProductOption>) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div className="flex flex-col py-1">
        <div className="font-medium text-gray-900">{data.label}</div>
        {data.value.sku && (
          <div className="text-sm text-blue-600 font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            SKU: {data.value.sku}
          </div>
        )}
        {data.value.price && (
          <div className="text-sm text-green-600 font-medium">
            ${Number(data.value.price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
      </div>
    </components.Option>
  );
};

export const ProductSelect: React.FC<ProductSelectProps> = ({
  products,
  value,
  onChange,
  className = "",
  placeholder = "Buscar por nombre o SKU...",
  isMulti = false,
}) => {
  // Transformar productos a opciones para react-select
  const productOptions: ProductOption[] = products.map(product => ({
    label: product.name,
    value: product // El objeto producto completo
  }));

  // Encontrar la opción seleccionada (puede ser múltiple o única)
  const selectedOption = value
    ? Array.isArray(value)
      ? value.map(v => ({ label: v.value.name, value: v.value }))
      : { label: value.value.name, value: value.value }
    : null;
    
  // Imprimir para depuración
  console.log('ProductSelect - selectedOption:', selectedOption);
  console.log('ProductSelect - isMulti:', isMulti);

  // Filtro personalizado para buscar por nombre o SKU
  const filterOption = (option: { label: string; data: ProductOption }, inputValue: string) => {
    const product = option.data.value;
    
    // Convertir todo a minúsculas para una búsqueda insensible a mayúsculas/minúsculas
    const input = inputValue.toLowerCase();
    const name = option.label.toLowerCase();
    const sku = product.sku?.toLowerCase() || "";
    
    // Buscar en nombre o SKU
    return name.includes(input) || sku.includes(input);
  };

  return (
    <div className="relative">
      <Select<ProductOption, typeof isMulti>
        value={selectedOption}
        onChange={(option) => {
          if (isMulti) {
            onChange(option ? [...(option as MultiValue<ProductOption>)] : null);
          } else {
            onChange(option as ProductOption | null);
          }
        }}
        options={productOptions}
        placeholder={placeholder}
        className={className}
        isClearable
        isMulti={isMulti}
        components={{ Option: CustomOption }}
        filterOption={filterOption}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: '40px',
            borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
            boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
            '&:hover': {
              borderColor: '#9CA3AF'
            }
          }),
          placeholder: (base) => ({
            ...base,
            color: '#6B7280',
            fontSize: '14px'
          }),
          menu: (base) => ({
            ...base,
            zIndex: 50
          })
        }}
        noOptionsMessage={() => "No se encontraron productos con ese nombre o SKU"}
      />
      
      {/* Indicador visual de búsqueda por SKU */}
      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <div className="flex items-center gap-1 text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Nombre/SKU</span>
        </div>
      </div>
    </div>
  );
};

export default ProductSelect;