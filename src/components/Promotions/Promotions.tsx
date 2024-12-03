import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Calendar, Tag, Filter, Search, X, CheckSquare, Square, FileText, Trash2, Edit, Power } from 'lucide-react';
import { Promotion } from '../../types/promotion';
import { AddPromotionModal } from './AddPromotionModal';

interface PromotionsProps {
  onBack: () => void;
}

// Datos de ejemplo basados en Disco
const currentPromotions: Promotion[] = [
  {
    id: '1',
    title: 'American Express 25% OFF',
    description: 'Comprá cuando quieras y programá tu entrega los días Jueves.',
    discount: '25%',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    imageUrl: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Tope de reintegro $2000', 'Válido solo los jueves'],
    isActive: true,
    bank: 'American Express',
    cardType: 'Todas las tarjetas'
  },
  {
    id: '2',
    title: 'Hasta 40% OFF en Especiales de la semana',
    description: 'Descuentos especiales en productos seleccionados',
    discount: 'Hasta 40%',
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Válido hasta agotar stock', 'En productos seleccionados'],
    isActive: true
  },
  {
    id: '3',
    title: 'Tarjeta Cencosud 20% OFF',
    description: 'Realizá tus compras los días Miércoles',
    discount: '20%',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Tope de reintegro $1500', 'Válido solo los miércoles'],
    isActive: true,
    bank: 'Cencosud',
    cardType: 'Tarjeta Cencosud'
  },
  {
    id: '4',
    title: '2do al 70% en Almacén, Bebidas y más',
    description: 'En la segunda unidad de productos seleccionados',
    discount: '70%',
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    imageUrl: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=500&auto=format&fit=crop&q=60',
    category: 'Categoría',
    conditions: ['En la segunda unidad', 'Productos seleccionados'],
    isActive: true
  },
  // Nuevas promociones de Disco
  {
    id: '5',
    title: 'Hasta 35% y Hasta 12 CSI',
    description: 'Descuentos especiales en productos seleccionados con cuotas sin interés',
    discount: '35%',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    imageUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Hasta 12 cuotas sin interés', 'En productos seleccionados'],
    isActive: true
  },
  {
    id: '6',
    title: 'Santander 30% OFF',
    description: 'Descuento exclusivo para clientes Santander',
    discount: '30%',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    imageUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Tope de reintegro $3000', 'Válido todos los días'],
    isActive: true,
    bank: 'Santander',
    cardType: 'Todas las tarjetas'
  },
  {
    id: '7',
    title: 'Hasta 40% OFF en Dove',
    description: 'Descuentos especiales en toda la línea Dove',
    discount: '40%',
    startDate: '2024-12-02',
    endDate: '2024-12-08',
    imageUrl: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=500&auto=format&fit=crop&q=60',
    category: 'Producto',
    conditions: ['Válido hasta agotar stock', 'En productos seleccionados de la marca'],
    isActive: true
  },
  {
    id: '8',
    title: 'Especial Gaseosas',
    description: 'Descuentos en toda la línea de gaseosas',
    discount: '30%',
    startDate: '2024-12-03',
    endDate: '2024-12-05',
    imageUrl: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=500&auto=format&fit=crop&q=60',
    category: 'Producto',
    conditions: ['Válido para todas las marcas participantes', 'Máximo 6 unidades por compra'],
    isActive: true
  },
  {
    id: '9',
    title: 'Cajas Navideñas',
    description: 'Ofertas especiales en cajas navideñas',
    discount: '25%',
    startDate: '2024-12-01',
    endDate: '2024-12-24',
    imageUrl: 'https://images.unsplash.com/photo-1543934638-bd2e138430c4?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Stock limitado', 'No acumulable con otras promociones'],
    isActive: true
  },
  {
    id: '10',
    title: 'Cuota Simple - 12 y 9 Cuotas',
    description: 'Comprá con 12 y 9 cuotas con interés en productos seleccionados',
    discount: 'Cuotas',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['En productos seleccionados', 'Sujeto a aprobación crediticia'],
    isActive: true,
    bank: 'Varios',
    cardType: 'Tarjetas participantes'
  }
];

