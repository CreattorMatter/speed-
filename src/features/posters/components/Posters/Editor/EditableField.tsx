import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { 
  validatePrice, 
  validatePercentage, 
  validateDate, 
  validateRequired,
  formatPrice,
  formatDate,
  parsePrice 
} from '../../../../../utils/validationUtils';

interface EditableFieldProps {
  value: string | number;
  fieldName: string;
  fieldType: 'text' | 'price' | 'percentage' | 'date' | 'sap' | 'currency';
  onSave: (newValue: string | number) => void;
  isRequired?: boolean;
  className?: string;
  renderValue?: (value: string | number) => React.ReactNode;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  value,
  fieldName,
  fieldType,
  onSave,
  isRequired = false,
  className = '',
  renderValue
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Actualizar editValue cuando cambia el value externo
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const validate = (val: string | number): { isValid: boolean; error?: string } => {
    switch (fieldType) {
      case 'price':
        return validatePrice(val);
      case 'percentage':
        return validatePercentage(val);
      case 'date':
        return validateDate(val as string);
      case 'text':
      case 'sap':
        return isRequired ? validateRequired(val as string) : { isValid: true };
      default:
        return { isValid: true };
    }
  };

  const formatValue = (val: string | number): string => {
    switch (fieldType) {
      case 'price':
        return formatPrice(val);
      case 'date':
        return formatDate(val as string);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toString();
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(value);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
    setError('');
  };

  const handleSave = () => {
    const validation = validate(editValue);
    
    if (!validation.isValid) {
      setError(validation.error || 'Error de validación');
      return;
    }

    let processedValue = editValue;
    
    // Procesar valor según tipo
    if (fieldType === 'price') {
      processedValue = typeof editValue === 'string' ? parsePrice(editValue) : editValue;
    } else if (fieldType === 'percentage') {
      processedValue = typeof editValue === 'string' ? parseFloat(editValue) : editValue;
    }

    // Guardar inmediatamente
    onSave(processedValue);
    setIsEditing(false);
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Formateo en tiempo real para fechas
    if (fieldType === 'date') {
      newValue = formatDate(newValue);
    }
    
    setEditValue(newValue);
    
    // Validación en tiempo real
    const validation = validate(newValue);
    if (!validation.isValid) {
      setError(validation.error || '');
    } else {
      setError('');
    }
  };

  // Para cambios en tiempo real durante edición
  const handleLiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    
    // Si el campo es válido, aplicar cambio inmediatamente para preview
    const newValue = e.target.value;
    const validation = validate(newValue);
    
    if (validation.isValid && fieldType !== 'text') {
      let processedValue: string | number = newValue;
      
      if (fieldType === 'price') {
        processedValue = typeof newValue === 'string' ? parsePrice(newValue) : newValue;
      } else if (fieldType === 'percentage') {
        processedValue = typeof newValue === 'string' ? parseFloat(newValue) : newValue;
      }
      
      // Actualizar preview en tiempo real solo para campos numéricos
      onSave(processedValue);
    }
  };

  const getInputProps = () => {
    const baseProps = {
      ref: inputRef,
      value: editValue,
      onChange: fieldType === 'text' || fieldType === 'sap' ? handleChange : handleLiveChange,
      onKeyDown: handleKeyDown,
      onBlur: handleSave, // Guardar al salir del campo
      className: `px-3 py-2 border rounded-lg text-sm w-full transition-colors ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
      }`,
    };

    switch (fieldType) {
      case 'price':
        return {
          ...baseProps,
          type: 'text',
          placeholder: '0,00'
        };
      case 'percentage':
        return {
          ...baseProps,
          type: 'number',
          min: 0,
          max: 100,
          step: 0.1,
          placeholder: '0'
        };
      case 'date':
        return {
          ...baseProps,
          type: 'text',
          placeholder: 'DD/MM/YYYY',
          maxLength: 10
        };
      default:
        return {
          ...baseProps,
          type: 'text'
        };
    }
  };

  if (isEditing) {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <div className="flex items-center gap-2">
          <input {...getInputProps()} />
          {/* 🚀 BOTONES ELIMINADOS: Guardado automático con Enter */}
        </div>
        {error && (
          <span className="text-xs text-red-500 mt-1">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center group cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition-colors ${className}`}>
      <span 
        onClick={handleStartEdit}
        className="border-b border-dashed border-transparent group-hover:border-blue-500 transition-colors font-medium"
      >
        {renderValue ? renderValue(value) : formatValue(value)}
      </span>
      <Edit3 
        className="w-4 h-4 ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleStartEdit}
      />
    </div>
  );
}; 