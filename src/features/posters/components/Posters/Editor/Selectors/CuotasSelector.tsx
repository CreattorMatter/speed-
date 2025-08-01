import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calculator } from 'lucide-react';
import { ProductoReal } from '../../../../../../types/product';
import { calculatePricePorCuota, formatPriceCuota, DEFAULT_FINANCING_OPTIONS } from '../../../../../../utils/financingCalculator';

// ==========================================
// INTERFAZ DEL SELECTOR DE CUOTAS
// ==========================================

interface CuotasSelectorProps {
  value: number;
  onChange: (cuotas: number) => void;
  producto?: ProductoReal;
  disabled?: boolean;
  className?: string;
}

// ==========================================
// OPCIONES DE CUOTAS PREDEFINIDAS
// ==========================================

const CUOTAS_OPTIONS = [
  { value: 0, label: 'Sin financiación', description: 'Pago contado' },
  { value: 3, label: '3 cuotas', description: 'Sin interés' },
  { value: 6, label: '6 cuotas', description: 'Sin interés' },
  { value: 12, label: '12 cuotas', description: 'Con interés' },
  { value: 18, label: '18 cuotas', description: 'Con interés' },
  { value: 24, label: '24 cuotas', description: 'Con interés' }
];

// ==========================================
// SELECTOR DE CUOTAS
// ==========================================

export const CuotasSelector: React.FC<CuotasSelectorProps> = ({
  value,
  onChange,
  producto,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customCuotas, setCustomCuotas] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener información de la opción seleccionada
  const selectedOption = CUOTAS_OPTIONS.find(opt => opt.value === value);
  const isCustomValue = !selectedOption && value > 0;

  // Calcular precio por cuota si hay producto
  const precioCuota = producto && value > 0 ? calculatePricePorCuota(producto.precio, value) : 0;

  // Manejar selección de opción predefinida
  const handleOptionSelect = (cuotas: number) => {
    onChange(cuotas);
    setIsOpen(false);
    setShowCustomInput(false);
    setCustomCuotas('');
  };

  // Manejar cuotas personalizadas
  const handleCustomSubmit = () => {
    const cuotasNum = parseInt(customCuotas, 10);
    if (cuotasNum > 0 && cuotasNum <= 60) {
      onChange(cuotasNum);
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomCuotas('');
    }
  };

  // Renderizar texto de selección
  const renderSelectedText = () => {
    if (value === 0) {
      return (
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">Sin financiación</span>
        </div>
      );
    }

    if (isCustomValue) {
      return (
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-500" />
          <div className="flex flex-col">
            <span className="text-blue-700 font-medium">{value} cuotas</span>
            {precioCuota > 0 && (
              <span className="text-xs text-blue-500">{formatPriceCuota(precioCuota)} por cuota</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Calculator className="w-4 h-4 text-green-500" />
        <div className="flex flex-col">
          <span className="text-green-700 font-medium">{selectedOption?.label}</span>
          {precioCuota > 0 && (
            <span className="text-xs text-green-500">{formatPriceCuota(precioCuota)} por cuota</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Selector principal */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full border rounded-lg px-3 py-2 bg-white text-left flex items-center justify-between
          focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' : 'border-gray-300 hover:border-green-400'}
          ${isOpen ? 'border-green-500 ring-2 ring-green-100' : ''}
        `}
      >
        {renderSelectedText()}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 bg-green-50">
            <div className="text-sm font-semibold text-green-800 flex items-center gap-2">
              💳 Opciones de Financiación
            </div>
            {producto && (
              <div className="text-xs text-green-600 mt-1">
                Precio: {formatPriceCuota(producto.precio, true)}
              </div>
            )}
          </div>

          {/* Opciones predefinidas */}
          <div className="py-1">
            {CUOTAS_OPTIONS.map((option) => {
              const isSelected = value === option.value;
              const calculatedPrice = producto && option.value > 0 ? calculatePricePorCuota(producto.precio, option.value) : 0;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect(option.value)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-green-50 flex items-center justify-between
                    ${isSelected ? 'bg-green-100 text-green-800' : 'text-gray-700'}
                  `}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-gray-500">{option.description}</span>
                  </div>
                  {calculatedPrice > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">
                        {formatPriceCuota(calculatedPrice)}
                      </div>
                      <div className="text-xs text-gray-500">por cuota</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Opción personalizada */}
          <div className="p-3">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full text-left text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ✏️ Cantidad personalizada...
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="number"
                  value={customCuotas}
                  onChange={(e) => setCustomCuotas(e.target.value)}
                  placeholder="Ej: 15"
                  min="1"
                  max="60"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomSubmit();
                    if (e.key === 'Escape') {
                      setShowCustomInput(false);
                      setCustomCuotas('');
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    disabled={!customCuotas || parseInt(customCuotas, 10) <= 0}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Aplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomCuotas('');
                    }}
                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="p-3 border-t border-gray-200 bg-blue-50">
            <div className="text-xs text-blue-700">
              💡 <strong>Campos automáticos:</strong> Al seleccionar cuotas, los campos <code>{'{cuota}'}</code> y <code>{'{precio_cuota}'}</code> se actualizarán automáticamente en toda la plantilla.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuotasSelector;