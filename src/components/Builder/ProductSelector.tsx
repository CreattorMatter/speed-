import React from 'react';
import Select from 'react-select';
import { Package2 } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductSelectorProps {
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product | null) => void;
}

export const ProductSelector = ({
  products,
  selectedProduct,
  onProductSelect
}: ProductSelectorProps) => {
  const formatOptionLabel = ({ name, sku, price }: Product) => (
    <div className="flex items-center gap-3">
      <div className="p-1 bg-indigo-50 rounded">
        <Package2 className="w-4 h-4 text-indigo-600" />
      </div>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span>SKU: {sku}</span>
          <span>•</span>
          <span>${price.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Select
      value={selectedProduct ? {
        value: selectedProduct.id,
        label: selectedProduct.name,
        data: selectedProduct
      } : null}
      onChange={(option) => onProductSelect(option?.data || null)}
      options={products.map(product => ({
        value: product.id,
        label: product.name,
        data: product
      }))}
      formatOptionLabel={(option) => formatOptionLabel(option.data)}
      placeholder="Seleccionar producto..."
      className="min-w-[300px]"
      classNames={{
        control: (state) => 
          `!bg-white !border-gray-200 ${state.isFocused ? '!border-indigo-500 !ring-1 !ring-indigo-500' : ''}`,
        option: (state) => 
          `!cursor-pointer ${state.isFocused ? '!bg-indigo-50' : ''} ${state.isSelected ? '!bg-indigo-100' : ''}`
      }}
    />
  );
}; 