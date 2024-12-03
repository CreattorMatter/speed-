import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Link as LinkIcon } from 'lucide-react';
import { products } from '../../data/products';

interface ManualFormProps {
  onSubmit: (product: any) => void;
  onBack: () => void;
}

interface FormData {
  sku: string;
  name: string;
  price: string;
  category: string;
  newCategory: string;
  imageUrl: string;
  imageFile: File | null;
  imageSource: 'url' | 'file';
}

export function ManualForm({ onSubmit, onBack }: ManualFormProps) {
  const [formData, setFormData] = useState<FormData>({
    sku: '',
    name: '',
    price: '',
    category: '',
    newCategory: '',
    imageUrl: '',
    imageFile: null,
    imageSource: 'url'
  });

  // Obtener categorías únicas existentes
  const existingCategories = Array.from(new Set(products.map(p => p.category))).sort();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImageUrl = formData.imageUrl;
    if (formData.imageSource === 'file' && formData.imageFile) {
      finalImageUrl = URL.createObjectURL(formData.imageFile);
    }

    const newProduct = {
      id: Date.now().toString(),
      sku: formData.sku,
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category === 'new' ? formData.newCategory : formData.category,
      imageUrl: finalImageUrl
    };

    onSubmit(newProduct);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-white/60">
        <button onClick={onBack} className="hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span>Volver a opciones</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SKU y Nombre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Ej: PRD-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Nombre del Producto</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                       text-white placeholder-white/30 focus:outline-none focus:ring-2 
                       focus:ring-purple-500/50 focus:border-transparent"
              placeholder="Nombre del producto"
            />
          </div>
        </div>

        {/* Precio y Categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="0.00"
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
              <option value="">Seleccionar categoría</option>
              {existingCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="new">+ Agregar nueva categoría</option>
            </select>
          </div>
        </div>

        {/* Nueva categoría si se selecciona */}
        {formData.category === 'new' && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Nueva Categoría</label>
            <input
              type="text"
              name="newCategory"
              value={formData.newCategory}
              onChange={handleInputChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 
                       text-white placeholder-white/30 focus:outline-none focus:ring-2 
                       focus:ring-purple-500/50 focus:border-transparent"
              placeholder="Nombre de la nueva categoría"
            />
          </div>
        )}

        {/* Imagen */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-white/80">Imagen del Producto</label>
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

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-white/60 hover:text-white"
          >
            Cancelar
          </button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 
                     text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            Guardar Producto
          </motion.button>
        </div>
      </form>
    </div>
  );
} 