import React, { useState, useCallback } from 'react';
import { ExcelService, ExcelData } from '../services/excelService';
import { toast } from 'react-hot-toast';

export const ExcelReader: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ExcelService.isValidExcelFile(file)) {
      toast.error('Por favor, selecciona un archivo Excel válido');
      return;
    }

    try {
      setIsLoading(true);
      const sheetNames = await ExcelService.getSheetNames(file);
      setAvailableSheets(sheetNames);
      
      if (sheetNames.length > 0) {
        setSelectedSheet(sheetNames[0]);
        const data = await ExcelService.readSpecificSheet(file, sheetNames[0]);
        setExcelData(data);
      }
    } catch (error) {
      toast.error('Error al leer el archivo Excel');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSheetChange = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sheetName = event.target.value;
    setSelectedSheet(sheetName);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (!fileInput?.files?.[0]) return;

    try {
      setIsLoading(true);
      const data = await ExcelService.readSpecificSheet(fileInput.files[0], sheetName);
      setExcelData(data);
    } catch (error) {
      toast.error('Error al cambiar de hoja');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExport = useCallback(() => {
    if (!excelData?.rows.length) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      ExcelService.downloadExcel(excelData.rows, 'export.xlsx');
      toast.success('Archivo exportado correctamente');
    } catch (error) {
      toast.error('Error al exportar el archivo');
      console.error(error);
    }
  }, [excelData]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
      </div>

      {availableSheets.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Hoja
          </label>
          <select
            value={selectedSheet}
            onChange={handleSheetChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {availableSheets.map((sheet) => (
              <option key={sheet} value={sheet}>
                {sheet}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : excelData ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {excelData.headers.map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {excelData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {excelData.headers.map((header) => (
                    <td
                      key={`${rowIndex}-${header}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {excelData && (
        <div className="mt-4">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Exportar Excel
          </button>
        </div>
      )}
    </div>
  );
}; 