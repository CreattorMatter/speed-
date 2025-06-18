import Select from "react-select";
import { Combos } from "../../../../constants/posters/combos";

interface ComboSelectProps {
    value: Combos | null;
    onChange: (option: Combos | null) => void;
    options: Combos[];
    placeholder?: string;
    className?: string;
  }
  
  export const ComboSelect: React.FC<ComboSelectProps> = ({
    value,
    onChange,
    options,
    placeholder = "Seleccionar opción...",
    className = "",
  }) => (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      className={className}
      isClearable
    />
  );