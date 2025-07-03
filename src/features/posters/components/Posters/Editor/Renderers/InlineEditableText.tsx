import React, { useState, useRef, useEffect } from 'react';
import { Edit3 } from 'lucide-react';

interface InlineEditableTextProps {
  value: string | number;
  onSave: (newValue: string | number) => void;
  fieldType: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onSave,
  fieldType,
  className = '',
  style = {},
  children
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [isHovered, setIsHovered] = useState(false);
  const [hasBeenManuallyEdited, setHasBeenManuallyEdited] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Actualizar editValue cuando cambia el value externo
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value.toString());
    }
  }, [value, isEditing]);

  // Focus automático cuando entra en modo edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🖱️ Iniciando edición inline para campo: ${fieldType}`);
    setIsEditing(true);
    setEditValue(value.toString());
    setHasBeenManuallyEdited(true);
  };

  const handleSave = () => {
    // 🔧 CORREGIDO: Solo guardar si realmente hubo un cambio
    const currentValueStr = value.toString();
    const editValueStr = editValue.toString();
    
    if (currentValueStr === editValueStr) {
      console.log(`⏭️ Sin cambios en campo ${fieldType}: valor igual (${currentValueStr})`);
      setIsEditing(false);
      setHasBeenManuallyEdited(false);
      return;
    }
    
    console.log(`💾 Guardando valor inline: ${fieldType} = ${editValue} (anterior: ${value})`);
    
    let processedValue: string | number = editValue;
    
    // Procesar según tipo de campo
    if (fieldType.includes('precio') || fieldType.includes('price')) {
      // Limpiar formato y convertir a número
      const numericValue = parseFloat(editValue.replace(/[^\d.,]/g, '').replace(',', '.'));
      processedValue = isNaN(numericValue) ? 0 : numericValue;
    } else if (fieldType.includes('porcentaje') || fieldType.includes('percentage')) {
      const numericValue = parseFloat(editValue.replace('%', ''));
      processedValue = isNaN(numericValue) ? 0 : numericValue;
    }
    
    onSave(processedValue);
    setIsEditing(false);
    setHasBeenManuallyEdited(false);
  };

  const handleCancel = () => {
    console.log(`❌ Cancelando edición inline para: ${fieldType}`);
    setEditValue(value.toString());
    setIsEditing(false);
    setHasBeenManuallyEdited(false);
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

  const handleClickOutside = () => {
    // 🎯 MEJORADO: Siempre intentar guardar al hacer clic fuera.
    // La lógica de si hubo un cambio real ya está dentro de handleSave().
    if (isEditing) {
      console.log(`👆 Click fuera detectado para campo ${fieldType}, intentando guardar...`);
      handleSave();
    }
  };

  // Agregar listener para click fuera del componente
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        handleClickOutside();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleDocumentClick);
      return () => document.removeEventListener('mousedown', handleDocumentClick);
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`${className} outline-none border-2 border-blue-500 bg-white rounded px-1 shadow-lg`}
        style={{
          ...style,
          width: '100%',
          height: '100%',
          minWidth: 'auto',
          minHeight: '24px',
          boxSizing: 'border-box',
          fontSize: style.fontSize || 'inherit',
          fontFamily: style.fontFamily || 'inherit',
          fontWeight: style.fontWeight || 'inherit',
          color: style.color || 'inherit',
          textAlign: style.textAlign || 'left',
          resize: 'none',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
        placeholder={`Editar ${fieldType}...`}
      />
    );
  }

  return (
    <div
      className={`${className} relative inline-block cursor-pointer transition-all duration-200 ${
        isHovered ? 'ring-2 ring-blue-400 ring-dashed' : ''
      }`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleStartEdit}
      title={`Click para editar ${fieldType}`}
    >
      {children}
      
      {/* Icono de edición en hover */}
      {isHovered && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg pointer-events-none">
          <Edit3 className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}; 