import React, { useState } from 'react';
import { ProductEditorProvider } from '../../../contexts/ProductEditorContext';
import { PosterEditor } from './PosterEditor';
import { Product } from '../../../data/products';
import { TemplateModel } from '../../../constants/posters/templates';

// Tipos específicos para el ejemplo
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

// Datos de ejemplo
const EXAMPLE_PRODUCTS: Product[] = [
  {
    id: 'TEC-001',
    sku: 'TEC-001',
    name: 'MacBook Pro M3 Pro 14"',
    description: 'Laptop Apple M3 Pro 14 pulgadas',
    price: 1299999.99,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    category: 'Tecnología'
  },
  {
    id: 'TEC-002',
    sku: 'TEC-002',
    name: 'iPad Pro 12.9"',
    description: 'iPad Pro 12.9" M2 256GB',
    price: 799999.99,
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0',
    category: 'Tecnología'
  }
];

const PLANTILLA_OPTIONS: PlantillaOption[] = [
  { value: 'Ladrillazos', label: 'Ladrillazos' },
  { value: 'Superprecio', label: 'Superprecio' },
  { value: 'Constructor', label: 'Constructor' }
];

const COMBO_OPTIONS: ComboOption[] = [
  { value: 'precio_lleno', label: 'PRECIO LLENO' },
  { value: 'antes_ahora_dto', label: 'ANTES/AHORA CON DTO' },
  { value: 'descuento_plano_categoria', label: 'DESCUENTO PLANO CATEGORIA' }
];

const EXAMPLE_FINANCING: FinancingOption[] = [
  {
    bank: 'Banco Macro',
    logo: '/logos/macro.png',
    cardName: 'Macro Card',
    plan: '12 cuotas sin interés'
  }
];

// Mock de componentes de plantillas
const MockTemplateComponents = {
  'LadrillazosComponent': ({ nombre, precioActual, porcentaje, sap }: any) => (
    <div className="bg-gray-800 text-white p-8 rounded-lg w-96 h-64 flex flex-col justify-between">
      <div className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-2 rounded">
        LADRILLAZOS
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">{nombre || 'Producto de ejemplo'}</h3>
        <div className="text-3xl font-bold text-green-400">${precioActual || '999999'}</div>
        {porcentaje && <div className="text-orange-400">{porcentaje}% OFF</div>}
        <div className="text-sm text-gray-300 mt-2">SAP: {sap || 'N/A'}</div>
      </div>
    </div>
  )
};

const MOCK_MODELOS: Record<string, TemplateModel[]> = {
  'Ladrillazos': [
    {
      id: 'ladrillazos-1',
      componentPath: 'LadrillazosComponent'
    },
    {
      id: 'ladrillazos-5',
      componentPath: 'LadrillazosComponent'
    }
  ]
};

export const EditorExample: React.FC = () => {
  // Estados de selección
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<PlantillaOption | null>(null);
  const [comboSeleccionado, setComboSeleccionado] = useState<ComboOption | null>(null);
  const [modeloSeleccionado, setModeloSeleccionado] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(EXAMPLE_PRODUCTS);

  const handlePrint = () => {
    console.log('🖨️ Imprimiendo carteles...', {
      plantilla: plantillaSeleccionada?.label,
      tipo: comboSeleccionado?.label,
      modelo: modeloSeleccionado,
      productos: selectedProducts.length
    });
    
    // Aquí iría la lógica real de impresión
    alert(`Imprimiendo ${selectedProducts.length} cartel${selectedProducts.length !== 1 ? 'es' : ''} de ${plantillaSeleccionada?.label}`);
  };

  const handleUpdateProduct = (productId: string, updates: Partial<Product>) => {
    setSelectedProducts(prev => 
      prev.map(product => 
        product.id === productId ? { ...product, ...updates } : product
      )
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleRemoveAllProducts = () => {
    setSelectedProducts([]);
  };

  return (
    <ProductEditorProvider>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🛠️ Editor de Carteles - Ejemplo Completo
          </h1>
          
          {/* Panel de controles */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Configuración</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Selector de Familia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Familia:
                </label>
                <select
                  value={plantillaSeleccionada?.value || ''}
                  onChange={(e) => {
                    const selected = PLANTILLA_OPTIONS.find(opt => opt.value === e.target.value);
                    setPlantillaSeleccionada(selected || null);
                    setModeloSeleccionado(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar familia...</option>
                  {PLANTILLA_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Plantilla */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plantilla:
                </label>
                <select
                  value={comboSeleccionado?.value || ''}
                  onChange={(e) => {
                    const selected = COMBO_OPTIONS.find(opt => opt.value === e.target.value);
                    setComboSeleccionado(selected || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!plantillaSeleccionada}
                >
                  <option value="">Seleccionar plantilla...</option>
                  {COMBO_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info de productos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Productos:
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-sm text-gray-600">
                    {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} seleccionado{selectedProducts.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Editor de Carteles */}
          <PosterEditor
            templateComponents={MockTemplateComponents}
            plantillaSeleccionada={plantillaSeleccionada}
            comboSeleccionado={comboSeleccionado}
            modeloSeleccionado={modeloSeleccionado}
            setModeloSeleccionado={setModeloSeleccionado}
            selectedProduct={selectedProducts[0] || null}
            selectedProducts={selectedProducts}
            selectedFinancing={EXAMPLE_FINANCING}
            PLANTILLA_MODELOS={MOCK_MODELOS}
            onRemoveProduct={handleRemoveProduct}
            onRemoveAllProducts={handleRemoveAllProducts}
            onUpdateProduct={handleUpdateProduct}
            onPrint={handlePrint}
          />

          {/* Info de ayuda */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📚 Funcionalidades implementadas:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">✅ Edición:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Campos editables en tiempo real</li>
                  <li>Validación automática</li>
                  <li>Solo campos relevantes por plantilla</li>
                  <li>Tracking de cambios</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">✅ Funcionalidades:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Botón imprimir inteligente</li>
                  <li>Sistema de reporte automático</li>
                  <li>Eliminación con confirmación</li>
                  <li>Vista expandida de productos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProductEditorProvider>
  );
}; 