import React from 'react';
import { type Product } from '../../../../data/products';
import { type ProductChange } from '../../../../store/features/poster/posterSlice';
import { EditableField } from '../EditableField';
import { 
  getFieldLabel, 
  getFieldType 
} from '../../../../utils/templateFieldDetector';

interface EditPanelProps {
  product: Product;
  availableFields: string[];
  getCurrentProductValue: (product: Product, field: string) => any;
  onEditField: (productId: string, field: string, newValue: string | number) => void;
  editedChanges?: {
    changes: ProductChange[];
  } | null;
  className?: string;
}

export const EditPanel: React.FC<EditPanelProps> = ({
  product,
  availableFields,
  getCurrentProductValue,
  onEditField,
  editedChanges,
  className = "w-full lg:w-80 bg-gray-50 border-b lg:border-b-0 lg:border-r p-3 xs:p-4 overflow-y-auto order-2 lg:order-1"
}) => {
  return (
    <div className={className}>
      <h3 className="text-base xs:text-lg font-semibold text-gray-800 mb-3 xs:mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 xs:w-5 xs:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="truncate">Editar Producto</span>
      </h3>
      
      <div className="space-y-3 xs:space-y-4">
        {/* Renderizar solo campos disponibles para esta plantilla */}
        {availableFields.map(field => {
          const fieldType = getFieldType(field as any);
          const fieldLabel = getFieldLabel(field as any);
          const isRequired = field === 'nombre';
          
          return (
            <div key={field}>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
                {fieldLabel} {isRequired && <span className="text-red-500">*</span>}
              </label>
              <EditableField
                value={getCurrentProductValue(product, field)}
                fieldName={field}
                fieldType={fieldType}
                isRequired={isRequired}
                onSave={(newValue) => onEditField(product.id, field, newValue)}
                className="w-full"
              />
            </div>
          );
        })}
      </div>

      {/* Información de cambios */}
      {editedChanges && editedChanges.changes.length > 0 && (
        <div className="mt-4 xs:mt-6 p-2 xs:p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="text-xs xs:text-sm font-medium text-blue-800 mb-1.5 xs:mb-2">
            Cambios realizados ({editedChanges.changes.length})
          </h4>
          <div className="space-y-1">
            {editedChanges.changes.map((change: ProductChange, index: number) => (
              <div key={index} className="text-xs text-blue-700">
                <span className="font-medium">{change.field}:</span> {change.originalValue} → {change.newValue}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 