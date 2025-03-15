import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Download, Loader2, Settings2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportOptions {
  format: 'PNG' | 'PDF' | 'SVG' | 'HTML';
  quality: 'draft' | 'standard' | 'high';
  scale: number;
  includeLayers: boolean;
  includeGuides: boolean;
  cropMarks: boolean;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export function ExportModal({ isOpen, onClose, canvasRef }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'PNG',
    quality: 'standard',
    scale: 2,
    includeLayers: true,
    includeGuides: false,
    cropMarks: false,
  });

  const qualityFactors = {
    draft: 1,
    standard: 2,
    high: 3,
  };

  const handleExport = async () => {
    if (!canvasRef.current) {
      toast.error('No se encontró el contenido para exportar');
      return;
    }

    try {
      setIsExporting(true);

      // Configuración de html2canvas
      const canvas = await html2canvas(canvasRef.current, {
        scale: qualityFactors[options.quality],
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: canvasRef.current.scrollWidth,
        windowHeight: canvasRef.current.scrollHeight,
      });

      // Convertir el canvas a una URL de datos
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      
      // Crear un elemento de enlace temporal
      const link = document.createElement('a');
      link.download = `plantilla-${Date.now()}.png`; // Nombre del archivo
      link.href = dataUrl;
      
      // Agregar el enlace al documento
      document.body.appendChild(link);
      
      // Simular clic en el enlace
      link.click();
      
      // Limpiar - remover el enlace
      document.body.removeChild(link);

      toast.success('Imagen exportada exitosamente');
      onClose();
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar la imagen');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addCropMarks = (pdf: any, width: number, height: number) => {
    const markLength = 20;
    const offset = 10;

    // Marcas de recorte en las esquinas
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(0);

    // Superior izquierda
    pdf.line(offset, offset, offset + markLength, offset);
    pdf.line(offset, offset, offset, offset + markLength);

    // Superior derecha
    pdf.line(width - offset - markLength, offset, width - offset, offset);
    pdf.line(width - offset, offset, width - offset, offset + markLength);

    // Inferior izquierda
    pdf.line(offset, height - offset, offset + markLength, height - offset);
    pdf.line(offset, height - offset - markLength, offset, height - offset);

    // Inferior derecha
    pdf.line(width - offset - markLength, height - offset, width - offset, height - offset);
    pdf.line(width - offset, height - offset - markLength, width - offset, height - offset);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !isExporting && onClose()}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg w-full max-w-md p-6">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>

          <Dialog.Title className="text-lg font-semibold mb-4">
            Exportar plantilla
          </Dialog.Title>

          <div className="space-y-4">
            {/* Calidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calidad de exportación
              </label>
              <select
                value={options.quality}
                onChange={(e) => setOptions({ ...options, quality: e.target.value as ExportOptions['quality'] })}
                className="w-full px-3 py-2 border rounded-md"
                disabled={isExporting}
              >
                <option value="draft">Borrador (1x)</option>
                <option value="standard">Estándar (2x)</option>
                <option value="high">Alta calidad (3x)</option>
              </select>
            </div>

            {/* Botón de exportar */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Exportar como PNG
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 