// src/components/Posters/Editor/Selectors/PaperFormatSelect.tsx
import React, { useEffect } from "react";
import Select from "react-select";
import { PAPER_FORMATS } from "@/constants/posters/paperFormats";

interface PaperFormatOption {
  label: string;
  value: string;
  width: string;
  height: string;
}

interface PaperFormatSelectProps {
  value: PaperFormatOption | null;
  onChange: (option: PaperFormatOption | null) => void;
  className?: string;
}

const paperFormatOptions: PaperFormatOption[] = PAPER_FORMATS.map((format) => ({
  label: format.name,
  value: format.id,
  width: format.width,
  height: format.height,
}));

console.log('PaperFormatSelect - Opciones disponibles:', paperFormatOptions);

export const PaperFormatSelect: React.FC<PaperFormatSelectProps> = ({
  value,
  onChange,
  className = "",
}) => {
  console.log('PaperFormatSelect - Render:', {
    value,
    valueExists: !!value,
    valueLabel: value?.label,
    valueValue: value?.value
  });
  
  // Si no hay valor y es la primera vez, establecer A4 por defecto
  useEffect(() => {
    console.log('PaperFormatSelect - useEffect ejecutado:', { value, hasValue: !!value });
    
    if (!value) {
      const defaultA4 = paperFormatOptions.find(option => option.value === 'A4');
      console.log('PaperFormatSelect - Buscando A4:', { defaultA4, paperFormatOptions });
      
      if (defaultA4) {
        console.log('PaperFormatSelect - Estableciendo A4 por defecto:', defaultA4);
        onChange(defaultA4);
      }
    }
  }, [value, onChange]);
  
  // Forzar A4 si el valor actual no es válido
  const currentValue = value || paperFormatOptions.find(option => option.value === 'A4');
  
  console.log('PaperFormatSelect - Valor final a mostrar:', currentValue);
  
  return (
    <Select
      value={currentValue}
      onChange={onChange}
      options={paperFormatOptions}
      placeholder="Seleccionar formato de papel..."
      className={className}
      isClearable={false}
    />
  );
};

export default PaperFormatSelect;