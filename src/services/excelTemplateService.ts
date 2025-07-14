// =====================================
// EXCEL TEMPLATE SERVICE - SPID
// =====================================

import * as XLSX from 'xlsx';
import { ProductoReal } from '../types/product';
import { productos } from '../data/products';

export interface ExcelProductTemplate {
  sku: string;
  descripcion?: string;
  notas?: string;
}

export interface ExcelImportResult {
  success: boolean;
  matchedProducts: ProductoReal[];
  skusNotFound: string[];
  totalProcessed: number;
  errorMessage?: string;
}

/**
 * 📋 Genera y descarga un template Excel con formato para SKUs
 */
export const downloadSKUTemplate = (): void => {
  try {
    // Crear el workbook
    const workbook = XLSX.utils.book_new();
    
    // 🎯 DATOS DE EJEMPLO PARA EL TEMPLATE
    const templateData = [
      // Headers
      ['SKU', 'Descripción (Opcional)', 'Notas (Opcional)'],
      
      // Ejemplos con productos reales
      ['EJ001', 'Lavarropas Drean Next 8.14', 'Producto de ejemplo'],
      ['EJ002', 'Heladera Gafa HGF-367AFW', 'Otro producto de ejemplo'],
      ['', '', ''],
      
      // Instrucciones claras
      ['=== INSTRUCCIONES DE USO ==='],
      ['1. Complete la columna SKU con los códigos de productos que desea seleccionar'],
      ['2. Las columnas Descripción y Notas son opcionales, solo para su referencia'],
      ['3. Guarde el archivo cuando termine de completar los SKUs'],
      ['4. Vuelva a SPID y use "Importar desde Excel" para cargar sus productos'],
      ['5. Los productos se seleccionarán automáticamente según los SKUs válidos'],
      [''],
      ['=== CONSEJOS ==='],
      ['• Un SKU por fila en la columna A'],
      ['• Los SKUs deben coincidir exactamente con los del sistema'],
      ['• Puede copiar y pegar SKUs desde otras fuentes'],
      ['• Si un SKU no existe, aparecerá en el reporte de errores'],
      [''],
      ['=== EJEMPLOS DE SKUs VÁLIDOS ==='],
      ['LAV001', 'HEL002', 'COC003', 'MIC004', 'AIR005']
    ];
    
    // Crear la hoja de trabajo
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    
    // 🎨 CONFIGURAR ESTILOS Y FORMATOS
    
    // Ancho de columnas
    worksheet['!cols'] = [
      { wch: 15 }, // SKU
      { wch: 40 }, // Descripción
      { wch: 30 }  // Notas
    ];
    
    // Configurar area de impresión y rango de datos
    worksheet['!ref'] = 'A1:C20';
    
    // Agregar la hoja al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template SKUs');
    
    // 📦 GENERAR Y DESCARGAR ARCHIVO
    const fileName = `SPID_Template_SKUs_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Escribir y descargar el archivo
    XLSX.writeFile(workbook, fileName, {
      bookType: 'xlsx',
      type: 'binary'
    });
    
    console.log('✅ Template Excel generado exitosamente:', fileName);
    
  } catch (error) {
    console.error('❌ Error generando template Excel:', error);
    throw new Error('Error al generar el template Excel');
  }
};

/**
 * 📖 Procesa un archivo Excel y extrae los SKUs para buscar productos
 */
export const importProductsFromExcel = (file: File): Promise<ExcelImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Leer el archivo Excel
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Obtener la primera hoja
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, // Usar índices de fila como headers
          raw: false // Convertir todo a string
        }) as string[][];
        
        console.log('📊 Datos del Excel procesados:', jsonData);
        
        // 🔍 EXTRAER SKUs DE LA PRIMERA COLUMNA
        const extractedSKUs: string[] = [];
        
        // Iterar sobre las filas (empezar desde fila 1 para saltar header)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row[0]) {
            const skuCandidate = String(row[0]).trim().toUpperCase();
            
            // Filtrar SKUs válidos (no instrucciones ni headers)
            if (skuCandidate && 
                !skuCandidate.startsWith('===') && 
                !skuCandidate.includes('INSTRUCCIONES') &&
                !skuCandidate.includes('CONSEJOS') &&
                !skuCandidate.includes('EJEMPLOS') &&
                skuCandidate !== 'SKU' &&
                skuCandidate.length > 0) {
              extractedSKUs.push(skuCandidate);
            }
          }
        }
        
        console.log('🔍 SKUs extraídos del Excel:', extractedSKUs);
        
        // 🎯 BUSCAR PRODUCTOS COINCIDENTES
        const matchedProducts: ProductoReal[] = [];
        const skusNotFound: string[] = [];
        
        extractedSKUs.forEach(sku => {
          const foundProduct = productos.find(p => 
            String(p.sku || '').toUpperCase() === sku.toUpperCase()
          );
          
          if (foundProduct) {
            matchedProducts.push(foundProduct);
          } else {
            skusNotFound.push(sku);
          }
        });
        
        // 📊 PREPARAR RESULTADO
        const result: ExcelImportResult = {
          success: true,
          matchedProducts,
          skusNotFound,
          totalProcessed: extractedSKUs.length,
          errorMessage: undefined
        };
        
        console.log('✅ Resultado de importación:', result);
        resolve(result);
        
      } catch (error) {
        console.error('❌ Error procesando archivo Excel:', error);
        
        const errorResult: ExcelImportResult = {
          success: false,
          matchedProducts: [],
          skusNotFound: [],
          totalProcessed: 0,
          errorMessage: error instanceof Error ? error.message : 'Error desconocido al procesar el archivo'
        };
        
        resolve(errorResult); // Resolver con error en lugar de rechazar
      }
    };
    
    reader.onerror = () => {
      const errorResult: ExcelImportResult = {
        success: false,
        matchedProducts: [],
        skusNotFound: [],
        totalProcessed: 0,
        errorMessage: 'Error al leer el archivo'
      };
      
      resolve(errorResult);
    };
    
    // Leer el archivo como ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 📋 Genera un Excel con los productos actualmente seleccionados (para backup)
 */
export const exportSelectedProductsToExcel = (selectedProducts: ProductoReal[]): void => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Preparar datos para exportar
    const exportData = [
      // Headers
      ['SKU', 'Descripción', 'Precio', 'Sección', 'Grupo', 'Stock'],
      
      // Datos de productos
      ...selectedProducts.map(product => [
        product.sku || '',
        product.descripcion || '',
        product.precio || 0,
        product.seccion || '',
        product.grupo || '',
        product.stockDisponible || 0
      ])
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    
    // Configurar anchos de columna
    worksheet['!cols'] = [
      { wch: 15 }, // SKU
      { wch: 50 }, // Descripción
      { wch: 15 }, // Precio
      { wch: 20 }, // Sección
      { wch: 20 }, // Grupo
      { wch: 10 }  // Stock
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos Seleccionados');
    
    const fileName = `SPID_Productos_Seleccionados_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    console.log('✅ Productos exportados exitosamente:', fileName);
    
  } catch (error) {
    console.error('❌ Error exportando productos:', error);
    throw new Error('Error al exportar productos a Excel');
  }
};

/**
 * 🔍 Valida si un archivo es un Excel válido
 */
export const validateExcelFile = (file: File): boolean => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv como alternativa
  ];
  
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  
  return validTypes.includes(file.type) || validExtensions.includes(fileExtension);
};

export default {
  downloadSKUTemplate,
  importProductsFromExcel,
  exportSelectedProductsToExcel,
  validateExcelFile
}; 