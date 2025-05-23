// src/components/Posters/PaperFormatSelect.tsx
import React from "react";
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

export const PaperFormatSelect: React.FC<PaperFormatSelectProps> = ({
  value,
  onChange,
  className = "",
}) => (
  <Select
    value={value}
    onChange={onChange}
    options={paperFormatOptions}
    placeholder="Seleccionar formato de papel..."
    className={className}
    isClearable
  />
);

export default PaperFormatSelect;