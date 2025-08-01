// =====================================
// PROPERTIES PANEL HOOK - BuilderV3
// =====================================

import { useCallback } from 'react';
import { DollarSign, Hash, Package, Tag, Type, MapPin } from 'lucide-react';
import { DraggableComponentV3, PositionV3, SizeV3, DynamicContentV3 } from '../../types';
import { getAvailableFields } from '../../../../utils/dynamicContentProcessor';
import { PropertiesHandlers, ProductFieldOption, CalculatedFieldResult } from './types';

interface UsePropertiesPanelProps {
  selectedComponent: DraggableComponentV3 | null;
  onComponentUpdate: (componentId: string, updates: Partial<DraggableComponentV3>) => void;
}

export const usePropertiesPanel = ({
  selectedComponent,
  onComponentUpdate
}: UsePropertiesPanelProps) => {
  
  // =====================
  // PRODUCT FIELD OPTIONS
  // =====================
  
  const availableFields = getAvailableFields();
  
  const productFieldOptions: ProductFieldOption[] = availableFields.filter(field => {
    const productRelatedFields = [
      // Información básica del producto
      'product_name', 'product_sku', 'product_ean', 'product_description', 
      'product_brand', 'product_brand_upper', 'product_unit',
      
      // Clasificación y categorías  
      'product_seccion', 'product_grupo', 'product_rubro', 'product_subrubro',
      'classification_complete',
      
      // Sistema de precios
      'product_price', 'price_previous', 'price_base', 'price_without_tax',
      'price_unit_alt', 'discount_percentage', 'discount_amount', 
      'installment_price', 'currency_symbol',
      
      // Campos de financiación (cuotas)
      'cuota', 'precio_cuota',
      
      // Origen y ubicación
      'product_origin', 'product_origin_code', 'store_code',
      
      // Stock e inventario
      'stock_available', 'stock_status',
      
      // Formato y estilos básicos
      'price_large', 'price_small', 'product_name_upper', 'ean_formatted'
    ];
    
    return productRelatedFields.includes(field.value);
  }).map(field => ({
    value: field.value,
    label: field.label,
    category: 'product', // Agregar categoría requerida
    icon: field.value.includes('price') || field.value.includes('discount') ? DollarSign : 
          field.value.includes('sku') || field.value.includes('ean') ? Hash :
          field.value.includes('stock') ? Package :
          field.value.includes('classification') || field.value.includes('seccion') ? Tag :
          field.value.includes('brand') || field.value.includes('name') ? Type : 
          field.value.includes('origin') || field.value.includes('store') ? MapPin : Tag
  }));

  // =====================
  // EVENT HANDLERS
  // =====================

  const handlePositionChange = useCallback((field: keyof PositionV3, value: number) => {
    if (!selectedComponent) return;
    
    onComponentUpdate(selectedComponent.id, {
      position: {
        ...selectedComponent.position,
        [field]: value
      }
    });
  }, [selectedComponent, onComponentUpdate]);

  const handleSizeChange = useCallback((field: keyof SizeV3, value: number) => {
    if (!selectedComponent) return;
    
    onComponentUpdate(selectedComponent.id, {
      size: {
        ...selectedComponent.size,
        [field]: value
      }
    });
  }, [selectedComponent, onComponentUpdate]);

  const handleStyleChange = useCallback((field: string, value: any) => {
    if (!selectedComponent) return;
    
    onComponentUpdate(selectedComponent.id, {
      style: {
        ...selectedComponent.style,
        [field]: value
      }
    });
  }, [selectedComponent, onComponentUpdate]);

  const handleContentChange = useCallback((field: string, value: any) => {
    if (!selectedComponent) return;
    
    console.log(`🔄 handleContentChange llamado:`, {
      componentId: selectedComponent.id,
      field,
      value,
      currentShowMockData: selectedComponent.showMockData
    });
    
    // Manejar showMockData a nivel de componente, no en content
    if (field === 'showMockData') {
      console.log(`🎯 Actualizando showMockData de ${selectedComponent.showMockData} a ${value}`);
      onComponentUpdate(selectedComponent.id, {
        showMockData: value
      });
      return;
    }
    
    // Manejar reemplazo completo del objeto content
    if (field === 'content') {
      console.log(`🔧 Reemplazando content completo:`, value);
      onComponentUpdate(selectedComponent.id, {
        content: value
      });
      return;
    }
    
    // Para otros campos, actualizar en content
    onComponentUpdate(selectedComponent.id, {
      content: {
        ...selectedComponent.content,
        [field]: value
      }
    });
  }, [selectedComponent, onComponentUpdate]);

  const handleOutputFormatChange = useCallback((field: keyof NonNullable<DynamicContentV3['outputFormat']>, value: any) => {
    if (!selectedComponent) return;
    
    const currentOutputFormat = (selectedComponent.content as DynamicContentV3)?.outputFormat || {
      type: 'text' // Agregar tipo por defecto requerido
    };
    
    onComponentUpdate(selectedComponent.id, {
      content: {
        ...selectedComponent.content,
        outputFormat: {
          ...currentOutputFormat,
          [field]: value
        }
      }
    });
  }, [selectedComponent, onComponentUpdate]);

  const handleCalculatedFieldChange = useCallback((expression: string) => {
    if (!selectedComponent) return;
    
    let previewResult = 'Calculando...';
    let errorMessage = '';
    
    try {
      // Crear una preview con valores de ejemplo
      let previewExpression = expression
        .replace(/\[product_price\]/g, '99999')
        .replace(/\[discount_percentage\]/g, '15')
        .replace(/\[price_previous\]/g, '119999')
        .replace(/\[stock_available\]/g, '25')
        .replace(/\[price_base\]/g, '85000')
        .replace(/\[price_without_tax\]/g, '85000');
      
      // Validar que solo contenga números, operadores y espacios
      if (previewExpression && /^[0-9+\-*/().\s]+$/.test(previewExpression)) {
        const result = Function(`"use strict"; return (${previewExpression})`)();
        previewResult = isNaN(result) ? 'Error' : result.toString();
      } else if (previewExpression) {
        previewResult = 'Esperando campos...';
      }
    } catch (error) {
      errorMessage = 'Expresión inválida';
      previewResult = 'Error';
    }
    
    handleContentChange('calculatedField', {
      expression,
      availableFields: productFieldOptions.map((opt: any) => opt.value),
      operators: ['+', '-', '*', '/', '(', ')'],
      previewResult,
      errorMessage
    });
  }, [selectedComponent, handleContentChange, productFieldOptions]);

  const handlers: PropertiesHandlers = {
    handlePositionChange,
    handleSizeChange,
    handleStyleChange,
    handleContentChange,
    handleOutputFormatChange,
    handleCalculatedFieldChange
  };

  return {
    productFieldOptions,
    handlers
  };
}; 