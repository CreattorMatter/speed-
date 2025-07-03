import React, { useState, useRef, useEffect } from 'react';
import { Edit3 } from 'lucide-react';

interface InlineEditableTextProps {
  value: string | number;
  onSave: (newValue: string | number) => void;
  fieldType: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  placeholder?: string;
  inputType?: 'text' | 'number' | 'email' | 'tel';
  disabled?: boolean;
  multiline?: boolean;
  maxLength?: number;
  onPendingChange?: (fieldType: string, newValue: string | number) => void;
  isComplexTemplate?: boolean;
  originalTemplate?: string;
}

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onSave,
  fieldType,
  className = '',
  style = {},
  children,
  placeholder,
  inputType = 'text',
  disabled = false,
  multiline = false,
  maxLength,
  onPendingChange,
  isComplexTemplate = false,
  originalTemplate = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [isHovered, setIsHovered] = useState(false);
  const [hasBeenManuallyEdited, setHasBeenManuallyEdited] = useState(false);
  const [hasPendingChange, setHasPendingChange] = useState(false);
  const [originalValue, setOriginalValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing && !hasBeenManuallyEdited) {
      let processedValue = value.toString();
      
      if (!isComplexTemplate) {
        if (fieldType.includes('precio') || fieldType.includes('price')) {
          const numericValue = processedValue.replace(/[^\d.,]/g, '').replace(',', '.');
          const parsedValue = parseFloat(numericValue);
          processedValue = !isNaN(parsedValue) ? parsedValue.toString() : '0';
        } else if (fieldType.includes('porcentaje') || fieldType.includes('percentage')) {
          const numericValue = processedValue.replace(/[^\d.,]/g, '').replace(',', '.');
          const parsedValue = parseFloat(numericValue);
          processedValue = !isNaN(parsedValue) ? parsedValue.toString() : '0';
        }
      }
      
      setEditValue(processedValue);
      setOriginalValue(processedValue);
    }
  }, [value, isEditing, fieldType, hasBeenManuallyEdited, isComplexTemplate]);

  useEffect(() => {
    if (isEditing) {
      const element = multiline ? textareaRef.current : inputRef.current;
      if (element) {
        element.focus();
        element.select();
      }
    }
  }, [isEditing, multiline]);

  const handleStartEdit = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.stopPropagation();
    console.log(`🖱️ Iniciando edición inline para campo: ${fieldType}`, { isComplexTemplate, originalTemplate });
    
    let initialEditValue = value.toString();
    
    if (!isComplexTemplate) {
      if (fieldType.includes('precio') || fieldType.includes('price')) {
        const numericValue = initialEditValue.replace(/[^\d.,]/g, '').replace(',', '.');
        const parsedValue = parseFloat(numericValue);
        initialEditValue = !isNaN(parsedValue) ? parsedValue.toString() : '0';
      } else if (fieldType.includes('porcentaje') || fieldType.includes('percentage')) {
        const numericValue = initialEditValue.replace(/[^\d.,]/g, '').replace(',', '.');
        const parsedValue = parseFloat(numericValue);
        initialEditValue = !isNaN(parsedValue) ? parsedValue.toString() : '0';
      }
    } else {
      initialEditValue = value.toString();
      console.log(`🎨 Campo complejo - usando valor procesado: "${initialEditValue}"`);
    }
    
    console.log(`📝 Inicializando edición con valor: "${value}" -> "${initialEditValue}"`);
    
    setIsEditing(true);
    setEditValue(initialEditValue);
    setHasBeenManuallyEdited(true);
    setOriginalValue(initialEditValue);
  };

  const handleSave = () => {
    if (originalValue === editValue) {
      console.log(`⏭️ Sin cambios manuales en campo ${fieldType}: valor igual (${originalValue})`);
      setIsEditing(false);
      setHasBeenManuallyEdited(false);
      setHasPendingChange(false);
      return;
    }
    
    const validation = validateField(fieldType, editValue);
    if (!validation.isValid) {
      alert(`❌ Error: ${validation.message}`);
      return;
    }
    
    console.log(`💾 🚀 INICIO handleSave InlineEditableText:`, { fieldType, editValue, originalValue });
    
    let processedValue: string | number = editValue;
    
    if (!isComplexTemplate) {
      if (fieldType.includes('precio') || fieldType.includes('price')) {
        const numericValue = parseFloat(editValue.replace(/[^\d.,]/g, '').replace(',', '.'));
        processedValue = isNaN(numericValue) ? 0 : numericValue;
        console.log(`💰 Procesando precio: "${editValue}" → ${processedValue}`);
      } else if (fieldType.includes('porcentaje') || fieldType.includes('percentage')) {
        const numericValue = parseFloat(editValue.replace('%', ''));
        processedValue = isNaN(numericValue) ? 0 : numericValue;
        console.log(`📊 Procesando porcentaje: "${editValue}" → ${processedValue}`);
      }
    }
    
    console.log(`💾 📤 ENVIANDO A onSave:`, { fieldType, processedValue });
    
    onSave(processedValue);
    setIsEditing(false);
    setHasBeenManuallyEdited(false);
    setHasPendingChange(false);
    
    console.log(`💾 ✅ handleSave COMPLETADO`);
  };

  const validateField = (fieldType: string, value: string): { isValid: boolean; message?: string } => {
    if (isComplexTemplate) {
      if (!value.trim()) {
        return { isValid: false, message: 'El campo no puede estar vacío' };
      }
      return { isValid: true };
    }
    
    if (fieldType.includes('precio') || fieldType.includes('price')) {
      const numericValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
      if (isNaN(numericValue)) {
        return { isValid: false, message: 'El precio debe ser un número válido' };
      }
      if (numericValue < 0) {
        return { isValid: false, message: 'El precio no puede ser negativo' };
      }
      if (numericValue > 999999999) {
        return { isValid: false, message: 'El precio es demasiado alto' };
      }
    }
    
    if (fieldType.includes('porcentaje') || fieldType.includes('percentage')) {
      const numericValue = parseFloat(value.replace('%', ''));
      if (isNaN(numericValue)) {
        return { isValid: false, message: 'El porcentaje debe ser un número válido' };
      }
      if (numericValue < 0 || numericValue > 100) {
        return { isValid: false, message: 'El porcentaje debe estar entre 0% y 100%' };
      }
    }
    
    if (fieldType.includes('descripcion') || fieldType.includes('nombre')) {
      if (!value.trim()) {
        return { isValid: false, message: 'El nombre del producto no puede estar vacío' };
      }
      if (value.length > 100) {
        return { isValid: false, message: 'El nombre es demasiado largo (máximo 100 caracteres)' };
      }
    }
    
    if (fieldType.includes('sku')) {
      if (!value.trim()) {
        return { isValid: false, message: 'El SKU no puede estar vacío' };
      }
      if (!/^[A-Za-z0-9-_]+$/.test(value)) {
        return { isValid: false, message: 'El SKU solo puede contener letras, números, guiones y guiones bajos' };
      }
    }
    
    return { isValid: true };
  };

  const handleCancel = () => {
    console.log(`❌ Cancelando edición inline para: ${fieldType}`);
    setEditValue(originalValue);
    setIsEditing(false);
    setHasBeenManuallyEdited(false);
    setHasPendingChange(false);
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

  // 🚫 PREVENIR SCROLL DEL MOUSE EN CAMPOS NUMÉRICOS
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClickOutside = () => {
    if (isEditing && hasBeenManuallyEdited) {
      if (originalValue !== editValue) {
        console.log(`👆 Click fuera detectado - Guardando como cambio pendiente: ${fieldType} = ${editValue}`);
        setHasPendingChange(true);
        
        if (onPendingChange) {
          let processedValue: string | number = editValue;
          
          if (!isComplexTemplate) {
            if (fieldType.includes('precio') || fieldType.includes('price')) {
              const numericValue = parseFloat(editValue.replace(/[^\d.,]/g, '').replace(',', '.'));
              processedValue = isNaN(numericValue) ? 0 : numericValue;
            } else if (fieldType.includes('porcentaje') || fieldType.includes('percentage')) {
              const numericValue = parseFloat(editValue.replace('%', ''));
              processedValue = isNaN(numericValue) ? 0 : numericValue;
            }
          }
          
          onPendingChange(fieldType, processedValue);
        }
      } else {
        console.log(`👆 Click fuera sin cambios reales para campo: ${fieldType}`);
        setHasPendingChange(false);
      }
      
      setIsEditing(false);
      setHasBeenManuallyEdited(false);
    }
  };

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const currentElement = multiline ? textareaRef.current : inputRef.current;
      if (currentElement && !currentElement.contains(e.target as Node)) {
        handleClickOutside();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleDocumentClick);
      return () => document.removeEventListener('mousedown', handleDocumentClick);
    }
  }, [isEditing, multiline, hasBeenManuallyEdited, originalValue, editValue]);

  if (isEditing) {
    const commonProps = {
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value),
      onKeyDown: handleKeyDown,
      onWheel: handleWheel,
      className: `${className} outline-none border-2 border-blue-500 bg-white rounded px-2 py-1 shadow-lg`,
      style: {
        ...style,
        width: '100%',
        height: '100%',
        minWidth: 'auto',
        minHeight: '24px',
        boxSizing: 'border-box' as const,
        fontSize: style.fontSize || 'inherit',
        fontFamily: style.fontFamily || 'inherit',
        fontWeight: style.fontWeight || 'inherit',
        color: style.color || 'inherit',
        textAlign: style.textAlign || 'left',
        resize: 'none' as const,
        overflow: 'hidden',
        whiteSpace: multiline ? 'pre-wrap' as const : 'nowrap' as const
      },
      placeholder: placeholder || `Editar ${fieldType}...`,
      maxLength,
      disabled,
      autoComplete: 'off',
      spellCheck: false
    };

    if (multiline) {
      return (
        <textarea
          ref={textareaRef}
          {...commonProps}
          rows={3}
        />
      );
    }

    return (
      <input
        ref={inputRef}
        type={isComplexTemplate ? 'text' : inputType}
        {...commonProps}
      />
    );
  }

  return (
    <div
      className={`${className} relative inline-block transition-all duration-200 ${
        disabled 
          ? 'cursor-not-allowed opacity-50' 
          : 'cursor-pointer'
      } ${
        isHovered && !disabled
          ? 'bg-yellow-100 shadow-sm ring-1 ring-yellow-300' 
          : ''
      } ${
        hasPendingChange 
          ? 'bg-orange-100 ring-2 ring-orange-400 ring-dashed' 
          : ''
      }`}
      style={{
        ...style,
        borderRadius: '4px',
        padding: isHovered && !disabled ? '2px 4px' : '2px',
      }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleStartEdit}
      title={
        disabled 
          ? `Campo ${fieldType} no editable`
          : hasPendingChange
            ? `${fieldType} - Cambio pendiente (Enter para confirmar)`
            : isComplexTemplate
              ? `Click para editar texto completo: "${value}"`
              : `Click para editar ${fieldType}`
      }
    >
      {children}
      
      {isHovered && !disabled && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center shadow-md pointer-events-none text-xs transition-all duration-200">
          ✏️
        </div>
      )}
      
      {hasPendingChange && (
        <div className="absolute -top-1 -left-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-md pointer-events-none text-xs animate-pulse">
          ⏳
        </div>
      )}
      
      {isHovered && !disabled && !isEditing && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg pointer-events-none z-50 whitespace-nowrap">
          🖱️ Click para editar {isComplexTemplate ? 'texto completo' : fieldType}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}; 