import { useState } from 'react';
import { products, productCategories, brands, type Product } from '../../../../data/products';

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void;
  selectedCategory?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({ 
  onProductSelect, 
  selectedCategory 
}) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategoryState, setSelectedCategory] = useState(selectedCategory || '');

  const filteredProducts = products.filter((product: Product) => {
    if (selectedCategoryState && product.category !== selectedCategoryState) return false;
    if (selectedBrand && product.brand !== selectedBrand) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <select 
          className="p-2 border rounded"
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategoryState}
        >
          <option value="">Todas las categorías</option>
          {productCategories.map((categoryName: string) => (
            <option key={categoryName} value={categoryName}>
              {categoryName}
            </option>
          ))}
        </select>
        
        <select 
          className="p-2 border rounded"
          onChange={(e) => setSelectedBrand(e.target.value)}
          value={selectedBrand}
        >
          <option value="">Todas las marcas</option>
          {brands.map((brandName: string) => (
            <option key={brandName} value={brandName}>
              {brandName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredProducts.map((product: Product) => (
          <div 
            key={product.id}
            onClick={() => onProductSelect(product)}
            className="p-4 border rounded cursor-pointer hover:bg-gray-50"
          >
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.category}</p>
            <p className="text-lg font-bold">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}; 