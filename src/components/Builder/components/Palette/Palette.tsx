import React from 'react';
import { useDispatch } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import { 
  addElement, 
  ElementType, 
  CartelElement,
  PrecioElement,
  DescuentoElement,
  ProductoElement,
  CuotasElement,
  OrigenElement,
  CodigoElement,
  FechaElement,
  NotaLegalElement,
  ImagenElement,
  TextoLibreElement,
  LogoElement
} from '../../redux/builderSlice';

// ====================================
// TIPOS Y INTERFACES
// ====================================

interface PaletteProps {
  className?: string;
}

interface PaletteItemConfig {
  id: string;
  type: ElementType;
  name: string;
  description: string;
  icon: string;
  category: 'basicos' | 'precio-info' | 'producto-info' | 'legal-fecha' | 'multimedia';
  defaultSize: { width: number; height: number };
  defaultStyle: any;
  defaultContent: any;
}

interface PaletteCategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ====================================
// CONFIGURACIÓN DE CATEGORÍAS
// ====================================

const PALETTE_CATEGORIES: PaletteCategoryConfig[] = [
  {
    id: 'basicos',
    name: 'Básicos',
    description: 'Elementos fundamentales para cualquier cartel',
    icon: '📝',
    color: '#3B82F6'
  },
  {
    id: 'precio-info',
    name: 'Precios',
    description: 'Información de precios, descuentos y cuotas',
    icon: '💰',
    color: '#10B981'
  },
  {
    id: 'producto-info',
    name: 'Producto',
    description: 'Información del producto y origen',
    icon: '📦',
    color: '#8B5CF6'
  },
  {
    id: 'legal-fecha',
    name: 'Legal y Fechas',
    description: 'Notas legales, fechas y códigos',
    icon: '📅',
    color: '#F59E0B'
  },
  {
    id: 'multimedia',
    name: 'Multimedia',
    description: 'Imágenes, logos y elementos visuales',
    icon: '🖼️',
    color: '#EF4444'
  }
];

// ====================================
// CONFIGURACIÓN DE ELEMENTOS
// ====================================

const PALETTE_ITEMS: PaletteItemConfig[] = [
  // BÁSICOS
  {
    id: 'texto-libre',
    type: 'texto-libre',
    name: 'Texto Libre',
    description: 'Texto personalizable para cualquier propósito',
    icon: '📝',
    category: 'basicos',
    defaultSize: { width: 200, height: 40 },
    defaultStyle: {
      fontSize: 16,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left'
    },
    defaultContent: {
      texto: 'Escribir aquí...',
      placeholder: 'Ingrese su texto'
    }
  },

  // PRECIOS
  {
    id: 'precio',
    type: 'precio',
    name: 'Precio',
    description: 'Precio principal del producto',
    icon: '💵',
    category: 'precio-info',
    defaultSize: { width: 120, height: 60 },
    defaultStyle: {
      fontSize: 36,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#DC2626',
      textAlign: 'center'
    },
    defaultContent: {
      precio: 0,
      moneda: '$',
      decimales: 2,
      prefijo: '',
      sufijo: ''
    }
  },
  {
    id: 'descuento',
    type: 'descuento',
    name: 'Descuento',
    description: 'Información de descuentos y ofertas',
    icon: '🏷️',
    category: 'precio-info',
    defaultSize: { width: 150, height: 50 },
    defaultStyle: {
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#FFFFFF',
      backgroundColor: '#DC2626',
      textAlign: 'center',
      borderRadius: 8,
      padding: 8
    },
    defaultContent: {
      porcentaje: 20,
      tipoDescuento: 'porcentaje',
      etiqueta: 'DESCUENTO'
    }
  },
  {
    id: 'cuotas',
    type: 'cuotas',
    name: 'Cuotas',
    description: 'Información de planes de pago y cuotas',
    icon: '💳',
    category: 'precio-info',
    defaultSize: { width: 180, height: 40 },
    defaultStyle: {
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      color: '#059669',
      textAlign: 'center'
    },
    defaultContent: {
      numeroCuotas: 3,
      valorCuota: 0,
      interes: 0,
      textoAdicional: 'sin interés'
    }
  },

  // PRODUCTO
  {
    id: 'producto',
    type: 'producto',
    name: 'Producto',
    description: 'Nombre y descripción del producto',
    icon: '📦',
    category: 'producto-info',
    defaultSize: { width: 250, height: 80 },
    defaultStyle: {
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#1F2937',
      textAlign: 'left'
    },
    defaultContent: {
      nombre: 'Nombre del Producto',
      marca: '',
      descripcion: '',
      categoria: ''
    }
  },
  {
    id: 'origen',
    type: 'origen',
    name: 'Origen',
    description: 'Información de origen y certificaciones',
    icon: '🌍',
    category: 'producto-info',
    defaultSize: { width: 120, height: 30 },
    defaultStyle: {
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      color: '#6B7280',
      textAlign: 'center'
    },
    defaultContent: {
      pais: 'Argentina',
      region: '',
      certificacion: '',
      icono: '🇦🇷'
    }
  },

  // LEGAL Y FECHAS
  {
    id: 'codigo',
    type: 'codigo',
    name: 'Código',
    description: 'Códigos de barras, QR o SKU',
    icon: '📱',
    category: 'legal-fecha',
    defaultSize: { width: 100, height: 60 },
    defaultStyle: {
      fontSize: 10,
      fontFamily: 'monospace',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'center'
    },
    defaultContent: {
      codigo: '123456789',
      tipo: 'barcode',
      mostrarCodigo: true
    }
  },
  {
    id: 'fecha',
    type: 'fecha',
    name: 'Fecha',
    description: 'Fechas de vigencia y promociones',
    icon: '📅',
    category: 'legal-fecha',
    defaultSize: { width: 160, height: 30 },
    defaultStyle: {
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      color: '#6B7280',
      textAlign: 'center'
    },
    defaultContent: {
      texto: 'Válido hasta el DD/MM/AAAA',
      formato: 'DD/MM/AAAA'
    }
  },
  {
    id: 'nota-legal',
    type: 'nota-legal',
    name: 'Nota Legal',
    description: 'Condiciones, restricciones y términos',
    icon: '⚖️',
    category: 'legal-fecha',
    defaultSize: { width: 250, height: 40 },
    defaultStyle: {
      fontSize: 10,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'normal',
      color: '#6B7280',
      textAlign: 'left'
    },
    defaultContent: {
      texto: 'Promoción válida hasta agotar stock. No acumulable con otras ofertas.',
      tipoNota: 'condiciones'
    }
  },

  // MULTIMEDIA
  {
    id: 'imagen',
    type: 'imagen',
    name: 'Imagen',
    description: 'Imágenes del producto o decorativas',
    icon: '🖼️',
    category: 'multimedia',
    defaultSize: { width: 150, height: 150 },
    defaultStyle: {},
    defaultContent: {
      src: '/api/placeholder/150/150',
      alt: 'Imagen del producto',
      ajuste: 'cover'
    }
  },
  {
    id: 'logo',
    type: 'logo',
    name: 'Logo',
    description: 'Logos de marcas o empresas',
    icon: '🏢',
    category: 'multimedia',
    defaultSize: { width: 100, height: 60 },
    defaultStyle: {},
    defaultContent: {
      src: '/api/placeholder/100/60',
      alt: 'Logo de la empresa',
      empresa: 'Empresa'
    }
  }
];

