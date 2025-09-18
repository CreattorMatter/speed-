// =====================================
// PROPERTIES PANEL HOOK - BuilderV3
// =====================================

import { useCallback, useMemo } from 'react';
import { DollarSign, Hash, Package, Tag, Type, MapPin, Building, Percent, Truck } from 'lucide-react';
import { DraggableComponentV3, PositionV3, SizeV3, DynamicContentV3 } from '../../types';
import { PropertiesHandlers, ProductFieldOption } from './types';
// 🆕 Campos Propios
import { listCustomFields } from '../../fields/fieldRegistry';

interface UsePropertiesPanelProps {
  selectedComponent: DraggableComponentV3 | null;
  onComponentUpdate: (componentId: string, updates: Partial<DraggableComponentV3>) => void;
}

export const usePropertiesPanel = ({
  selectedComponent,
  onComponentUpdate
}: UsePropertiesPanelProps) => {
  
  // =====================
  // PRODUCT FIELD OPTIONS - NUEVA ARQUITECTURA API SAP
  // =====================
  
  const productFieldOptions: ProductFieldOption[] = useMemo(() => [
    // CAMPOS INTERNOS DE SPEED
    {
      value: 'promotion-title',
      label: 'Título de Promoción',
      icon: Tag,
      category: 'speed',
      description: 'Título de la campaña promocional (ej: Hot Sale)'
    },
    {
      value: 'numero_cuota',
      label: 'Número de Cuotas',
      icon: Hash,
      category: 'speed',
      description: 'Cantidad de cuotas del plan de financiación'
    },
    {
      value: 'monto_cuota',
      label: 'Monto por Cuota',
      icon: DollarSign,
      category: 'speed',
      description: 'Valor de cada cuota (calculado)'
    },
    {
      value: 'promo',
      label: 'Promoción NxN',
      icon: Tag,
      category: 'speed',
      description: 'Campo de promoción con formato numeroxnumero (ej: 3x2, 5x4) para cálculos automáticos'
    },
    {
      value: 'custom',
      label: 'Texto Personalizado',
      icon: Type,
      category: 'speed',
      description: 'Texto estático personalizable'
    },

    // CAMPOS EXTERNOS DE LA API SAP (1:1 MAPPING)
    {
      value: 'ID',
      label: 'ID del Producto',
      icon: Hash,
      category: 'sap',
      description: 'Identificador único del producto en SAP'
    },
    {
      value: 'Tienda',
      label: 'Código de Tienda',
      icon: Building,
      category: 'sap',
      description: 'Código de la tienda (ej: E103)'
    },
    {
      value: 'sku',
      label: 'SKU',
      icon: Hash,
      category: 'sap',
      description: 'Código SKU del producto'
    },
    {
      value: 'nombre',
      label: 'Nombre del Producto',
      icon: Type,
      category: 'sap',
      description: 'Nombre completo del producto'
    },
    {
      value: 'origen',
      label: 'País de Origen',
      icon: MapPin,
      category: 'sap',
      description: 'País de origen del producto'
    },
    {
      value: 'nacImp',
      label: 'Nacional/Importado',
      icon: Truck,
      category: 'sap',
      description: 'Indicador si es nacional (1) o importado (2)'
    },
    {
      value: 'ean',
      label: 'Código EAN',
      icon: Hash,
      category: 'sap',
      description: 'Código de barras EAN del producto'
    },
    {
      value: 'ppal',
      label: 'Producto Principal',
      icon: Tag,
      category: 'sap',
      description: 'Indicador de producto principal (X)'
    },
    {
      value: 'unidad',
      label: 'Unidad de Venta',
      icon: Package,
      category: 'sap',
      description: 'Unidad de medida de venta (UN, KG, etc.)'
    },
    {
      value: 'precioBase',
      label: 'Precio Base',
      icon: DollarSign,
      category: 'sap',
      description: 'Precio de venta al público'
    },
    {
      value: 'precioSinImpuestosNacionales',
      label: 'Precio sin Impuestos',
      icon: DollarSign,
      category: 'sap',
      description: 'Precio antes de impuestos nacionales'
    },
    {
      value: 'unidadPPUM',
      label: 'Unidad PPUM',
      icon: Package,
      category: 'sap',
      description: 'Unidad para precio por unidad de medida'
    },
    {
      value: 'PPUM',
      label: 'Precio por Unidad de Medida',
      icon: DollarSign,
      category: 'sap',
      description: 'Precio por unidad de medida (legal)'
    },
    {
      value: 'factorRendimiento',
      label: 'Factor de Rendimiento',
      icon: Percent,
      category: 'sap',
      description: 'Factor de conversión de rendimiento'
    },
    {
      value: 'unStock',
      label: 'Unidad de Stock',
      icon: Package,
      category: 'sap',
      description: 'Unidad de medida para stock'
    },
    {
      value: 'stockPorSucursal',
      label: 'Stock por Sucursal',
      icon: Package,
      category: 'sap',
      description: 'Cantidad disponible en la sucursal'
    },
    {
      value: 'atributo',
      label: 'Atributo 1',
      icon: Tag,
      category: 'sap',
      description: 'Primer atributo del producto'
    },
    {
      value: 'atributo2',
      label: 'Atributo 2',
      icon: Tag,
      category: 'sap',
      description: 'Segundo atributo del producto'
    },
    {
      value: 'Seccion',
      label: 'Sección',
      icon: Tag,
      category: 'sap',
      description: 'Código de sección del producto'
    },
    {
      value: 'Rubro',
      label: 'Rubro',
      icon: Tag,
      category: 'sap',
      description: 'Código de rubro del producto'
    },
    {
      value: 'SubRubro',
      label: 'Sub Rubro',
      icon: Tag,
      category: 'sap',
      description: 'Código de sub rubro del producto'
    },
    {
      value: 'Grupo',
      label: 'Grupo',
      icon: Tag,
      category: 'sap',
      description: 'Código de grupo del producto'
    },
    {
      value: 'precioAnt',
      label: 'Precio Anterior',
      icon: DollarSign,
      category: 'sap',
      description: 'Precio anterior (para mostrar tachado)'
    },
    {
      value: 'marca',
      label: 'Marca',
      icon: Type,
      category: 'sap',
      description: 'Marca del producto'
    },
    {
      value: 'MARM_COEF',
      label: 'Coeficiente MARM',
      icon: Hash,
      category: 'sap',
      description: 'Coeficiente de unidad de medida alternativa'
    },
    {
      value: 'MARM_UMREZ',
      label: 'MARM UMREZ',
      icon: Hash,
      category: 'sap',
      description: 'Unidad de medida de referencia'
    },
    {
      value: 'MARM_UMREN',
      label: 'MARM UMREN',
      icon: Hash,
      category: 'sap',
      description: 'Unidad de medida de entrada'
    }
  ], []);

  // Helper: detectar si un campo es numérico (heurística por id)
  const isNumericFieldId = (id: string): boolean => {
    const key = id.toLowerCase();
    return /price|precio|discount|descuento|stock|cuota|promo/.test(key);
  };

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

  const handleStyleChange = useCallback((field: string, value: unknown) => {
    if (!selectedComponent) return;
    
    onComponentUpdate(selectedComponent.id, {
      style: {
        ...selectedComponent.style,
        [field]: value
      }
    });
  }, [selectedComponent, onComponentUpdate]);

  const handleContentChange = useCallback((field: string, value: unknown) => {
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
        showMockData: value as boolean
      });
      return;
    }
    
    // Manejar reemplazo completo del objeto content
    if (field === 'content') {
      console.log(`🔧 Reemplazando content completo:`, value);
      onComponentUpdate(selectedComponent.id, {
        content: value as DynamicContentV3
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

  const handleOutputFormatChange = useCallback((field: keyof NonNullable<DynamicContentV3['outputFormat']>, value: unknown) => {
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
      let previewExpression = expression || '';
      // Reemplazar dinámicamente TODOS los campos numéricos disponibles
      const numericFields = [
        // SAP + SPEED
        ...productFieldOptions.map(field => field.value).filter(isNumericFieldId),
        // 🆕 CUSTOM (number/money)
        ...listCustomFields().filter(f => f.dataType === 'number' || f.dataType === 'money').map(f => f.slug)
      ];
      const sampleOf = (id: string): string => {
        const k = id.toLowerCase();
        if (/price_previous/.test(k)) return '119999';
        if (/price_without_tax|price_base/.test(k)) return '85000';
        if (/product_price|precio$/.test(k)) return '99999';
        if (/precio_descuento/.test(k)) return '89999';
        if (/cuota|precio_cuota/.test(k)) return '6';
        if (/discount|descuento/.test(k)) return '10';
        if (/promo/.test(k)) return '3'; // 🆕 Valor numérico para promo (primer número de "3x2")
        if (/stock/.test(k)) return '25';
        return '9'; // default para campos propios numéricos
      };
      numericFields.forEach((id: string) => {
        const re = new RegExp(`\\[${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
        previewExpression = previewExpression.replace(re, sampleOf(id));
      });
      
      // Validar que solo contenga números, operadores y espacios
      if (previewExpression && /^[0-9+\-*/().\s]+$/.test(previewExpression)) {
        const result = Function(`"use strict"; return (${previewExpression})`)();
        previewResult = isNaN(result) ? 'Error' : result.toString();
      } else if (previewExpression) {
        previewResult = 'Esperando campos...';
      }
    } catch {
      errorMessage = 'Expresión inválida';
      previewResult = 'Error';
    }
    
    handleContentChange('calculatedField', {
      expression,
      availableFields: productFieldOptions.map(opt => opt.value),
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