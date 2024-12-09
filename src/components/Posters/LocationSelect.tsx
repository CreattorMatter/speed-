import React from 'react';
import Select from 'react-select';

interface Location {
  id: string;
  name: string;
  region: string;
}

interface LocationSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  locations: Location[];
  disabled?: boolean;
  isMulti?: boolean;
  className?: string;
}

export const LocationSelect: React.FC<LocationSelectProps> = ({
  value,
  onChange,
  locations,
  disabled = false,
  isMulti = false,
  className
}) => {
  const selectAllOption = {
    value: '*',
    label: 'Seleccionar todos'
  };

  const handleChange = (selectedOptions: any) => {
    if (Array.isArray(selectedOptions)) {
      if (selectedOptions.some(option => option.value === '*')) {
        onChange(locations.map(location => location.id));
      } else {
        onChange(selectedOptions.map(option => option.value));
      }
    } else {
      onChange(selectedOptions ? [selectedOptions.value] : []);
    }
  };

  const options = [
    selectAllOption,
    ...locations.map(l => ({
      value: l.id,
      label: l.name
    }))
  ];

  return (
    <Select
      isMulti={isMulti}
      isDisabled={disabled}
      value={value.length === locations.length 
        ? [selectAllOption]
        : options.filter(option => value.includes(option.value))}
      onChange={handleChange}
      options={options}
      classNames={{
        control: (state) => `${className} ${state.isFocused ? 'border-indigo-500' : ''}`,
        menu: () => "bg-white rounded-lg shadow-lg",
        option: () => "px-3 py-2 hover:bg-gray-100 cursor-pointer"
      }}
      placeholder="Seleccionar sucursales..."
    />
  );
}; 