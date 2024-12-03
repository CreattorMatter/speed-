import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Download, AlertCircle } from 'lucide-react';
import { Product } from '../../types/product';
import Papa, { ParseResult, ParseError } from 'papaparse';

interface BulkUploadProps {
  onSubmit: (products: Product[]) => void;
  onBack: () => void;
}

interface CSVRow {
  sku: string;
  name: string;
  price: string;
  category: string;
  imageUrl: string;
}

const sampleData = [
  {
    sku: 'PRD-001',
    name: 'Producto Ejemplo 1',
    price: '999.99',
    category: 'Categoría 1',
    imageUrl: 'https://ejemplo.com/imagen1.jpg'
  },
  {
    sku: 'PRD-002',
    name: 'Producto Ejemplo 2',
    price: '1999.99',
    category: 'Categoría 2',
    imageUrl: 'https://ejemplo.com/imagen2.jpg'
  }
];

export const BulkUpload: React.FC<BulkUploadProps> = ({ onSubmit, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<CSVRow[]>([]);

  const downloadSampleCSV = () => {
    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'productos_ejemplo.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv') {
        setError('Por favor, selecciona un archivo CSV válido');
        return;
      }
      setFile(file);
      setError('');

      Papa.parse<CSVRow>(file, {
        header: true,
        complete: (results: ParseResult<CSVRow>) => {
          setPreview(results.data.slice(0, 3));
          if (results.errors.length > 0) {
            setError('El archivo contiene errores de formato');
          }
        },
        error: (error: ParseError) => {
          setError('Error al leer el archivo: ' + error.message);
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      const results = await new Promise<CSVRow[]>((resolve, reject) => {
        Papa.parse<CSVRow>(file, {
          header: true,
          complete: (results: ParseResult<CSVRow>) => {
            if (results.errors.length > 0) {
              reject('El archivo contiene errores de formato');
              return;
            }
            resolve(results.data);
          },
          error: (error: ParseError) => reject(error.message)
        });
      });

      const products: Product[] = results.map((row, index) => ({
        id: Date.now().toString() + index,
        sku: row.sku,
        name: row.name,
        price: parseFloat(row.price),
        category: row.category,
        imageUrl: row.imageUrl
      }));

      onSubmit(products);
    } catch (error) {
      setError(error as string);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-white/60">
        <button onClick={onBack} className="hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span>Volver a opciones</span>
      </div>

      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-medium text-white mb-4">Importar productos desde CSV</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={downloadSampleCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg 
                       hover:bg-white/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar CSV de ejemplo
            </button>
            <span className="text-white/60 text-sm">
              Usa este archivo como plantilla
            </span>
          </div>

          <div className="flex items-center justify-center w-full">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white/5 
                            border border-white/10 border-dashed rounded-lg cursor-pointer 
                            hover:bg-white/10">
              <Upload className="w-8 h-8 text-white/60 mb-2" />
              <span className="text-sm text-white/60">
                {file ? file.name : 'Seleccionar archivo CSV'}
              </span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/80">Vista previa:</h4>
              <div className="bg-white/5 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-white/60">
                  <thead className="bg-white/5 text-white/80">
                    <tr>
                      {Object.keys(preview[0]).map(key => (
                        <th key={key} className="px-4 py-2 text-left">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-white/5">
                        {Object.values(row).map((value: any, j) => (
                          <td key={j} className="px-4 py-2">{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-white/40">
                Mostrando {preview.length} de {file ? 'los primeros registros' : '0 registros'}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-white/60 hover:text-white"
          >
            Cancelar
          </button>
          <motion.button
            onClick={handleSubmit}
            disabled={!file}
            whileHover={{ scale: file ? 1.02 : 1 }}
            whileTap={{ scale: file ? 0.98 : 1 }}
            className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50
                     ${file 
                       ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600' 
                       : 'bg-white/5 text-white/40 cursor-not-allowed'}`}
          >
            Importar Productos
          </motion.button>
        </div>
      </div>
    </div>
  );
}; 