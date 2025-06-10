import * as XLSX from 'xlsx';

export interface ExcelData {
  headers: string[];
  rows: Record<string, any>[];
}

export class ExcelService {
  /**
   * Lee un archivo Excel y retorna sus datos
   * @param file - El archivo Excel a leer
   * @returns Promise con los datos del Excel
   */
  static async readExcelFile(file: File): Promise<ExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
          
          if (jsonData.length === 0) {
            resolve({ headers: [], rows: [] });
            return;
          }

          // Obtener headers
          const headers = Object.keys(jsonData[0]);
          
          resolve({
            headers,
            rows: jsonData
          });
        } catch (error) {
          reject(new Error('Error al procesar el archivo Excel'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsBinaryString(file);
    });
  }

  /**
   * Convierte datos a formato Excel y los descarga
   * @param data - Los datos a convertir
   * @param fileName - Nombre del archivo a descargar
   */
  static downloadExcel(data: Record<string, any>[], fileName: string = 'export.xlsx'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Valida si un archivo es un Excel válido
   * @param file - El archivo a validar
   * @returns boolean indicando si el archivo es válido
   */
  static isValidExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];
    return validTypes.includes(file.type);
  }

  /**
   * Obtiene el nombre de las hojas de un archivo Excel
   * @param file - El archivo Excel
   * @returns Promise con los nombres de las hojas
   */
  static async getSheetNames(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          resolve(workbook.SheetNames);
        } catch (error) {
          reject(new Error('Error al obtener los nombres de las hojas'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsBinaryString(file);
    });
  }

  /**
   * Lee una hoja específica de un archivo Excel
   * @param file - El archivo Excel
   * @param sheetName - Nombre de la hoja a leer
   * @returns Promise con los datos de la hoja
   */
  static async readSpecificSheet(file: File, sheetName: string): Promise<ExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          if (!workbook.SheetNames.includes(sheetName)) {
            reject(new Error(`La hoja "${sheetName}" no existe en el archivo`));
            return;
          }

          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
          
          if (jsonData.length === 0) {
            resolve({ headers: [], rows: [] });
            return;
          }

          const headers = Object.keys(jsonData[0]);
          
          resolve({
            headers,
            rows: jsonData
          });
        } catch (error) {
          reject(new Error('Error al procesar la hoja del Excel'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsBinaryString(file);
    });
  }
} 