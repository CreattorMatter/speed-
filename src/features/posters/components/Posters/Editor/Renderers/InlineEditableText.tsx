import React, { useState, useRef, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import { FormatContext, reconstructOutputFormat } from '../../../../../../types/formatContext';
import AutoFitText from '../../../../../../components/shared/AutoFitText';

interface InlineEditableTextProps {
  value: string | number;
  onSave: (newValue: string | number, formatContext?: FormatContext) => void;
  fieldType: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  placeholder?: string;
  inputType?: 'text' | 'number' | 'email' | 'tel';
  disabled?: boolean;
  multiline?: boolean;
  maxLength?: number;
  onPendingChange?: (fieldType: string, newValue: string | number, formatContext?: FormatContext) => void;
  isComplexTemplate?: boolean;
  originalTemplate?: string;
  // 🆕 Format Context para preservar máscaras
  formatContext?: FormatContext;
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
  originalTemplate = '',
  formatContext
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
        } else if (fieldType.includes('porcentaje') || fieldType.includes('percentage') || 
                   fieldType.includes('descuento') || fieldType.includes('discount')) {
          const numericValue = processedValue.replace(/[^\d.,]/g, '').replace(',', '.');
          const parsedValue = parseFloat(numericValue);
          processedValue = !isNaN(parsedValue) ? parsedValue.toString() : '0';
        } else if (fieldType.includes('cuota') || fieldType === 'cuota') {
          // 🆕 PROCESAMIENTO ESPECIAL PARA CUOTAS (número entero)
          const numericValue = processedValue.replace(/[^\d]/g, '');
          const parsedValue = parseInt(numericValue, 10);
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
        } else if (fieldType.includes('cuota') || fieldType === 'cuota') {
          // 🆕 PROCESAMIENTO ESPECIAL PARA CUOTAS (número entero)
          const numericValue = initialEditValue.replace(/[^\d]/g, '');
          const parsedValue = parseInt(numericValue, 10);
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
    
    console.log(`💾 🚀 INICIO handleSave InlineEditableText:`, { 
      fieldType, 
      editValue, 
      originalValue,
      hasFormatContext: !!formatContext 
    });
    
    let processedValue: string | number = editValue;
    
    if (!isComplexTemplate) {
      if (fieldType.includes('precio') || fieldType.includes('price')) {
        const numericValue = parseFloat(editValue.replace(/\./g, '').replace(',', '.'));
        processedValue = isNaN(numericValue) ? 0 : numericValue;
        console.log(`💰 Procesando precio: "${editValue}" → ${processedValue}`);
        
        // 🔧 PRESERVAR FORMATO: SIEMPRE aplicar formato para TODOS los precios
        const originalValueStr = value.toString();
        const hasSuperscriptDecimals = /[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(originalValueStr);
        const hasNormalDecimals = /,\d+/.test(originalValueStr);
        const hasCurrencySymbol = originalValueStr.includes('$');
        
        // Determinar configuración de formato
        let decimalPlaces = 0; // Por defecto sin decimales
        let useSuperscript = false;
        
        if (hasSuperscriptDecimals) {
          useSuperscript = true;
          decimalPlaces = 2; // Asumir 2 decimales para superíndice
        } else if (hasNormalDecimals) {
          useSuperscript = false;
          decimalPlaces = 2; // Decimales normales
        }
        
        const priceFormatContext: FormatContext = {
          hasSpecialFormat: true, // SIEMPRE true para precios
          originalFormat: {
            showCurrencySymbol: hasCurrencySymbol,
            showDecimals: decimalPlaces > 0,
            precision: decimalPlaces.toString(),
            superscriptDecimals: useSuperscript
          },
          formatPreferences: {
            useSuperscript,
            decimalPlaces,
            showCurrency: hasCurrencySymbol,
            useGrouping: true // SIEMPRE separadores de miles para precios
          }
        };
        
        console.log(`🎭 FORMATO FORZADO PARA PRECIO:`, {
          originalValue: originalValueStr,
          hasSuperscriptDecimals,
          hasNormalDecimals,
          hasCurrencySymbol,
          formatContext: priceFormatContext
        });
        
        console.log(`💾 📤 ENVIANDO A onSave CON FORMATO FORZADO:`, { fieldType, processedValue, hasFormatContext: true });
        onSave(processedValue, priceFormatContext);
        setIsEditing(false);
        setHasBeenManuallyEdited(false);
        setHasPendingChange(false);
        return;
      } else if (fieldType.includes('porcentaje') || fieldType.includes('percentage')) {
        const numericValue = parseFloat(editValue.replace('%', ''));
        processedValue = isNaN(numericValue) ? 0 : numericValue;
        console.log(`📊 Procesando porcentaje: "${editValue}" → ${processedValue}`);
      } else if (fieldType.includes('cuota') || fieldType === 'cuota') {
        // 🆕 PROCESAMIENTO ESPECIAL PARA CUOTAS (número entero)
        const numericValue = parseInt(editValue, 10);
        processedValue = isNaN(numericValue) ? 0 : numericValue;
        console.log(`💳 Procesando cuotas: "${editValue}" → ${processedValue}`);
      } else if (fieldType.includes('descuento') || fieldType === 'descuento' || 
                 fieldType.includes('discount') || fieldType === 'discount_percentage') {
        // 🆕 DESCUENTO SIN RESTRICCIONES - El usuario puede poner lo que quiera
        const numericValue = parseInt(editValue.replace(/[^\d]/g, ''), 10);
        processedValue = isNaN(numericValue) ? 0 : numericValue;
        console.log(`🏷️ Procesando descuento (sin límites): "${editValue}" → ${processedValue}`);
      }
    }
    
    // 🎭 PRESERVAR FORMATO: Si hay contexto de formato, incluirlo en el callback
    if (formatContext && formatContext.hasSpecialFormat) {
      console.log(`🎭 Preservando formato especial:`, {
        useSuperscript: formatContext.formatPreferences.useSuperscript,
        decimalPlaces: formatContext.formatPreferences.decimalPlaces,
        originalFormat: formatContext.originalFormat
      });
      
      onSave(processedValue, formatContext);
    } else {
      console.log(`💾 📤 ENVIANDO A onSave (sin formato especial):`, { fieldType, processedValue });
      onSave(processedValue);
    }
    
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
      // Removido: restricción de rango 0-100 para permitir edición libre
    }
    
    // 🆕 VALIDACIÓN PARA CAMPOS DE CUOTAS
    if (fieldType.includes('cuota') || fieldType === 'cuota') {
      const numericValue = parseInt(value, 10);
      if (isNaN(numericValue)) {
        return { isValid: false, message: 'Las cuotas deben ser un número entero válido' };
      }
      if (numericValue < 0) {
        return { isValid: false, message: 'Las cuotas no pueden ser negativas. Usa 0 para "sin financiación"' };
      }
      if (numericValue > 60) {
        return { isValid: false, message: 'Máximo 60 cuotas permitidas' };
      }
    }

    // 🆕 VALIDACIÓN RELAJADA PARA DESCUENTO - Solo verificar que sea número
    if (fieldType.includes('descuento') || fieldType === 'descuento' || 
        fieldType.includes('discount') || fieldType === 'discount_percentage') {
      const numericValue = parseInt(value.replace(/[^\d]/g, ''), 10);
      if (isNaN(numericValue)) {
        return { isValid: false, message: 'El descuento debe ser un número entero' };
      }
      // Removido: restricción de rango 0-100 para permitir edición libre
    }

    // 🆕 VALIDACIÓN SIMPLE PARA CAMPOS DE FECHA
    if (fieldType === 'date' || fieldType.includes('fecha') || fieldType.includes('vigencia')) {
      // Validación básica: simplemente verificar que no esté vacío
      if (!value.trim()) {
        return { isValid: false, message: 'El campo de fecha no puede estar vacío' };
      }
      // Permitir cualquier formato de fecha, el usuario puede escribir libremente
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
              const numericValue = parseFloat(editValue.replace(/\./g, '').replace(',', '.'));
              processedValue = isNaN(numericValue) ? 0 : numericValue;
            } else if (fieldType.includes('porcentaje') || fieldType.includes('percentage')) {
              const numericValue = parseFloat(editValue.replace('%', ''));
              processedValue = isNaN(numericValue) ? 0 : numericValue;
            }
          }
          
          // 🎭 SIEMPRE incluir formatContext en cambios pendientes (incluso si no es especial)
          onPendingChange(fieldType, processedValue, formatContext);
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
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setEditValue(newValue);
        
        // Notificar cambio pendiente si hay callback
        if (onPendingChange) {
          onPendingChange(fieldType, newValue);
        }
      },
      onKeyDown: handleKeyDown,
      onWheel: handleWheel,
      className: `${className} outline-none bg-white shadow-lg focus:ring-2 focus:ring-blue-300`,
      style: {
        ...style,
        // 🔧 CORREGIDO: Mantener dimensiones del contenedor original
        width: style.width || '100%',
        height: style.height || 'auto',
        minWidth: style.minWidth || '60px',
        minHeight: style.minHeight || '24px',
        maxWidth: style.maxWidth || '100%',
        maxHeight: style.maxHeight || 'none',
        boxSizing: 'border-box' as const,
        fontSize: style.fontSize || 'inherit',
        fontFamily: style.fontFamily || 'inherit',
        fontWeight: style.fontWeight || 'inherit',
        color: style.color || 'inherit',
        textAlign: style.textAlign || 'left',
        lineHeight: style.lineHeight || 'inherit',
        resize: 'none' as const,
        // 🔧 CORREGIDO: Permitir scroll y word-wrap
        overflow: 'auto',
        overflowWrap: 'break-word',
        wordWrap: 'break-word',
        whiteSpace: multiline ? 'pre-wrap' as const : 'pre-wrap' as const, // 🔧 Siempre permitir wrap
        // 🔧 NUEVO: Mantener consistencia visual
        padding: style.padding || '2px 4px',
        margin: style.margin || '0',
        border: style.border || '2px solid #3b82f6',
        borderRadius: style.borderRadius || '4px'
      },
      placeholder: placeholder || `Editar ${fieldType}...`,
      maxLength,
      disabled,
      autoComplete: 'off',
      spellCheck: false
    };

    // 🔧 MEJORADO: Detectar automáticamente si necesita múltiples líneas
    const needsMultipleLines = editValue.length > 50 || editValue.includes('\n') || multiline;
    
    if (needsMultipleLines) {
      return (
        <textarea
          ref={textareaRef}
          {...commonProps}
          rows={Math.min(Math.max(2, Math.ceil(editValue.length / 40)), 6)} // Altura dinámica
          style={{
            ...commonProps.style,
            resize: 'vertical', // Permitir redimensionamiento vertical
            minHeight: '40px',
            maxHeight: '200px'
          }}
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
              : `Click para editar ${fieldType}`      }
    >
      {/* Usar AutoFitText para el contenido no editable */}
      <AutoFitText
        text={value.toString()}
        style={{
          width: '100%',
          height: '100%',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          textAlign: style.textAlign as any || 'left',
          fontFamily: style.fontFamily as any,
          fontWeight: style.fontWeight as any,
          lineHeight: style.lineHeight as any,
          letterSpacing: style.letterSpacing as any,
          color: style.color as any
        }}
        baseFontSize={typeof style.fontSize === 'string' ? parseFloat(style.fontSize) : (style.fontSize as number) || 16}
        minFontSize={6}
        maxFontSize={200}
      />
      
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
