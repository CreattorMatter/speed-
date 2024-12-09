import React from 'react';
import { X } from 'lucide-react';
import { Block, PaperFormat } from '../../types/builder';
import { renderBlockContent } from '../../utils/blockRenderer';
import { Company } from '../../data/companies';
import { Promotion } from '../../types/promotion';

interface PreviewProps {
  blocks: Block[];
  isOpen: boolean;
  onClose: () => void;
  paperFormat: PaperFormat;
  isLandscape: boolean;
  company: Company | null;
  promotion: Promotion | null;
  showPoints: boolean;
  showOrigin: boolean;
  showBarcode: boolean;
}

export default function Preview({ blocks, isOpen, onClose, paperFormat, isLandscape, company, promotion, showPoints, showOrigin, showBarcode }: PreviewProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gray-100 rounded-lg shadow-2xl p-8 relative max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div 
          className="mt-16 bg-white shadow-xl mx-auto relative"
          style={{
            width: '1123px', // A4 horizontal width at 96 DPI
            height: '794px',  // A4 horizontal height at 96 DPI
            transformOrigin: 'top center',
          }}
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              className="absolute"
              style={{
                left: block.position.x,
                top: block.position.y,
                width: block.size?.width,
                height: block.size?.height,
              }}
            >
              {renderBlockContent({
                block,
                onImageUpload: () => {}, // Vista previa no permite subir imágenes
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 