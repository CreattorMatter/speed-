import React, { useState } from 'react';
import { 
  Save, Eye, Download, Layers, Grid3X3, 
  AlignLeft, AlignCenter, AlignRight,
  AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter,
  Copy, Trash2, Undo, Redo, LayoutTemplate, LayoutPanelTop
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Block } from '../../types/builder';
import { ProductSelector } from './ProductSelector';
import { Product } from '../../types/product';
import { Company } from '../../data/companies';
import Select from 'react-select';

interface SelectOption<T> {
  value: string;
  label: string;
  data: T;
}

interface ToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
  templateId?: string;
  selectedBlock?: Block | null;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  onAlignBlock?: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product | null) => void;
  companies: Company[];
  selectedCompany: Company | null;
  onCompanySelect: (company: Company | null) => void;
  onAddBlock: (block: Block) => void;
}

export default function Toolbar({
  onSave,
  onPreview,
  templateId = generateTemplateId(),
  selectedBlock,
  onDuplicate,
  onDelete,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  showGrid = true,
  onToggleGrid,
  onAlignBlock,
  zoom = 1,
  onZoomChange,
  products,
  selectedProduct,
  onProductSelect,
  companies,
  selectedCompany,
  onCompanySelect,
  onAddBlock
}: ToolbarProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(templateId);
  };

  const exportFormats = [
    { id: 'png', label: 'PNG', quality: [75, 90, 100] },
    { id: 'jpg', label: 'JPG', quality: [75, 90, 100] },
    { id: 'pdf', label: 'PDF', quality: [100] }
  ];

  const handleCompanyChange = (option: SelectOption<Company> | null) => {
    onCompanySelect(option?.data || null);
  };

  const handleAddHeaderFooter = (type: 'header' | 'footer') => {
    const block: Block = {
      id: `${type}-${Date.now()}`,
      type,
      content: { },
      position: { 
        x: 50, 
        y: type === 'header' ? 50 : 600 // Footer va más abajo
      },
      size: { 
        width: 800, 
        height: type === 'header' ? 100 : 80 
      }
    };
    onAddBlock(block);
  };

  return (
    <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
      {/* Grupo izquierdo */}
      <div className="flex items-center space-x-4">
        <ProductSelector
          products={products}
          selectedProduct={selectedProduct}
          onProductSelect={onProductSelect}
        />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Save className="w-4 h-4" />
          <span>Guardar</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg 
                   hover:bg-gray-50 border border-gray-200"
        >
          <Eye className="w-4 h-4" />
          <span>Vista previa</span>
        </motion.button>

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg 
                     hover:bg-gray-50 border border-gray-200"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </motion.button>

          {showExportOptions && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg 
                          border border-gray-200 py-2 z-50">
              {exportFormats.map(format => (
                <div key={format.id} className="px-4 py-2 hover:bg-gray-50">
                  <div className="font-medium text-gray-700">{format.label}</div>
                  <div className="flex gap-2 mt-1">
                    {format.quality.map(q => (
                      <button
                        key={q}
                        className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                      >
                        {q}%
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selector de empresa */}
        <Select<SelectOption<Company>>
          value={selectedCompany ? {
            value: selectedCompany.id,
            label: selectedCompany.name,
            data: selectedCompany
          } : null}
          onChange={handleCompanyChange}
          options={companies.map(company => ({
            value: company.id,
            label: company.name,
            data: company
          }))}
          formatOptionLabel={(option: SelectOption<Company>) => (
            <div className="flex items-center gap-2">
              <img 
                src={option.data.logo} 
                alt={option.data.name}
                className="w-6 h-6 object-contain"
              />
              <span>{option.label}</span>
            </div>
          )}
          placeholder="Seleccionar empresa..."
          className="min-w-[200px]"
          classNames={{
            control: (state) => 
              `!bg-white !border-gray-200 ${state.isFocused ? '!border-indigo-500 !ring-1 !ring-indigo-500' : ''}`,
            option: (state) => 
              `!cursor-pointer ${state.isFocused ? '!bg-indigo-50' : ''} ${state.isSelected ? '!bg-indigo-100' : ''}`
          }}
        />

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddHeaderFooter('header')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg 
                     hover:bg-gray-50 border border-gray-200"
            title="Agregar encabezado"
          >
            <LayoutPanelTop className="w-4 h-4" />
            <span>Header</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddHeaderFooter('footer')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg 
                     hover:bg-gray-50 border border-gray-200"
            title="Agregar pie de página"
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Footer</span>
          </motion.button>
        </div>
      </div>

      {/* Grupo central - Herramientas de edición */}
      <div className="flex items-center space-x-4">
        {/* Historial */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg ${canUndo 
              ? 'hover:bg-gray-100 text-gray-700' 
              : 'text-gray-400 cursor-not-allowed'}`}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg ${canRedo 
              ? 'hover:bg-gray-100 text-gray-700' 
              : 'text-gray-400 cursor-not-allowed'}`}
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Separador */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Alineación */}
        {selectedBlock && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAlignBlock?.('left')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAlignBlock?.('center')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAlignBlock?.('right')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Separador */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Herramientas de visualización */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleGrid}
            className={`p-2 rounded-lg ${showGrid ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Separador */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onZoomChange?.(Math.max(0.25, zoom - 0.25))}
            className="p-1 rounded hover:bg-gray-100"
          >
            -
          </button>
          <span className="min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange?.(Math.min(4, zoom + 0.25))}
            className="p-1 rounded hover:bg-gray-100"
          >
            +
          </button>
        </div>
      </div>

      {/* Grupo derecho - ID del template */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-gray-500">ID:</span>
          <span className="font-mono text-sm text-gray-700">{templateId}</span>
          <button
            onClick={handleCopyId}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            title="Copiar ID"
          >
            <Copy className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

function generateTemplateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `TPL-${timestamp}-${randomStr}`.toUpperCase();
}