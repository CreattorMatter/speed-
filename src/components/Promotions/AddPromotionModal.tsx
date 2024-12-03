import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Upload, Link as LinkIcon, Edit, Power } from 'lucide-react';
import { Promotion } from '../../types/promotion';

interface AddPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (promotion: Promotion) => void;
  editingPromotion?: Promotion | null;
}

interface FormData {
  title: string;
  description: string;
  discount: string;
  startDate: string;
  endDate: string;
  category: string;
  conditions: string[];
  imageUrl: string;
  imageFile: File | null;
  imageSource: 'url' | 'file';
  bank?: string;
  cardType?: string;
  isActive: boolean;
}

export const AddPromotionModal: React.FC<AddPromotionModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  editingPromotion 
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    discount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: '',
    conditions: [''],
    imageUrl: '',
    imageFile: null,
    imageSource: 'url',
    isActive: true
  });

  useEffect(() => {
    if (editingPromotion) {
      setFormData({
        title: editingPromotion.title,
        description: editingPromotion.description,
        discount: editingPromotion.discount,
        startDate: editingPromotion.startDate,
        endDate: editingPromotion.endDate,
        category: editingPromotion.category,
        conditions: editingPromotion.conditions,
        imageUrl: editingPromotion.imageUrl,
        imageFile: null,
        imageSource: 'url',
        bank: editingPromotion.bank,
        cardType: editingPromotion.cardType,
        isActive: editingPromotion.isActive
      });
    }
  }, [editingPromotion]);

  const categories = ['Bancaria', 'Producto', 'Categoría', 'Especial'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        imageFile: file,
        imageUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleAddCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, '']
    }));
  };

  const handleConditionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? value : condition
      )
    }));
  };

  const handleRemoveCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPromotion: Promotion = {
      id: editingPromotion?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      discount: formData.discount,
      startDate: formData.startDate,
      endDate: formData.endDate,
      category: formData.category as Promotion['category'],
      conditions: formData.conditions.filter(c => c.trim() !== ''),
      imageUrl: formData.imageUrl,
      isActive: formData.isActive,
      bank: formData.bank,
      cardType: formData.cardType
    };

    onAdd(newPromotion);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl 
                     border border-white/10 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-medium text-white">
                {editingPromotion ? 'Editar Promoción' : 'Nueva Promoción'}
              </h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título y Descuento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Título</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                               text-white placeholder-white/30 focus:outline-none focus:ring-2 
                               focus:ring-rose-500/50 focus:border-transparent"
                      placeholder="Ej: 25% OFF con Tarjeta X"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Descuento</label>
                    <input
                      type="text"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                               text-white placeholder-white/30 focus:outline-none focus:ring-2 
                               focus:ring-rose-500/50 focus:border-transparent"
                      placeholder="Ej: 25%"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Descripción</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                             text-white placeholder-white/30 focus:outline-none focus:ring-2 
                             focus:ring-rose-500/50 focus:border-transparent resize-none"
                    placeholder="Describe los detalles de la promoción"
                  />
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Fecha Inicio</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                               text-white focus:outline-none focus:ring-2 
                               focus:ring-rose-500/50 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Fecha Fin</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                               text-white focus:outline-none focus:ring-2 
                               focus:ring-rose-500/50 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Categoría</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                             text-white focus:outline-none focus:ring-2 
                             focus:ring-rose-500/50 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Campos adicionales para promociones bancarias */}
                {formData.category === 'Bancaria' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Banco</label>
                      <input
                        type="text"
                        name="bank"
                        value={formData.bank || ''}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                                 text-white placeholder-white/30 focus:outline-none focus:ring-2 
                                 focus:ring-rose-500/50 focus:border-transparent"
                        placeholder="Nombre del banco"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Tipo de Tarjeta</label>
                      <input
                        type="text"
                        name="cardType"
                        value={formData.cardType || ''}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                                 text-white placeholder-white/30 focus:outline-none focus:ring-2 
                                 focus:ring-rose-500/50 focus:border-transparent"
                        placeholder="Ej: Todas las tarjetas"
                      />
                    </div>
                  </div>
                )}

                {/* Condiciones */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-white/80">Condiciones</label>
                    <button
                      type="button"
                      onClick={handleAddCondition}
                      className="text-rose-400 hover:text-rose-300 text-sm"
                    >
                      + Agregar condición
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.conditions.map((condition, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={condition}
                          onChange={(e) => handleConditionChange(index, e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 
                                   text-white placeholder-white/30 focus:outline-none focus:ring-2 
                                   focus:ring-rose-500/50 focus:border-transparent"
                          placeholder="Ej: Tope de reintegro $2000"
                        />
                        {formData.conditions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCondition(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Imagen */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-white/80">Imagen</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageSource: 'url' }))}
                      className={`flex-1 p-4 rounded-lg border ${
                        formData.imageSource === 'url'
                          ? 'border-rose-500 bg-rose-500/10'
                          : 'border-white/10 bg-white/5'
                      } transition-colors`}
                    >
                      <LinkIcon className="w-6 h-6 text-white mx-auto mb-2" />
                      <p className="text-sm text-white">URL de imagen</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageSource: 'file' }))}
                      className={`flex-1 p-4 rounded-lg border ${
                        formData.imageSource === 'file'
                          ? 'border-rose-500 bg-rose-500/10'
                          : 'border-white/10 bg-white/5'
                      } transition-colors`}
                    >
                      <Upload className="w-6 h-6 text-white mx-auto mb-2" />
                      <p className="text-sm text-white">Subir imagen</p>
                    </button>
                  </div>

                  {formData.imageSource === 'url' ? (
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                               text-white placeholder-white/30 focus:outline-none focus:ring-2 
                               focus:ring-rose-500/50 focus:border-transparent"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label className="w-full flex flex-col items-center px-4 py-6 bg-white/5 
                                    border border-white/10 border-dashed rounded-lg cursor-pointer 
                                    hover:bg-white/10">
                        <Upload className="w-8 h-8 text-white/60" />
                        <span className="mt-2 text-sm text-white/60">
                          {formData.imageFile ? formData.imageFile.name : 'Seleccionar archivo'}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageFileChange}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Estado */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-rose-500 
                             focus:ring-rose-500/50"
                  />
                  <label className="text-sm text-white/80">Promoción activa</label>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-white/60 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 
                             text-white rounded-lg hover:from-rose-600 hover:to-pink-600 
                             focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  >
                    {editingPromotion ? 'Guardar Cambios' : 'Crear Promoción'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 