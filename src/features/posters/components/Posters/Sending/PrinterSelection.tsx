import React from 'react';

interface PrinterOption {
  id: string;
  name: string;
  type: string;
  formats: string[];
  status: string;
  icon: React.ReactNode;
}

interface PrinterSelectionProps {
  printers: PrinterOption[];
  selectedPrinter: string;
  onPrinterSelect: (printerId: string) => void;
}

export const PrinterSelection: React.FC<PrinterSelectionProps> = ({
  printers,
  selectedPrinter,
  onPrinterSelect
}) => {
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-900">
        Seleccionar Impresora
      </label>

      <div className="grid grid-cols-1 gap-3">
        {printers.map((printer) => (
          <div
            key={printer.id}
            className={`
              p-4 border rounded-lg cursor-pointer transition-all
              ${selectedPrinter === printer.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
              }
              ${printer.status !== 'Disponible' ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => {
              if (printer.status === 'Disponible') {
                onPrinterSelect(printer.id);
              }
            }}
          >
            <div className="flex items-center gap-3">
              {printer.icon}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{printer.name}</div>
                <div className="text-sm text-gray-600">
                  Formatos: {printer.formats.join(', ')}
                </div>
                <div className={`text-xs ${
                  printer.status === 'Disponible' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {printer.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 