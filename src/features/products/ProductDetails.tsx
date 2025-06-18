import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Upload, Link as LinkIcon } from 'lucide-react';
import { Product } from '../../types';

interface ProductDetailsProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: string) => void;
  categories: string[];
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  categories
}) => {
  const [formData, setFormData] = useState({
    ...product,
    newCategory: '',
    imageSource: 'url' as 'url' | 'file',
    imageFile: null as File | null
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      category: formData.category === 'new' ? formData.newCategory : formData.category,
      price: parseFloat(formData.price.toString())
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      onDelete(product.id);
      onClose();
    }
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
            onClick={e => e.stopPropagation()}
            className="relative bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl 
                     border border-white/10 overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-medium text-white">
                {isEditing ? 'Editar Producto' : 'Detalles del Producto'}
              </h2>
              <div className="flex items-center gap-4">
                {!isEditing && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                    >
                      Editar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">SKU</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                                text-white placeholder-white/30 focus:outline-none focus:ring-2 
                                focus:ring-purple-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Nombre</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                                text-white placeholder-white/30 focus:outline-none focus:ring-2 
                                focus:ring-purple-500/50 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Precio</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        min="0"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                                text-white placeholder-white/30 focus:outline-none focus:ring-2 
                                focus:ring-purple-500/50 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Categoría</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                                text-white focus:outline-none focus:ring-2 
                                focus:ring-purple-500/50 focus:border-transparent"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="new">+ Agregar nueva categoría</option>
                      </select>
                    </div>
                  </div>

                  {formData.category === 'new' && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Nueva Categoría
                      </label>
                      <input
                        type="text"
                        name="newCategory"
                        value={formData.newCategory}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                                text-white placeholder-white/30 focus:outline-none focus:ring-2 
                                focus:ring-purple-500/50 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-white/80">Imagen</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageSource: 'url' }))}
                        className={`flex-1 p-4 rounded-lg border ${
                          formData.imageSource === 'url'
                            ? 'border-purple-500 bg-purple-500/10'
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
                            ? 'border-purple-500 bg-purple-500/10'
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
                                focus:ring-purple-500/50 focus:border-transparent"
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

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-white/60 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 
                              to-indigo-500 text-white rounded-lg hover:from-purple-600 
                              hover:to-indigo-600"
                    >
                      <Save className="w-4 h-4" />
                      Guardar Cambios
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-1">SKU</h3>
                      <p className="text-white">{product.sku}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-1">Nombre</h3>
                      <p className="text-white">{product.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-1">Precio</h3>
                      <p className="text-white">${product.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white/60 mb-1">Categoría</h3>
                      <p className="text-white">{product.category}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 