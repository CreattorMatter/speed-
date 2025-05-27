import React from 'react';
import { PreviewArea } from './PreviewArea';
import { PrintButton } from './PrintButton';
import { type Product } from '../../../data/products';
import { type TemplateModel } from '../../../constants/posters/templates';

// Tipos específicos para el componente
interface PlantillaOption {
  value: string;
  label: string;
}

interface ComboOption {
  value: string;
  label: string;
}

interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  plan: string;
}

// Interfaz para las props de los componentes de plantilla
interface PlantillaComponentProps {
  small?: boolean;
  nombre?: string;
  precioActual?: string;
  porcentaje?: string;
  sap?: string;
  fechasDesde?: string;
  fechasHasta?: string;
  origen?: string;
  precioSinImpuestos?: string;
  financiacion?: FinancingOption[];
  productos?: Product[];
  titulo?: string;
  [key: string]: unknown;
}

interface PosterEditorProps {
  templateComponents: Record<string, React.ComponentType<PlantillaComponentProps>>;
  plantillaSeleccionada: PlantillaOption | null;
  comboSeleccionado: ComboOption | null;
  modeloSeleccionado: string | null;
  setModeloSeleccionado: (value: string | null) => void;
  selectedProduct: Product | null;
  selectedProducts: Product[];
  selectedFinancing: FinancingOption[];
  PLANTILLA_MODELOS: Record<string, TemplateModel[]>;
  onRemoveProduct?: (productId: string) => void;
  onRemoveAllProducts?: () => void;
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => void;
  onPrint?: () => void;
}

export const PosterEditor: React.FC<PosterEditorProps> = ({
  templateComponents,
  plantillaSeleccionada,
  comboSeleccionado,
  modeloSeleccionado,
  setModeloSeleccionado,
  selectedProduct,
  selectedProducts,
  selectedFinancing,
  PLANTILLA_MODELOS,
  onRemoveProduct,
  onRemoveAllProducts,
  onUpdateProduct,
  onPrint = () => console.log('🖨️ Imprimiendo...')
}) => {
  return (
    <div className="flex flex-col">
      {/* Área de Preview */}
      <PreviewArea
        templateComponents={templateComponents}
        plantillaSeleccionada={plantillaSeleccionada}
        comboSeleccionado={comboSeleccionado}
        modeloSeleccionado={modeloSeleccionado}
        setModeloSeleccionado={setModeloSeleccionado}
        selectedProduct={selectedProduct}
        selectedProducts={selectedProducts}
        selectedFinancing={selectedFinancing}
        PLANTILLA_MODELOS={PLANTILLA_MODELOS}
        onRemoveProduct={onRemoveProduct}
        onRemoveAllProducts={onRemoveAllProducts}
        onUpdateProduct={onUpdateProduct}
      />
      
      {/* Botón de Imprimir */}
      <PrintButton
        plantillaFamily={plantillaSeleccionada?.label || 'Sin especificar'}
        plantillaType={comboSeleccionado?.label || 'Sin especificar'}
        selectedProducts={selectedProducts}
        onPrint={onPrint}
        disabled={selectedProducts.length === 0}
      />
    </div>
  );
}; 