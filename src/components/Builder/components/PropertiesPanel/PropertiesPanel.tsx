import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectSelectedElements,
  updateElement,
  removeElement,
  duplicateElement,
  moveElementToFront,
  moveElementToBack,
  CartelElement,
  ElementStyle
} from '../../redux/builderSlice';

// ====================================
// TIPOS Y INTERFACES
// ====================================

interface PropertiesPanelProps {
  className?: string;
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

// ====================================
// COMPONENTES AUXILIARES
// ====================================

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

const NumberInput: React.FC<NumberInputProps> = ({ 
  value, 
  onChange, 
  label, 
  min = 0, 
  max = 1000, 
  step = 1, 
  unit = '' 
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {unit && <span className="text-xs text-gray-500">{unit}</span>}
      </div>
    </div>
  );
};

// ====================================
// FORMULARIOS ESPECÍFICOS POR TIPO
// ====================================

const PrecioForm: React.FC<{ element: CartelElement & { type: 'precio' } }> = ({ element }) => {
  const dispatch = useDispatch();

  const updateContent = useCallback((updates: any) => {
    dispatch(updateElement({
      id: element.id,
      updates: { content: { ...element.content, ...updates } }
    }));
  }, [dispatch, element.id, element.content]);

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-gray-800">Configuración de Precio</h4>
      
      <NumberInput
        value={element.content.precio}
        onChange={(precio) => updateContent({ precio })}
        label="Precio"
        min={0}
        step={0.01}
        unit={element.content.moneda}
      />

      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700">Moneda</label>
        <select
          value={element.content.moneda}
          onChange={(e) => updateContent({ moneda: e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="$">$ (Pesos)</option>
          <option value="US$">US$ (Dólares)</option>
          <option value="€">€ (Euros)</option>
        </select>
      </div>

      <NumberInput
        value={element.content.decimales}
        onChange={(decimales) => updateContent({ decimales })}
        label="Decimales"
        min={0}
        max={4}
      />

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Prefijo</label>
          <input
            type="text"
            value={element.content.prefijo || ''}
            onChange={(e) => updateContent({ prefijo: e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ej: Desde"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Sufijo</label>
          <input
            type="text"
            value={element.content.sufijo || ''}
            onChange={(e) => updateContent({ sufijo: e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ej: c/u"
          />
        </div>
      </div>
    </div>
  );
};

const DescuentoForm: React.FC<{ element: CartelElement & { type: 'descuento' } }> = ({ element }) => {
  const dispatch = useDispatch();

  const updateContent = useCallback((updates: any) => {
    dispatch(updateElement({
      id: element.id,
      updates: { content: { ...element.content, ...updates } }
    }));
  }, [dispatch, element.id, element.content]);

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-gray-800">Configuración de Descuento</h4>
      
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700">Tipo de Descuento</label>
        <select
          value={element.content.tipoDescuento}
          onChange={(e) => updateContent({ tipoDescuento: e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="porcentaje">Porcentaje</option>
          <option value="precio-fijo">Precio Fijo</option>
          <option value="precio-tachado">Precio Tachado</option>
        </select>
      </div>

      {element.content.tipoDescuento === 'porcentaje' && (
        <NumberInput
          value={element.content.porcentaje || 0}
          onChange={(porcentaje) => updateContent({ porcentaje })}
          label="Porcentaje de Descuento"
          min={0}
          max={100}
          unit="%"
        />
      )}

      {element.content.tipoDescuento === 'precio-fijo' && (
        <NumberInput
          value={element.content.precioOferta || 0}
          onChange={(precioOferta) => updateContent({ precioOferta })}
          label="Precio de Oferta"
          min={0}
          step={0.01}
          unit="$"
        />
      )}

      {element.content.tipoDescuento === 'precio-tachado' && (
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            value={element.content.precioOriginal || 0}
            onChange={(precioOriginal) => updateContent({ precioOriginal })}
            label="Precio Original"
            min={0}
            step={0.01}
            unit="$"
          />
          <NumberInput
            value={element.content.precioOferta || 0}
            onChange={(precioOferta) => updateContent({ precioOferta })}
            label="Precio Oferta"
            min={0}
            step={0.01}
            unit="$"
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700">Etiqueta</label>
        <input
          type="text"
          value={element.content.etiqueta || ''}
          onChange={(e) => updateContent({ etiqueta: e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Ej: DESCUENTO, OFERTA"
        />
      </div>
    </div>
  );
};

const ProductoForm: React.FC<{ element: CartelElement & { type: 'producto' } }> = ({ element }) => {
  const dispatch = useDispatch();

  const updateContent = useCallback((updates: any) => {
    dispatch(updateElement({
      id: element.id,
      updates: { content: { ...element.content, ...updates } }
    }));
  }, [dispatch, element.id, element.content]);

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-gray-800">Información del Producto</h4>
      
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700">Nombre del Producto</label>
        <input
          type="text"
          value={element.content.nombre}
          onChange={(e) => updateContent({ nombre: e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Nombre del producto"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700">Marca</label>
        <input
          type="text"
          value={element.content.marca || ''}
          onChange={(e) => updateContent({ marca: e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Marca del producto"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700">Descripción</label>
        <textarea
          value={element.content.descripcion || ''}
          onChange={(e) => updateContent({ descripcion: e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Descripción del producto"
          rows={3}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700">Categoría</label>
        <input
          type="text"
          value={element.content.categoria || ''}
          onChange={(e) => updateContent({ categoria: e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Categoría del producto"
        />
      </div>
    </div>
  );
};

const TextoLibreForm: React.FC<{ element: CartelElement & { type: 'texto-libre' } }> = ({ element }) => {
  const dispatch = useDispatch();

  const updateContent = useCallback((updates: any) => {
    dispatch(updateElement({
      id: element.id,
      updates: { content: { ...element.content, ...updates } }
    }));
  }, [dispatch, element.id, element.content]);

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-gray-800">Texto Libre</h4>
      
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700">Texto</label>
        <textarea
          value={element.content.texto}
          onChange={(e) => updateContent({ texto: e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Ingrese su texto"
          rows={4}
        />
      </div>
    </div>
  );
};

// ====================================
// PANEL DE ESTILOS
// ====================================

const StylePanel: React.FC<{ element: CartelElement }> = ({ element }) => {
  const dispatch = useDispatch();

  const updateStyle = useCallback((updates: Partial<ElementStyle>) => {
    dispatch(updateElement({
      id: element.id,
      updates: { style: { ...element.style, ...updates } }
    }));
  }, [dispatch, element.id, element.style]);

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-gray-800">Estilos</h4>

      {/* Tipografía */}
      <div className="space-y-3">
        <h5 className="font-medium text-xs text-gray-600">Tipografía</h5>
        
        <NumberInput
          value={element.style.fontSize || 16}
          onChange={(fontSize) => updateStyle({ fontSize })}
          label="Tamaño de Fuente"
          min={8}
          max={200}
          unit="px"
        />

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Familia de Fuente</label>
          <select
            value={element.style.fontFamily || 'Arial, sans-serif'}
            onChange={(e) => updateStyle({ fontFamily: e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
            <option value="Impact, sans-serif">Impact</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Peso de Fuente</label>
          <select
            value={element.style.fontWeight || 'normal'}
            onChange={(e) => updateStyle({ fontWeight: e.target.value as any })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="bold">Negrita</option>
            <option value="100">100 - Thin</option>
            <option value="300">300 - Light</option>
            <option value="500">500 - Medium</option>
            <option value="700">700 - Bold</option>
            <option value="900">900 - Black</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Alineación</label>
          <div className="grid grid-cols-4 gap-1">
            {(['left', 'center', 'right', 'justify'] as const).map((align) => (
              <button
                key={align}
                onClick={() => updateStyle({ textAlign: align })}
                className={`px-2 py-1 text-xs border rounded ${
                  element.style.textAlign === align
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {align === 'left' && '⬅️'}
                {align === 'center' && '⬆️'}
                {align === 'right' && '➡️'}
                {align === 'justify' && '⬌'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Colores */}
      <div className="space-y-3">
        <h5 className="font-medium text-xs text-gray-600">Colores</h5>
        
        <ColorPicker
          value={element.style.color || '#000000'}
          onChange={(color) => updateStyle({ color })}
          label="Color de Texto"
        />

        <ColorPicker
          value={element.style.backgroundColor || 'transparent'}
          onChange={(backgroundColor) => updateStyle({ backgroundColor })}
          label="Color de Fondo"
        />
      </div>

      {/* Espaciado */}
      <div className="space-y-3">
        <h5 className="font-medium text-xs text-gray-600">Espaciado</h5>
        
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            value={element.style.padding || 0}
            onChange={(padding) => updateStyle({ padding })}
            label="Padding"
            min={0}
            max={100}
            unit="px"
          />
          <NumberInput
            value={element.style.margin || 0}
            onChange={(margin) => updateStyle({ margin })}
            label="Margin"
            min={0}
            max={100}
            unit="px"
          />
        </div>
      </div>

      {/* Bordes */}
      <div className="space-y-3">
        <h5 className="font-medium text-xs text-gray-600">Bordes</h5>
        
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Borde</label>
          <input
            type="text"
            value={element.style.border || ''}
            onChange={(e) => updateStyle({ border: e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ej: 1px solid #000"
          />
        </div>

        <NumberInput
          value={element.style.borderRadius || 0}
          onChange={(borderRadius) => updateStyle({ borderRadius })}
          label="Radio del Borde"
          min={0}
          max={50}
          unit="px"
        />
      </div>
    </div>
  );
};

// ====================================
// COMPONENTE PRINCIPAL
// ====================================

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const selectedElements = useSelector(selectSelectedElements);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout'>('content');

  const selectedElement = selectedElements[0]; // Trabajamos con el primer elemento seleccionado

  if (selectedElements.length === 0) {
    return (
      <div className={`properties-panel bg-white border-l border-gray-200 w-80 h-full flex flex-col ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Propiedades</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">Selecciona un elemento</p>
            <p className="text-xs mt-1">para editar sus propiedades</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedElements.length > 1) {
    return (
      <div className={`properties-panel bg-white border-l border-gray-200 w-80 h-full flex flex-col ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Propiedades</h2>
        </div>
        <div className="flex-1 p-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-sm font-medium">{selectedElements.length} elementos seleccionados</p>
          </div>

          {/* Acciones múltiples */}
          <div className="space-y-2">
            <button
              onClick={() => selectedElements.forEach(el => dispatch(duplicateElement(el.id)))}
              className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Duplicar Todos
            </button>
            <button
              onClick={() => selectedElements.forEach(el => dispatch(removeElement(el.id)))}
              className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Eliminar Todos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContentForm = () => {
    switch (selectedElement.type) {
      case 'precio':
        return <PrecioForm element={selectedElement as CartelElement & { type: 'precio' }} />;
      case 'descuento':
        return <DescuentoForm element={selectedElement as CartelElement & { type: 'descuento' }} />;
      case 'producto':
        return <ProductoForm element={selectedElement as CartelElement & { type: 'producto' }} />;
      case 'texto-libre':
        return <TextoLibreForm element={selectedElement as CartelElement & { type: 'texto-libre' }} />;
      default:
        return (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Formulario no disponible</p>
            <p className="text-xs">para el tipo: {selectedElement.type}</p>
          </div>
        );
    }
  };

  return (
    <div className={`properties-panel bg-white border-l border-gray-200 w-80 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Propiedades</h2>
        <p className="text-xs text-gray-500 mt-1">
          {selectedElement.type} • {selectedElement.id.slice(0, 8)}...
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'content', label: 'Contenido', icon: '📝' },
          { id: 'style', label: 'Estilo', icon: '🎨' },
          { id: 'layout', label: 'Posición', icon: '📐' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors duration-200 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' && renderContentForm()}
        {activeTab === 'style' && <StylePanel element={selectedElement} />}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-800">Posición y Tamaño</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                value={selectedElement.position.x}
                onChange={(x) => dispatch(updateElement({
                  id: selectedElement.id,
                  updates: { position: { ...selectedElement.position, x } }
                }))}
                label="X"
                unit="px"
              />
              <NumberInput
                value={selectedElement.position.y}
                onChange={(y) => dispatch(updateElement({
                  id: selectedElement.id,
                  updates: { position: { ...selectedElement.position, y } }
                }))}
                label="Y"
                unit="px"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                value={selectedElement.size.width}
                onChange={(width) => dispatch(updateElement({
                  id: selectedElement.id,
                  updates: { size: { ...selectedElement.size, width } }
                }))}
                label="Ancho"
                min={10}
                unit="px"
              />
              <NumberInput
                value={selectedElement.size.height}
                onChange={(height) => dispatch(updateElement({
                  id: selectedElement.id,
                  updates: { size: { ...selectedElement.size, height } }
                }))}
                label="Alto"
                min={10}
                unit="px"
              />
            </div>

            <NumberInput
              value={selectedElement.zIndex}
              onChange={(zIndex) => dispatch(updateElement({
                id: selectedElement.id,
                updates: { zIndex }
              }))}
              label="Z-Index (Capa)"
              min={-100}
              max={100}
            />

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedElement.visible}
                  onChange={(e) => dispatch(updateElement({
                    id: selectedElement.id,
                    updates: { visible: e.target.checked }
                  }))}
                  className="rounded border-gray-300"
                />
                <span className="text-xs text-gray-700">Visible</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedElement.locked}
                  onChange={(e) => dispatch(updateElement({
                    id: selectedElement.id,
                    updates: { locked: e.target.checked }
                  }))}
                  className="rounded border-gray-300"
                />
                <span className="text-xs text-gray-700">Bloqueado</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => dispatch(moveElementToFront(selectedElement.id))}
            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            title="Traer al frente"
          >
            ⬆️ Frente
          </button>
          <button
            onClick={() => dispatch(moveElementToBack(selectedElement.id))}
            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            title="Enviar atrás"
          >
            ⬇️ Atrás
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => dispatch(duplicateElement(selectedElement.id))}
            className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            📋 Duplicar
          </button>
          <button
            onClick={() => dispatch(removeElement(selectedElement.id))}
            className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel; 