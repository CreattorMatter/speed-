import React from 'react';
import Select from 'react-select';

interface RegionSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  regions: { id: string; name: string; }[];
  isMulti?: boolean;
  className?: string;
}

export const RegionSelect: React.FC<RegionSelectProps> = ({
  value,
  onChange,
  regions,
  isMulti = false,
  className
}) => {
  return (
    <Select
      isMulti={isMulti}
      value={regions.filter(r => value.includes(r.id)).map(r => ({
        value: r.id,
        label: r.name
      }))}
      onChange={(newValue: unknown) => {
        const selectedValues = newValue ? (Array.isArray(newValue) 
          ? newValue.map((v: unknown) => (v as {value: string}).value)
          : [(newValue as {value: string}).value]) 
        : [];
        onChange(selectedValues);
      }}
      options={regions.map(r => ({
        value: r.id,
        label: r.name
      }))}
      classNames={{
        control: () => className || "bg-white rounded-lg shadow-lg",
        menu: () => "bg-white rounded-lg shadow-lg",
        option: () => "px-3 py-2 hover:bg-gray-100 cursor-pointer"
      }}
    />
  );
}; 