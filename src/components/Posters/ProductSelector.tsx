import { useState } from 'react';
import { products, productCategories, brands } from '../../data/products';

interface ProductSelectorProps {
  onSelectProduct: (product: Product) => void;
}

export function ProductSelector({ onSelectProduct }: ProductSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  
  const filteredProducts = products.filter(product => {
    if (selectedCategory && product.subCategory !== selectedCategory) return false;
    if (selectedBrand && product.brand !== selectedBrand) return false;
    return true;
  });

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <select 
          className="p-2 border rounded"
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
        >
          <option value="">Todas las categorías</option>
          {productCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          onChange={(e) => setSelectedBrand(e.target.value)}
          value={selectedBrand}
        >
          <option value="">Todas las marcas</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div 
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className="p-4 border rounded cursor-pointer hover:bg-gray-50"
          >
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-40 object-contain mb-2"
            />
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.brand}</p>
            <p className="text-sm text-gray-500">{product.volume}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 