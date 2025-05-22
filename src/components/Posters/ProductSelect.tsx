import React from "react";
import Select, { components, OptionProps, MultiValue } from "react-select";

// Importamos la interfaz Product desde el archivo de tipos
import { Product } from "../../types/product";

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
      <div className="flex flex-col">
        <div>{data.label}</div>
        {data.value.sku && (
          <div className="text-xs text-gray-500">
            SKU: {data.value.sku}
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
  placeholder = "Seleccionar producto...",
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
  const filterOption = (option: any, inputValue: string) => {
    const product = option.data.value;
    
    // Convertir todo a minúsculas para una búsqueda insensible a mayúsculas/minúsculas
    const input = inputValue.toLowerCase();
    const name = option.label.toLowerCase();
    const sku = product.sku?.toLowerCase() || "";
    
    // Buscar en nombre o SKU
    return name.includes(input) || sku.includes(input);
  };

  return (
    <Select<ProductOption, typeof isMulti>
      value={selectedOption}
      onChange={(option) => {
        if (isMulti) {
          onChange(option as MultiValue<ProductOption>);
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
    />
  );
};

export default ProductSelect;