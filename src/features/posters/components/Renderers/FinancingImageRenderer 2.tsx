import React, { useState } from 'react';
import { DraggableComponentV3 } from '../../../builderV3/types';
import { FinancingLogoModal } from '../Posters/FinancingLogoModal';

// ==========================================
// INTERFAZ DEL RENDERER DE IMAGEN DE FINANCIACIÓN
// ==========================================

interface FinancingImageRendererProps {
  component: DraggableComponentV3;
  isSelected?: boolean;
  isEditMode?: boolean;
  onUpdateComponent?: (componentId: string, updates: Partial<DraggableComponentV3>) => void;
}

// ==========================================
// RENDERER ESPECIAL PARA IMAGEN DE FINANCIACIÓN
// ==========================================

export const FinancingImageRenderer: React.FC<FinancingImageRendererProps> = ({
  component,
  isSelected = false,
  isEditMode = false,
  onUpdateComponent
}) => {
  const [showModal, setShowModal] = useState(false);

  // Extraer información del contenido
  const imageUrl = component.content?.imageUrl || '';
  const selectedBank = component.content?.selectedBank || '';
  const selectedPlan = component.content?.selectedPlan || '';
  const imageAlt = component.content?.imageAlt || 'Logo de financiación';

  // Manejar selección de logo desde el modal
  const handleLogoSelect = (bank: string, logo: string, plan: string) => {
    if (onUpdateComponent) {
      onUpdateComponent(component.id, {
        content: {
          ...component.content,
          fieldType: 'financing-logo',
          imageUrl: logo,
          selectedBank: bank,
          selectedPlan: plan,
          imageAlt: `Logo de ${bank} - ${plan}`
        }
      });
    }
  };

  // Manejar clic en el componente
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Solo abrir modal si estamos en modo edición
    if (isEditMode) {
      setShowModal(true);
    }
  };

  // Estilos del componente
  const componentStyle = {
    position: 'absolute' as const,
    left: component.position.x,
    top: component.position.y,
    width: component.size.width,
    height: component.size.height,
    zIndex: component.position.z,
    cursor: isEditMode ? 'pointer' : 'default',
    opacity: component.style?.effects?.opacity || 1,
    borderRadius: component.style?.border?.radius ? 
      `${component.style.border.radius.topLeft}px ${component.style.border.radius.topRight}px ${component.style.border.radius.bottomRight}px ${component.style.border.radius.bottomLeft}px` : 
      '0px',
    border: component.style?.border?.width ? 
      `${component.style.border.width}px ${component.style.border.style} ${component.style.border.color}` : 
      'none',
    backgroundColor: component.style?.color?.backgroundColor || 'transparent'
  };

  return (
    <>
      {/* Componente de imagen */}
      <div
        style={componentStyle}
        onClick={handleClick}
        className={`
          financing-image-component
          ${isSelected ? 'ring-2 ring-blue-500' : ''}
          ${isEditMode ? 'hover:ring-2 hover:ring-green-400' : ''}
          transition-all duration-200
        `}
      >
        {/* Imagen de financiación */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-contain"
            style={{
              filter: component.style?.effects?.filter || 'none'
            }}
            onError={(e) => {
              // Si falla la carga, mostrar placeholder
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          /* Placeholder cuando no hay imagen seleccionada */
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 border-2 border-dashed border-green-300 rounded-lg flex flex-col items-center justify-center text-green-600">
            <div className="text-4xl mb-2">💳</div>
            <div className="text-sm font-medium text-center px-2">
              {isEditMode ? 'Clic para seleccionar logo' : 'Logo de financiación'}
            </div>
            {isEditMode && (
              <div className="text-xs text-green-500 mt-1 text-center px-2">
                ¡Sin edición manual!
              </div>
            )}
          </div>
        )}

        {/* Indicador de selección en modo edición */}
        {isEditMode && imageUrl && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
            {selectedBank}
          </div>
        )}

        {/* Información adicional en hover (solo en modo edición) */}
        {isEditMode && selectedBank && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-lg opacity-0 hover:opacity-100 transition-opacity">
            <div className="font-medium">{selectedBank}</div>
            <div className="text-green-300">{selectedPlan}</div>
          </div>
        )}
      </div>

      {/* Modal de selección */}
      <FinancingLogoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleLogoSelect}
      />
    </>
  );
};

export default FinancingImageRenderer;