// ====================================
// COMPONENTE PRINCIPAL
// ====================================

const Palette: React.FC<PaletteProps> = ({ className }) => {
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = React.useState<string>('basicos');
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  // Filtrar elementos según categoría activa y término de búsqueda
  const filteredItems = PALETTE_ITEMS.filter(item => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Crear elemento con configuración por defecto
  const createElement = (config: PaletteItemConfig): CartelElement => {
    const baseElement = {
      id: nanoid(),
      type: config.type,
      position: { x: 50, y: 50 }, // Posición inicial en el canvas
      size: config.defaultSize,
      style: config.defaultStyle,
      zIndex: 1,
      locked: false,
      visible: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Crear elemento específico según el tipo
    switch (config.type) {
      case 'precio':
        return { ...baseElement, type: 'precio', content: config.defaultContent } as PrecioElement;
      case 'descuento':
        return { ...baseElement, type: 'descuento', content: config.defaultContent } as DescuentoElement;
      case 'producto':
        return { ...baseElement, type: 'producto', content: config.defaultContent } as ProductoElement;
      case 'cuotas':
        return { ...baseElement, type: 'cuotas', content: config.defaultContent } as CuotasElement;
      case 'origen':
        return { ...baseElement, type: 'origen', content: config.defaultContent } as OrigenElement;
      case 'codigo':
        return { ...baseElement, type: 'codigo', content: config.defaultContent } as CodigoElement;
      case 'fecha':
        return { ...baseElement, type: 'fecha', content: config.defaultContent } as FechaElement;
      case 'nota-legal':
        return { ...baseElement, type: 'nota-legal', content: config.defaultContent } as NotaLegalElement;
      case 'imagen':
        return { ...baseElement, type: 'imagen', content: config.defaultContent } as ImagenElement;
      case 'texto-libre':
        return { ...baseElement, type: 'texto-libre', content: config.defaultContent } as TextoLibreElement;
      case 'logo':
        return { ...baseElement, type: 'logo', content: config.defaultContent } as LogoElement;
      default:
        return { ...baseElement, type: 'texto-libre', content: config.defaultContent } as TextoLibreElement;
    }
  };

  // Manejar añadir elemento al canvas
  const handleAddElement = (config: PaletteItemConfig) => {
    const newElement = createElement(config);
    dispatch(addElement(newElement));
  };

  // Manejar inicio de arrastrar
  const handleDragStart = (e: React.DragEvent, config: PaletteItemConfig) => {
    e.dataTransfer.setData('application/json', JSON.stringify(config));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={`palette bg-white border-r border-gray-200 w-80 h-full flex flex-col ${className || ''}`}>
      {/* Header de la Paleta */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Paleta de Elementos
        </h2>
        
        {/* Buscador */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar elementos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg 
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs de Categorías */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {PALETTE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                flex-shrink-0 px-3 py-2 text-xs font-medium border-b-2 transition-colors duration-200
                ${activeCategory === category.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
              title={category.description}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Elementos */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onClick={() => handleAddElement(item)}
              className="
                group bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 
                rounded-lg p-3 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]
                active:scale-[0.98] select-none
              "
              title={`Arrastrar o hacer clic para añadir: ${item.description}`}
            >
              <div className="flex items-start space-x-3">
                {/* Icono */}
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-md flex items-center justify-center text-lg border group-hover:border-blue-300">
                  {item.icon}
                </div>
                
                {/* Información */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  
                  {/* Tamaño por defecto */}
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
                    <span>📏</span>
                    <span>{item.defaultSize.width}x{item.defaultSize.height}px</span>
                  </div>
                </div>

                {/* Indicador de arrastrar */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay elementos */}
        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-500 text-sm">
              No se encontraron elementos
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Footer con información */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          💡 Arrastra elementos al canvas o haz clic para añadir
        </p>
      </div>
    </div>
  );
};

export default Palette; 