import React from 'react';
import Select, { GroupBase, OptionProps } from 'react-select';
import { Product } from '../../types';
import { Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface ProductSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  products: Product[];
  className?: string;
}

export const ProductSelect: React.FC<ProductSelectProps> = ({ 
  value, 
  onChange, 
  products,
  className 
}) => {
  const options: SelectOption[] = products.map(p => ({ 
    value: p.id, 
    label: `${p.name} - ${p.category}`
  }));

  const selectedValues = value.map(id => 
    options.find(opt => opt.value === id)
  ).filter((v): v is SelectOption => v !== undefined);

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
        control: () => className || '',
        menu: () => "bg-white rounded-lg shadow-lg",
        option: () => "px-3 py-2 hover:bg-gray-100 cursor-pointer"
      }}
      styles={{
        menu: (base) => ({
          ...base,
          zIndex: 40
        }),
        container: (base) => ({
          ...base,
          zIndex: 40
        })
      }}
      components={{
        Option: ({ children, isSelected, ...props }: OptionProps<SelectOption, true, GroupBase<SelectOption>>) => (
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