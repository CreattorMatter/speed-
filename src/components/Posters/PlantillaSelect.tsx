import React from "react";
import Select from "react-select";

interface PlantillaOption {
  label: string;
  value: string;
}

interface PlantillaSelectProps {
  value: PlantillaOption | null;
  onChange: (option: PlantillaOption | null) => void;
  opciones: PlantillaOption[];
  className?: string;
}

export const PlantillaSelect: React.FC<PlantillaSelectProps> = ({
  value,
  onChange,
  opciones,
  className = "",
}) => (
  <Select
    value={value}
    onChange={onChange}
    options={opciones}
    placeholder="Seleccionar plantilla..."
    className={className}
    isClearable
  />
);