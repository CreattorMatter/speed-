import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
  Search, Grid, Layers, Clock, ChevronDown, ChevronRight, Plus,
  Type, Image, Tag, CreditCard, Percent, Gift, MapPin, 
  Calendar, Users, Star, Package, Truck, Phone, Mail,
  Building, Timer, Ticket, Trophy, Zap, ShoppingBag,
  Target, AlertCircle, Crown, Heart
} from 'lucide-react';

interface AdvancedSidebarProps {
  onAddBlock: (blockType: string) => void;
}

// Componente Draggable Element
interface DraggableElementProps {
  element: any;
  categoryColor: string;
  onAddBlock: (blockType: string) => void;
}

const DraggableElement: React.FC<DraggableElementProps> = ({ element, categoryColor, onAddBlock }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `tool-${element.id}`,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const ElementIcon = element.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-${categoryColor}-300 hover:bg-${categoryColor}-50 transition-all group text-left cursor-grab active:cursor-grabbing ${isDragging ? 'z-50' : ''}`}
      onClick={() => onAddBlock(element.id)}
    >
      <div className={`w-10 h-10 bg-${categoryColor}-100 rounded-lg flex items-center justify-center group-hover:bg-${categoryColor}-200 transition-colors flex-shrink-0`}>
        <ElementIcon className={`w-5 h-5 text-${categoryColor}-600`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 text-sm">{element.label}</div>
        <div className="text-xs text-gray-500 truncate">{element.description}</div>
        <div className="text-xs text-blue-600 font-medium mt-1">{element.usage}</div>
      </div>
      <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
    </div>
  );
};

// Elementos avanzados con contenido real y funcional para POs
const elementCategories = {
  'Elementos Básicos': {
    color: 'blue',
    icon: Grid,
    elements: [
      { 
        id: 'header', 
        label: 'Header/Banner', 
        icon: Image, 
        description: 'Imagen de encabezado o banner',
        usage: 'Logo Easy, banner promocional, imagen de cabecera',
        content: { placeholder: 'Sube tu logo o banner aquí' }
      },
      { 
        id: 'title', 
        label: 'Título', 
        icon: Type, 
        description: 'Título promocional destacado',
        usage: 'Para títulos de promociones, nombres de productos destacados',
        content: { text: 'SÚPER OFERTA', fontSize: 32, fontWeight: 'bold', color: '#2563eb' }
      },
      { 
        id: 'footer', 
        label: 'Footer', 
        icon: Type, 
        description: 'Pie de página con info legal',
        usage: 'Condiciones, fechas de vigencia, términos legales',
        content: { text: 'Válido hasta agotar stock. No acumulable con otras promociones.', fontSize: 10, color: '#6b7280' }
      },
      { 
        id: 'image', 
        label: 'Imagen Producto', 
        icon: Package, 
        description: 'Imagen del producto principal',
        usage: 'Foto del producto, imagen promocional del artículo',
        content: { placeholder: 'Arrastra imagen del producto aquí' }
      },
      { 
        id: 'logo', 
        label: 'Logo Marca', 
        icon: Crown, 
        description: 'Logo de marca o proveedor',
        usage: 'Logo del fabricante, sello de calidad, marca del producto',
        content: { placeholder: 'Sube logo de marca aquí' }
      }
    ]
  },
  'Precios y Finanzas': {
    color: 'green',
    icon: CreditCard,
    elements: [
      { 
        id: 'price-final', 
        label: 'Precio Contado', 
        icon: Tag, 
        description: 'Precio final de contado',
        usage: 'Precio destacado, oferta principal, precio más bajo',
        content: { text: '$49.990', fontSize: 36, fontWeight: 'bold', color: '#dc2626' }
      },
      { 
        id: 'price-before', 
        label: 'Precio Antes', 
        icon: Tag, 
        description: 'Precio anterior tachado',
        usage: 'Mostrar ahorro, precio original antes del descuento',
        content: { text: '$89.990', fontSize: 18, textDecoration: 'line-through', color: '#6b7280' }
      },
      { 
        id: 'installments', 
        label: 'Cuotas', 
        icon: CreditCard, 
        description: 'Opciones de financiamiento',
        usage: 'Cuotas sin interés, planes de pago, facilidades',
        content: { text: '12 CUOTAS SIN INTERÉS\nde $4.166', fontSize: 14, color: '#059669' }
      },
      { 
        id: 'discount', 
        label: 'Descuento', 
        icon: Percent, 
        description: 'Porcentaje de descuento',
        usage: 'Destacar ahorro, promoción temporal, liquidación',
        content: { text: '45% OFF', fontSize: 24, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#dc2626' }
      },
      { 
        id: 'savings', 
        label: 'Ahorro', 
        icon: Target, 
        description: 'Dinero que se ahorra',
        usage: 'Mostrar ahorro en pesos, beneficio económico',
        content: { text: 'AHORRAS $40.000', fontSize: 16, fontWeight: 'bold', color: '#059669' }
      }
    ]
  },
  'Información Producto': {
    color: 'purple',
    icon: Package,
    elements: [
      { 
        id: 'sku', 
        label: 'SKU', 
        icon: Tag, 
        description: 'Código interno del producto',
        usage: 'Identificación, trazabilidad, código de barras',
        content: { text: 'COD: EZ-HDW-2024-001', fontSize: 10, fontFamily: 'monospace', color: '#6b7280' }
      },
      { 
        id: 'product-name', 
        label: 'Nombre', 
        icon: Type, 
        description: 'Nombre comercial del producto',
        usage: 'Título del producto, descripción comercial',
        content: { text: 'Taladro Percutor Dewalt 850W', fontSize: 18, fontWeight: 'semibold', color: '#1f2937' }
      },
      { 
        id: 'brand', 
        label: 'Marca', 
        icon: Crown, 
        description: 'Marca del fabricante',
        usage: 'Identificar marca, prestigio del fabricante',
        content: { text: 'DEWALT', fontSize: 14, fontWeight: 'bold', color: '#fbbf24' }
      },
      { 
        id: 'category', 
        label: 'Categoría', 
        icon: Grid, 
        description: 'Sección o categoría',
        usage: 'Ubicación en tienda, tipo de producto',
        content: { text: 'Herramientas Eléctricas', fontSize: 12, color: '#6366f1' }
      },
      { 
        id: 'stock', 
        label: 'Stock', 
        icon: Package, 
        description: 'Disponibilidad del producto',
        usage: 'Urgencia de compra, disponibilidad limitada',
        content: { text: '¡Solo quedan 3 unidades!', fontSize: 12, fontWeight: 'bold', color: '#dc2626' }
      }
    ]
  },
  'Promociones y Ofertas': {
    color: 'red',
    icon: Gift,
    elements: [
      { 
        id: 'promotion', 
        label: 'Promoción', 
        icon: Gift, 
        description: 'Texto promocional destacado',
        usage: '2x1, 3x2, promociones especiales, combos',
        content: { text: '2X1 EN TODA\nLA LÍNEA', fontSize: 20, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#dc2626' }
      },
      { 
        id: 'badge', 
        label: 'Badge', 
        icon: Star, 
        description: 'Etiqueta promocional',
        usage: 'Nuevo, oferta, liquidación, exclusivo',
        content: { text: 'NUEVO', fontSize: 12, fontWeight: 'bold', color: '#ffffff', backgroundColor: '#059669' }
      },
      { 
        id: 'gift', 
        label: 'Regalo', 
        icon: Heart, 
        description: 'Regalo incluido',
        usage: 'Obsequio, bonus, regalo por compra',
        content: { text: 'REGALO:\nSet de brocas', fontSize: 14, fontWeight: 'semibold', color: '#7c3aed' }
      },
      { 
        id: 'combo', 
        label: 'Combo', 
        icon: ShoppingBag, 
        description: 'Oferta de productos combinados',
        usage: 'Kit completo, pack ahorro, productos complementarios',
        content: { text: 'KIT COMPLETO\n+ Maletín', fontSize: 14, fontWeight: 'bold', color: '#ea580c' }
      }
    ]
  },
  'Tiempo y Vigencia': {
    color: 'orange',
    icon: Calendar,
    elements: [
      { 
        id: 'validity', 
        label: 'Vigencia', 
        icon: Calendar, 
        description: 'Fechas de la promoción',
        usage: 'Hasta cuando dura la oferta, fechas límite',
        content: { text: 'Válido del 15 al 30 de Diciembre', fontSize: 12, color: '#dc2626' }
      },
      { 
        id: 'countdown', 
        label: 'Contador', 
        icon: Timer, 
        description: 'Tiempo restante de oferta',
        usage: 'Urgencia, oferta por tiempo limitado, flash sale',
        content: { text: '⏰ ¡Solo por 48 horas!', fontSize: 14, fontWeight: 'bold', color: '#dc2626' }
      },
      { 
        id: 'period', 
        label: 'Período', 
        icon: Clock, 
        description: 'Horarios específicos',
        usage: 'Happy hour, horarios especiales, días específicos',
        content: { text: 'Lunes a Viernes\n9:00 a 18:00 hs', fontSize: 12, color: '#6b7280' }
      }
    ]
  },
  'Ubicación y Contacto': {
    color: 'indigo',
    icon: MapPin,
    elements: [
      { 
        id: 'store', 
        label: 'Sucursal', 
        icon: Building, 
        description: 'Ubicación de la tienda',
        usage: 'Dirección específica, sucursal participante',
        content: { text: 'Easy Maipú\nAv. Maipú 1234', fontSize: 12, color: '#4338ca' }
      },
      { 
        id: 'contact', 
        label: 'Contacto', 
        icon: Phone, 
        description: 'Información de contacto',
        usage: 'Teléfono, WhatsApp, consultas',
        content: { text: '📞 0810-EASY-123\n💬 WhatsApp disponible', fontSize: 10, color: '#6b7280' }
      },
      { 
        id: 'schedule', 
        label: 'Horarios', 
        icon: Clock, 
        description: 'Horarios de atención',
        usage: 'Cuando está abierto, horarios especiales',
        content: { text: 'Lun a Dom: 8:00 a 22:00\nFeriados: 10:00 a 20:00', fontSize: 10, color: '#6b7280' }
      }
    ]
  },
  'Exclusivos Easy': {
    color: 'yellow',
    icon: Star,
    elements: [
      { 
        id: 'club-easy', 
        label: 'Club Easy', 
        icon: Users, 
        description: 'Beneficios para socios',
        usage: 'Descuentos adicionales, precios especiales',
        content: { text: 'PRECIO CLUB EASY\n$44.990', fontSize: 16, fontWeight: 'bold', color: '#dc2626' }
      },
      { 
        id: 'cencopay', 
        label: 'Cencopay', 
        icon: CreditCard, 
        description: 'Beneficios con Cencopay',
        usage: 'Descuentos adicionales, cashback',
        content: { text: '15% EXTRA\ncon Cencopay', fontSize: 14, fontWeight: 'bold', color: '#059669' }
      },
      { 
        id: 'easy-points', 
        label: 'Puntos Easy', 
        icon: Star, 
        description: 'Programa de puntos',
        usage: 'Acumula puntos, canjea beneficios',
        content: { text: 'Acumulas 2.500 puntos\nCanjea por $500', fontSize: 12, color: '#7c3aed' }
      }
    ]
  }
};

export const AdvancedSidebar: React.FC<AdvancedSidebarProps> = ({ onAddBlock }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Elementos Básicos', 'Precios y Finanzas'])
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'elements' | 'templates' | 'history'>('elements');

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = Object.entries(elementCategories).reduce((acc, [categoryName, categoryData]) => {
    if (searchTerm) {
      const filteredElements = categoryData.elements.filter(element =>
        element.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        element.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredElements.length > 0) {
        acc[categoryName] = { ...categoryData, elements: filteredElements };
      }
    } else {
      acc[categoryName] = categoryData;
    }
    return acc;
  }, {} as typeof elementCategories);

  const renderElementsTab = () => (
    <div className="space-y-3">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar elementos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Categorías */}
      {Object.entries(filteredCategories).map(([categoryName, categoryData]) => {
        const CategoryIcon = categoryData.icon;
        const isExpanded = expandedCategories.has(categoryName);

        return (
          <div key={categoryName} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(categoryName)}
              className={`w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left`}
            >
              <div className="flex items-center gap-3">
                <CategoryIcon className={`w-5 h-5 text-${categoryData.color}-600`} />
                <div>
                  <span className="font-medium text-gray-900">{categoryName}</span>
                  <div className="text-xs text-gray-500">{categoryData.elements.length} elementos</div>
                </div>
              </div>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isExpanded && (
              <div className="p-2 bg-white">
                <div className="grid grid-cols-1 gap-2">
                  {categoryData.elements.map((element) => {
                    const ElementIcon = element.icon;
                    return (
                      <DraggableElement
                        key={element.id}
                        element={element}
                        categoryColor={categoryData.color}
                        onAddBlock={onAddBlock}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="p-4 text-center">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Layers className="w-8 h-8 text-purple-600" />
      </div>
      <h3 className="font-medium text-gray-900 mb-2">Plantillas Guardadas</h3>
      <p className="text-sm text-gray-500 mb-4">
        Accede a plantillas predefinidas de promociones
      </p>
      <div className="space-y-2">
        <div className="p-3 bg-gray-50 rounded-lg text-left">
          <div className="font-medium text-sm">Superprecio Estándar</div>
          <div className="text-xs text-gray-500">Última modificación: Hoy</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-left">
          <div className="font-medium text-sm">Feria de Descuentos</div>
          <div className="text-xs text-gray-500">Última modificación: Ayer</div>
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="p-4 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="font-medium text-gray-900 mb-2">Historial</h3>
      <p className="text-sm text-gray-500 mb-4">
        Revisa los cambios realizados
      </p>
      <div className="space-y-2">
        <div className="p-3 bg-gray-50 rounded-lg text-left">
          <div className="font-medium text-sm">Elemento Precio agregado</div>
          <div className="text-xs text-gray-500">Hace 2 minutos</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-left">
          <div className="font-medium text-sm">Imagen redimensionada</div>
          <div className="text-xs text-gray-500">Hace 5 minutos</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Constructor</h2>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'elements', label: 'Elementos', icon: Grid },
            { id: 'templates', label: 'Plantillas', icon: Layers },
            { id: 'history', label: 'Historial', icon: Clock }
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TabIcon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'elements' && renderElementsTab()}
        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2">
            💡 <strong>Tip:</strong> Arrastra elementos al canvas o haz clic para agregar
          </div>
          <div className="text-xs text-gray-400">
            {Object.values(elementCategories).reduce((total, cat) => total + cat.elements.length, 0)} elementos disponibles
          </div>
        </div>
      </div>
    </div>
  );
}; 