export default function Promotions({ onBack }: PromotionsProps) {
  const [promotions, setPromotions] = useState<Promotion[]>(currentPromotions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPromotions, setSelectedPromotions] = useState<Set<string>>(new Set());
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const categories = ['Todas', 'Bancaria', 'Producto', 'Categoría', 'Especial'];

  const filteredPromotions = promotions.filter(promo => {
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Si no hay término de búsqueda, solo filtramos por categoría
    if (!searchLower) {
      return !selectedCategory || selectedCategory === 'Todas' || 
             promo.category === selectedCategory;
    }

    // Búsqueda en múltiples campos
    const matchesSearch = 
      // Búsqueda en título
      promo.title.toLowerCase().includes(searchLower) ||
      // Búsqueda en descripción
      promo.description.toLowerCase().includes(searchLower) ||
      // Búsqueda en categoría
      promo.category.toLowerCase().includes(searchLower) ||
      // Búsqueda en banco (si existe)
      (promo.bank?.toLowerCase().includes(searchLower) || false) ||
      // Búsqueda en tipo de tarjeta (si existe)
      (promo.cardType?.toLowerCase().includes(searchLower) || false) ||
      // Búsqueda en condiciones
      promo.conditions.some(condition => 
        condition.toLowerCase().includes(searchLower)
      );

    // Aplicar filtro de categoría si está seleccionada
    const matchesCategory = !selectedCategory || selectedCategory === 'Todas' || 
                          promo.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Función para manejar la selección de promociones
  const handleSelect = (promotionId: string) => {
    setSelectedPromotions(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(promotionId)) {
        newSelection.delete(promotionId);
      } else {
        newSelection.add(promotionId);
      }
      return newSelection;
    });
  };

  // Función para eliminar promociones seleccionadas
  const handleDeleteSelected = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedPromotions.size} promociones?`)) {
      setPromotions(prev => 
        prev.filter(promotion => !selectedPromotions.has(promotion.id))
      );
      setSelectedPromotions(new Set());
    }
  };

  // Función para exportar promociones seleccionadas a CSV
  const handleExportCSV = () => {
    const selectedPromotionsData = filteredPromotions.filter(p => selectedPromotions.has(p.id));
    const csv = [
      // Encabezados
      ['ID', 'Título', 'Descripción', 'Descuento', 'Fecha Inicio', 'Fecha Fin', 'Categoría', 'Estado', 'Banco', 'Tipo Tarjeta', 'Condiciones'].join(','),
      // Datos
      ...selectedPromotionsData.map(p => [
        p.id,
        `"${p.title}"`,
        `"${p.description}"`,
        p.discount,
        p.startDate,
        p.endDate,
        p.category,
        p.isActive ? 'Activa' : 'Inactiva',
        p.bank || '',
        p.cardType || '',
        `"${p.conditions.join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `promociones_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Función para activar/desactivar promociones
  const handleToggleActive = (promotionId: string) => {
    setPromotions(prev => prev.map(promo => 
      promo.id === promotionId 
        ? { ...promo, isActive: !promo.isActive }
        : promo
    ));
  };

  // Función para actualizar una promoción
  const handleUpdatePromotion = (updatedPromotion: Promotion) => {
    setPromotions(prev => prev.map(promo => 
      promo.id === updatedPromotion.id ? updatedPromotion : promo
    ));
    setEditingPromotion(null);
  };

  // Función para seleccionar/deseleccionar todas las promociones
  const handleSelectAll = () => {
    if (selectedPromotions.size === filteredPromotions.length) {
      setSelectedPromotions(new Set());
    } else {
      setSelectedPromotions(new Set(filteredPromotions.map(p => p.id)));
    }
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-rose-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Volver al inicio</span>
            </motion.button>

            <span className="absolute left-1/2 -translate-x-1/2 text-white font-light text-2xl tracking-tight">
              Speed<span className="font-medium">+</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, categoría, banco o descripción..."
                className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 
                         text-white placeholder-white/50 focus:outline-none focus:ring-2 
                         focus:ring-rose-500/50 transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-white/50" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="absolute -bottom-6 left-0 text-xs text-white/40">
                Busca por nombre, categoría, banco, tarjeta o descripción
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg 
                         hover:bg-white/20 transition-colors duration-200"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {selectedCategory || 'Filtrar por Categoría'}
                </span>
              </motion.button>

              {/* Dropdown de categorías */}
              {showCategoryFilter && (
                <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-lg border 
                              border-white/20 rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setShowCategoryFilter(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                    >
                      Todas las categorías
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryFilter(false);
                        }}
                        className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500
                       text-white rounded-lg hover:from-rose-600 hover:to-pink-600 shadow-lg
                       hover:shadow-rose-500/25 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Promoción</span>
            </motion.button>
          </div>
        </div>

        {/* Contador de resultados y filtro activo */}
        <div className="flex items-center gap-4 mb-6 text-white/60">
          <span>
            {filteredPromotions.length === promotions.length
              ? `${promotions.length} promociones`
              : `${filteredPromotions.length} de ${promotions.length} promociones`}
          </span>
          {selectedCategory && selectedCategory !== 'Todas' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
              <span>{selectedCategory}</span>
              <button
                onClick={() => setSelectedCategory('')}
                className="hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Acciones de selección múltiple */}
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg 
                     hover:bg-white/20 transition-colors"
          >
            {selectedPromotions.size === filteredPromotions.length ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {selectedPromotions.size === 0
                ? 'Seleccionar Todas'
                : selectedPromotions.size === filteredPromotions.length
                ? 'Deseleccionar Todas'
                : `${selectedPromotions.size} seleccionadas`}
            </span>
          </motion.button>

          {selectedPromotions.size > 0 && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 
                         rounded-lg hover:bg-emerald-500/20"
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 
                         rounded-lg hover:bg-red-500/20"
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden sm:inline">Eliminar</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promotion) => (
            <motion.div
              key={promotion.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/10 backdrop-blur-md rounded-lg border 
                        overflow-hidden group relative
                        ${selectedPromotions.has(promotion.id) 
                          ? 'border-rose-500' 
                          : 'border-white/20'}`}
            >
              {/* Checkbox de selección */}
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={() => handleSelect(promotion.id)}
                  className="p-1 bg-black/50 rounded-lg backdrop-blur-sm"
                >
                  {selectedPromotions.has(promotion.id) ? (
                    <CheckSquare className="w-5 h-5 text-rose-400" />
                  ) : (
                    <Square className="w-5 h-5 text-white/60" />
                  )}
                </button>
                <button
                  onClick={() => handleToggleActive(promotion.id)}
                  className={`p-1 rounded-lg backdrop-blur-sm ${
                    promotion.isActive 
                      ? 'bg-emerald-500/50 hover:bg-emerald-500/70' 
                      : 'bg-red-500/50 hover:bg-red-500/70'
                  }`}
                  title={promotion.isActive ? 'Desactivar promoción' : 'Activar promoción'}
                >
                  <Power className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setEditingPromotion(promotion)}
                  className="p-1 bg-black/50 rounded-lg backdrop-blur-sm hover:bg-white/10"
                  title="Editar promoción"
                >
                  <Edit className="w-5 h-5 text-white/60 hover:text-white" />
                </button>
              </div>

              <div className="aspect-video relative overflow-hidden">
                <img
                  src={promotion.imageUrl}
                  alt={promotion.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-2 py-1 bg-rose-500 text-white text-sm rounded-full">
                    {promotion.discount} OFF
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-white">{promotion.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    promotion.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {promotion.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <p className="text-white/60 text-sm mb-4">{promotion.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Hasta: {new Date(promotion.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Tag className="w-4 h-4" />
                    <span>{promotion.category}</span>
                  </div>
                </div>

                {promotion.conditions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-white/80 mb-2">Condiciones:</h4>
                    <ul className="text-sm text-white/60 space-y-1">
                      {promotion.conditions.map((condition, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-white/60 rounded-full" />
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal de nueva promoción */}
      <AddPromotionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(newPromotion) => {
          setPromotions(prev => [...prev, newPromotion]);
          setShowAddModal(false);
        }}
      />

      <AddPromotionModal
        isOpen={!!editingPromotion}
        onClose={() => setEditingPromotion(null)}
        onAdd={handleUpdatePromotion}
        editingPromotion={editingPromotion}
      />
    </div>
  );
} 