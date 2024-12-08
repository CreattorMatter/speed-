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
  return (
    <Select
      isMulti={isMulti}
      isDisabled={disabled}
      value={locations.filter(l => value.includes(l.id)).map(l => ({
        value: l.id,
        label: l.name
      }))}
      onChange={(newValue: any) => {
        const selectedValues = newValue ? (Array.isArray(newValue) 
          ? newValue.map(v => v.value)
          : [newValue.value]) 
        : [];
        onChange(selectedValues);
      }}
      options={locations.map(l => ({
        value: l.id,
        label: l.name
      }))}
      classNames={{
        control: (state) => `${className} ${state.isFocused ? 'border-indigo-500' : ''}`,
        menu: () => "bg-white rounded-lg shadow-lg",
        option: () => "px-3 py-2 hover:bg-gray-100 cursor-pointer"
      }}
    />
  );
}; 