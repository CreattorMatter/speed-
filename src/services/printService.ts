import { Product } from '../data/products';
import { FinancingOption } from '../types/financing';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

export interface PrintableCartel {
  id: string;
  product: Product;
  templateComponent: React.ComponentType<any>;
  templateProps: Record<string, any>;
  modeloId: string;
}

export interface PrintConfiguration {
  selectedProducts: Product[];
  formatoSeleccionado: {
    label: string;
    value: string;
    width: string;
    height: string;
  } | null;
  plantillaFamily: string;
  plantillaType: string;
  selectedFinancing: FinancingOption[];
  modeloSeleccionado: string | null;
  templateComponents: Record<string, React.ComponentType<any>>;
  getCurrentProductValue: (product: Product, field: string) => any;
}

export class PrintService {
  /**
   * Función principal para imprimir carteles con configuración completa
   */
  static async printCarteles(config: PrintConfiguration): Promise<void> {
    try {
      console.log('🖨️ PrintService: Iniciando impresión con configuración:', config);

      if (!config.selectedProducts || config.selectedProducts.length === 0) {
        throw new Error('No hay productos seleccionados para imprimir');
      }

      if (!config.modeloSeleccionado) {
        throw new Error('No hay modelo de plantilla seleccionado');
      }

      // Debug: Verificar URLs de imágenes antes de continuar
      console.log('🔍 PrintService: Verificando URLs de imágenes...');
      const testHeaderUrl = `${window.location.origin}/images/templates/ladrillazo-header.jpg`;
      console.log(`📍 PrintService: URL base del header: ${testHeaderUrl}`);
      
      // Verificar que la imagen del header existe antes de continuar
      await this.verifyHeaderImage();

      // Generar carteles imprimibles
      const printableCarteles = await this.generatePrintableCarteles(config);
      
      if (printableCarteles.length === 0) {
        throw new Error('No se pudieron generar carteles para imprimir');
      }

      console.log(`📋 PrintService: Generados ${printableCarteles.length} carteles para imprimir`);

      // Generar HTML para impresión
      const printHTML = await this.generatePrintHTML(printableCarteles, config);

      // Ejecutar impresión
      await this.executePrint(printHTML);

      console.log('✅ PrintService: Impresión completada exitosamente');

    } catch (error) {
      console.error('❌ PrintService: Error durante la impresión:', error);
      throw error;
    }
  }

  /**
   * Verificar que la imagen del header de Ladrillazos existe y se puede cargar
   */
  private static async verifyHeaderImage(): Promise<void> {
    return new Promise<void>((resolve) => {
      // Probar primero la URL limpia sin parámetros de cache
      const cleanHeaderUrl = `${window.location.origin}/images/templates/ladrillazo-header.jpg`;
      console.log(`🔍 PrintService: Verificando imagen del header (URL limpia): ${cleanHeaderUrl}`);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        console.warn(`⏰ PrintService: Timeout verificando imagen del header: ${cleanHeaderUrl}`);
        console.log(`🔄 PrintService: Continuando con fallback de texto para el header`);
        resolve(); // No fallar, usar fallback
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        console.log(`✅ PrintService: Imagen del header verificada exitosamente - Dimensiones: ${img.width}x${img.height}`);
        console.log(`📊 PrintService: URL final utilizada: ${img.src}`);
        resolve();
      };
      
      img.onerror = (error) => {
        clearTimeout(timeout);
        console.warn(`⚠️ PrintService: Error cargando imagen del header: ${cleanHeaderUrl}`, error);
        console.log(`🔄 PrintService: Continuando con fallback de texto para el header`);
        resolve(); // No fallar, usar fallback
      };
      
      img.src = cleanHeaderUrl;
    });
  }

  /**
   * Crear header de fallback con texto si la imagen no está disponible
   */
  private static createFallbackHeader(): string {
    return `
      <div style="
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
        color: white;
        text-align: center;
        padding: 20px;
        font-family: Arial, sans-serif;
        font-weight: bold;
        font-size: 32px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        border: 3px solid #7f1d1d;
        box-shadow: inset 0 2px 4px rgba(255,255,255,0.2);
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        letter-spacing: 2px;
      ">
        LADRILLAZOS
      </div>
    `;
  }

  /**
   * Generar carteles imprimibles desde la configuración
   */
  private static async generatePrintableCarteles(config: PrintConfiguration): Promise<PrintableCartel[]> {
    const carteles: PrintableCartel[] = [];

    try {
      // Buscar el componente de plantilla
      const componentPath = this.getComponentPathFromModelId(config.modeloSeleccionado!);
      const TemplateComponent = config.templateComponents[componentPath];

      if (!TemplateComponent) {
        throw new Error(`Componente de plantilla no encontrado: ${componentPath}`);
      }

      console.log(`🎨 PrintService: Usando componente ${componentPath} para ${config.selectedProducts.length} productos`);

      // Generar un cartel por cada producto
      for (const product of config.selectedProducts) {
        const templateProps = this.generateTemplateProps(product, config);
        
        const cartel: PrintableCartel = {
          id: `cartel-${product.id}`,
          product,
          templateComponent: TemplateComponent,
          templateProps,
          modeloId: config.modeloSeleccionado!
        };

        carteles.push(cartel);
      }

      return carteles;

    } catch (error) {
      console.error('❌ PrintService: Error generando carteles:', error);
      throw error;
    }
  }

  /**
   * Generar props para el componente de plantilla
   */
  private static generateTemplateProps(product: Product, config: PrintConfiguration): Record<string, any> {
    const baseProps = {
      // Props básicos del producto
      nombre: config.getCurrentProductValue(product, 'nombre') || product.name,
      precioActual: config.getCurrentProductValue(product, 'precioActual') || product.price?.toString(),
      sap: config.getCurrentProductValue(product, 'sap') || product.sku,
      
      // Props adicionales que pueden estar editados
      porcentaje: config.getCurrentProductValue(product, 'porcentaje'),
      fechasDesde: config.getCurrentProductValue(product, 'fechasDesde'),
      fechasHasta: config.getCurrentProductValue(product, 'fechasHasta'),
      origen: config.getCurrentProductValue(product, 'origen'),
      precioSinImpuestos: config.getCurrentProductValue(product, 'precioSinImpuestos'),
      
      // Props de configuración
      financiacion: config.selectedFinancing,
      
      // Props de control
      small: false // Para impresión siempre usar tamaño completo
    };

    console.log(`📝 PrintService: Props generados para ${product.name}:`, baseProps);
    return baseProps;
  }

  /**
   * Obtener el path del componente desde el ID del modelo
   */
  private static getComponentPathFromModelId(modeloId: string): string {
    // Mapeo de IDs de modelo a paths de componentes
    const modelToComponentMap: Record<string, string> = {
      'ladrillazos-1': 'Ladrillazos/Ladrillazos1',
      'ladrillazos-2': 'Ladrillazos/Ladrillazos2',
      'ladrillazos-3': 'Ladrillazos/Ladrillazos3',
      'ladrillazos-4': 'Ladrillazos/Ladrillazos4',
      'ladrillazos-5': 'Ladrillazos/Ladrillazos5',
      'ladrillazos-6': 'Ladrillazos/Ladrillazos6',
      'ladrillazos-7': 'Ladrillazos/Ladrillazos7',
      'ladrillazos-8': 'Ladrillazos/Ladrillazos8',
      'ladrillazos-9': 'Ladrillazos/Ladrillazos9',
      'ladrillazos-10': 'Ladrillazos/Ladrillazos10',
      'ladrillazos-11': 'Ladrillazos/Ladrillazos11',
      'ladrillazos-12': 'Ladrillazos/Ladrillazos12',
      'ladrillazos-13': 'Ladrillazos/Ladrillazos13',
      'ladrillazos-14': 'Ladrillazos/Ladrillazos14',
      'ladrillazos-15': 'Ladrillazos/Ladrillazos15',
      'ladrillazos-16': 'Ladrillazos/Ladrillazos16',
      'ladrillazos-17': 'Ladrillazos/Ladrillazos17',
      'ladrillazos-18': 'Ladrillazos/Ladrillazos18'
    };

    const componentPath = modelToComponentMap[modeloId];
    if (!componentPath) {
      throw new Error(`No se encontró el path del componente para el modelo: ${modeloId}`);
    }

    return componentPath;
  }

  /**
   * Generar header profesional para impresión
   */
  private static generatePrintHeader(): string {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div class="print-header" style="
        background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #7c3aed 100%);
        color: white;
        padding: 20px 40px;
        margin-bottom: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="
            width: 48px;
            height: 48px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 3H7C5.9 3 5 3.9 5 5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V5C19 3.9 18.1 3 17 3ZM17 19H7V5H17V19Z" fill="white"/>
              <path d="M9 7H15V9H9V7ZM9 11H15V13H9V11ZM9 15H13V17H9V15Z" fill="white"/>
            </svg>
          </div>
          <div>
            <h1 style="
              font-size: 28px;
              font-weight: bold;
              margin: 0;
              background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">
              SPID Plus
            </h1>
            <p style="
              margin: 0;
              font-size: 14px;
              color: rgba(255,255,255,0.8);
              font-weight: 500;
            ">
              Sistema de Carteles Digitales
            </p>
          </div>
        </div>
        <div style="text-align: right;">
          <p style="
            margin: 0;
            font-size: 14px;
            color: rgba(255,255,255,0.9);
            font-weight: 600;
          ">
            Generado el ${currentDate}
          </p>
          <p style="
            margin: 0;
            font-size: 12px;
            color: rgba(255,255,255,0.7);
          ">
            Documento de impresión oficial
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Generar HTML completo para impresión con estilos completos
   */
  private static async generatePrintHTML(carteles: PrintableCartel[], config: PrintConfiguration): Promise<string> {
    try {
      console.log(`📄 PrintService: Generando HTML para ${carteles.length} carteles`);

      // Generar header
      const headerHTML = this.generatePrintHeader();

      // Generar HTML para cada cartel
      const cartelesHTML = carteles.map((cartel, index) => {
        try {
          // Crear elemento React
          const element = React.createElement(cartel.templateComponent, {
            key: `cartel-${index}`,
            ...cartel.templateProps
          });

          // Renderizar a string
          let cartelHTML = renderToString(element);
          
          // Convertir URLs relativas a absolutas para imágenes
          cartelHTML = this.convertRelativeUrlsToAbsolute(cartelHTML);
          
          // Convertir background-images a elementos img para mejor compatibilidad
          cartelHTML = this.convertBackgroundImagesToImg(cartelHTML);
          
          // Ajustar escala del contenido para que quepa en el contenedor
          cartelHTML = this.adjustCartelScale(cartelHTML, cartel.product);
          
          console.log(`✅ PrintService: Cartel ${index + 1} renderizado exitosamente`);
          
          return `
            <div class="cartel-page" style="
              page-break-after: ${index < carteles.length - 1 ? 'always' : 'auto'};
              width: 100%;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              margin: 0;
              padding: 40px;
              box-sizing: border-box;
              background: white;
            ">
              ${index === 0 ? headerHTML : ''}
              <div style="
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: ${index === 0 ? '0' : '60px'};
                width: 100%;
                height: auto;
                min-height: 600px;
              ">
                ${cartelHTML}
              </div>
              <div style="
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
              ">
                <p style="margin: 0;">
                  <strong>Producto:</strong> ${cartel.product.name} | 
                  <strong>SKU:</strong> ${cartel.product.sku} | 
                  <strong>Plantilla:</strong> ${config.plantillaFamily} ${config.plantillaType}
                </p>
                <p style="margin: 5px 0 0 0;">
                  Página ${index + 1} de ${carteles.length} - Generado por SPID Plus
                </p>
              </div>
            </div>
          `;
        } catch (error) {
          console.error(`❌ PrintService: Error renderizando cartel ${index + 1}:`, error);
          return `
            <div class="cartel-page" style="
              page-break-after: ${index < carteles.length - 1 ? 'always' : 'auto'};
              width: 100%;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              margin: 0;
              padding: 40px;
              box-sizing: border-box;
              background: white;
            ">
              ${index === 0 ? headerHTML : ''}
              <div style="text-align: center; color: #ef4444; padding: 40px;">
                <h2 style="color: #dc2626; margin-bottom: 20px;">Error al renderizar cartel</h2>
                <p><strong>Producto:</strong> ${cartel.product.name}</p>
                <p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Error desconocido'}</p>
              </div>
            </div>
          `;
        }
      }).join('');

      // HTML completo con estilos CSS completos y mejoras para imágenes
      const fullHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Carteles SPID Plus - Impresión</title>
          <style>
            /* Reset y configuración base */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              color: #1f2937;
              line-height: 1.6;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            /* Configuración de impresión */
            @media print {
              body {
                margin: 0;
                padding: 0;
                background: white !important;
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              .cartel-page {
                page-break-inside: avoid;
              }
              
              /* Asegurar que las imágenes de fondo se impriman */
              * {
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              /* Forzar impresión de imágenes */
              img {
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                opacity: 1 !important;
                visibility: visible !important;
                display: block !important;
                max-width: none !important;
                max-height: none !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                filter: none !important;
                transform: none !important;
                background: none !important;
              }
              
              /* Estilos específicos para el header de Ladrillazos */
              img[alt="Header Ladrillazos"] {
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                opacity: 1 !important;
                visibility: visible !important;
                display: block !important;
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                object-position: center !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                z-index: 999 !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                filter: none !important;
                transform: none !important;
                background: none !important;
              }
              
              /* Forzar que los contenedores de imágenes mantengan su tamaño */
              div[style*="background-image"] {
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              /* Ocultar elementos de UI durante la impresión */
              .print\\:hidden {
                display: none !important;
              }
            }
            
            /* Estilos para pantalla también */
            @media screen {
              img[alt="Header Ladrillazos"] {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                opacity: 1;
                visibility: visible;
                display: block;
              }
            }
            
            @page {
              margin: 0.5in;
              size: auto;
            }
            
            /* Estilos específicos para imágenes de fondo */
            [style*="background-image"] {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            /* Asegurar que las imágenes se muestren correctamente */
            img {
              max-width: 100%;
              height: auto;
              display: block;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            /* Estilos de Tailwind CSS completos */
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .text-justify { text-align: justify; }
            
            /* Font weights */
            .font-thin { font-weight: 100; }
            .font-extralight { font-weight: 200; }
            .font-light { font-weight: 300; }
            .font-normal { font-weight: 400; }
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            .font-extrabold { font-weight: 800; }
            .font-black { font-weight: 900; }
            
            /* Font sizes */
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-base { font-size: 1rem; line-height: 1.5rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
            .text-5xl { font-size: 3rem; line-height: 1; }
            .text-6xl { font-size: 3.75rem; line-height: 1; }
            .text-7xl { font-size: 4.5rem; line-height: 1; }
            .text-8xl { font-size: 6rem; line-height: 1; }
            .text-9xl { font-size: 8rem; line-height: 1; }
            
            /* Colors */
            .text-white { color: #ffffff; }
            .text-black { color: #000000; }
            .text-gray-50 { color: #f9fafb; }
            .text-gray-100 { color: #f3f4f6; }
            .text-gray-200 { color: #e5e7eb; }
            .text-gray-300 { color: #d1d5db; }
            .text-gray-400 { color: #9ca3af; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-900 { color: #111827; }
            .text-red-500 { color: #ef4444; }
            .text-red-600 { color: #dc2626; }
            .text-red-700 { color: #b91c1c; }
            .text-blue-500 { color: #3b82f6; }
            .text-blue-600 { color: #2563eb; }
            .text-blue-700 { color: #1d4ed8; }
            .text-green-500 { color: #22c55e; }
            .text-green-600 { color: #16a34a; }
            .text-yellow-400 { color: #facc15; }
            .text-yellow-500 { color: #eab308; }
            .text-orange-400 { color: #fb923c; }
            .text-orange-500 { color: #f97316; }
            .text-purple-500 { color: #a855f7; }
            .text-purple-600 { color: #9333ea; }
            .text-indigo-500 { color: #6366f1; }
            .text-indigo-600 { color: #4f46e5; }
            
            /* Background colors */
            .bg-white { background-color: #ffffff; }
            .bg-black { background-color: #000000; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .bg-gray-200 { background-color: #e5e7eb; }
            .bg-gray-300 { background-color: #d1d5db; }
            .bg-red-500 { background-color: #ef4444; }
            .bg-red-600 { background-color: #dc2626; }
            .bg-blue-500 { background-color: #3b82f6; }
            .bg-blue-600 { background-color: #2563eb; }
            .bg-green-500 { background-color: #22c55e; }
            .bg-yellow-300 { background-color: #fde047; }
            .bg-yellow-400 { background-color: #facc15; }
            .bg-yellow-500 { background-color: #eab308; }
            .bg-orange-400 { background-color: #fb923c; }
            .bg-orange-500 { background-color: #f97316; }
            
            /* Margins */
            .m-0 { margin: 0; }
            .m-1 { margin: 0.25rem; }
            .m-2 { margin: 0.5rem; }
            .m-3 { margin: 0.75rem; }
            .m-4 { margin: 1rem; }
            .m-5 { margin: 1.25rem; }
            .m-6 { margin: 1.5rem; }
            .m-8 { margin: 2rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-3 { margin-top: 0.75rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-5 { margin-top: 1.25rem; }
            .mt-6 { margin-top: 1.5rem; }
            .mt-8 { margin-top: 2rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .ml-1 { margin-left: 0.25rem; }
            .ml-2 { margin-left: 0.5rem; }
            .mr-1 { margin-right: 0.25rem; }
            .mr-2 { margin-right: 0.5rem; }
            
            /* Padding */
            .p-0 { padding: 0; }
            .p-1 { padding: 0.25rem; }
            .p-2 { padding: 0.5rem; }
            .p-3 { padding: 0.75rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .p-8 { padding: 2rem; }
            .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
            .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
            .py-0 { padding-top: 0; padding-bottom: 0; }
            .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
            
            /* Borders */
            .border { border-width: 1px; border-style: solid; border-color: #e5e7eb; }
            .border-2 { border-width: 2px; border-style: solid; border-color: #e5e7eb; }
            .border-4 { border-width: 4px; border-style: solid; border-color: #e5e7eb; }
            .border-black { border-color: #000000; }
            .border-gray-200 { border-color: #e5e7eb; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-red-500 { border-color: #ef4444; }
            .border-blue-500 { border-color: #3b82f6; }
            
            /* Border radius */
            .rounded { border-radius: 0.25rem; }
            .rounded-md { border-radius: 0.375rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-xl { border-radius: 0.75rem; }
            .rounded-2xl { border-radius: 1rem; }
            .rounded-full { border-radius: 9999px; }
            
            /* Display */
            .block { display: block; }
            .inline-block { display: inline-block; }
            .inline { display: inline; }
            .flex { display: flex; }
            .inline-flex { display: inline-flex; }
            .grid { display: grid; }
            .hidden { display: none; }
            
            /* Flexbox */
            .flex-row { flex-direction: row; }
            .flex-col { flex-direction: column; }
            .flex-wrap { flex-wrap: wrap; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .items-end { align-items: flex-end; }
            .items-stretch { align-items: stretch; }
            .justify-start { justify-content: flex-start; }
            .justify-center { justify-content: center; }
            .justify-end { justify-content: flex-end; }
            .justify-between { justify-content: space-between; }
            .justify-around { justify-content: space-around; }
            .flex-1 { flex: 1 1 0%; }
            .flex-auto { flex: 1 1 auto; }
            .flex-none { flex: none; }
            
            /* Width & Height */
            .w-auto { width: auto; }
            .w-full { width: 100%; }
            .w-1\\/2 { width: 50%; }
            .w-1\\/3 { width: 33.333333%; }
            .w-2\\/3 { width: 66.666667%; }
            .w-1\\/4 { width: 25%; }
            .w-3\\/4 { width: 75%; }
            .h-auto { height: auto; }
            .h-full { height: 100%; }
            .h-screen { height: 100vh; }
            .h-\\[200px\\] { height: 200px; }
            .min-h-screen { min-height: 100vh; }
            .max-w-xs { max-width: 20rem; }
            .max-w-sm { max-width: 24rem; }
            .max-w-md { max-width: 28rem; }
            .max-w-lg { max-width: 32rem; }
            .max-w-xl { max-width: 36rem; }
            .max-w-2xl { max-width: 42rem; }
            .max-w-3xl { max-width: 48rem; }
            .max-w-4xl { max-width: 56rem; }
            .max-w-5xl { max-width: 64rem; }
            .max-w-6xl { max-width: 72rem; }
            .max-w-7xl { max-width: 80rem; }
            .max-w-full { max-width: 100%; }
            .min-w-\\[400px\\] { min-width: 400px; }
            .min-w-\\[450px\\] { min-width: 450px; }
            .min-w-\\[500px\\] { min-width: 500px; }
            .min-w-\\[650px\\] { min-width: 650px; }
            .min-h-\\[60px\\] { min-height: 60px; }
            .min-h-\\[80px\\] { min-height: 80px; }
            .min-h-\\[140px\\] { min-height: 140px; }
            .min-h-\\[150px\\] { min-height: 150px; }
            .max-h-\\[500px\\] { max-height: 500px; }
            .max-h-\\[750px\\] { max-height: 750px; }
            
            /* Position */
            .static { position: static; }
            .fixed { position: fixed; }
            .absolute { position: absolute; }
            .relative { position: relative; }
            .sticky { position: sticky; }
            
            /* Line height */
            .leading-none { line-height: 1; }
            .leading-tight { line-height: 1.25; }
            .leading-snug { line-height: 1.375; }
            .leading-normal { line-height: 1.5; }
            .leading-relaxed { line-height: 1.625; }
            .leading-loose { line-height: 2; }
            
            /* Text decoration */
            .underline { text-decoration: underline; }
            .line-through { text-decoration: line-through; }
            .no-underline { text-decoration: none; }
            
            /* Text transform */
            .uppercase { text-transform: uppercase; }
            .lowercase { text-transform: lowercase; }
            .capitalize { text-transform: capitalize; }
            .normal-case { text-transform: none; }
            
            /* Overflow */
            .overflow-hidden { overflow: hidden; }
            .overflow-visible { overflow: visible; }
            .overflow-auto { overflow: auto; }
            
            /* Word break */
            .break-words { word-wrap: break-word; }
            .break-all { word-break: break-all; }
            
            /* Vertical align */
            .align-baseline { vertical-align: baseline; }
            .align-top { vertical-align: top; }
            .align-middle { vertical-align: middle; }
            .align-bottom { vertical-align: bottom; }
            .align-text-top { vertical-align: text-top; }
            .align-text-bottom { vertical-align: text-bottom; }
            .align-sub { vertical-align: sub; }
            .align-super { vertical-align: super; }
            
            /* Shadows */
            .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
            .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
            .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
            
            /* Transitions */
            .transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
            .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
            .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
            .transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
            .duration-150 { transition-duration: 150ms; }
            .duration-200 { transition-duration: 200ms; }
            .duration-300 { transition-duration: 300ms; }
            .duration-500 { transition-duration: 500ms; }
            
            /* Transform */
            .transform { transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
            .scale-50 { --tw-scale-x: .5; --tw-scale-y: .5; transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
            .scale-75 { --tw-scale-x: .75; --tw-scale-y: .75; transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
            .scale-90 { --tw-scale-x: .9; --tw-scale-y: .9; transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
            .scale-95 { --tw-scale-x: .95; --tw-scale-y: .95; transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
            .scale-100 { --tw-scale-x: 1; --tw-scale-y: 1; transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
            .scale-105 { --tw-scale-x: 1.05; --tw-scale-y: 1.05; transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
            .scale-110 { --tw-scale-x: 1.1; --tw-scale-y: 1.1; transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
            .scale-\\[0\\.6\\] { --tw-scale-x: 0.6; --tw-scale-y: 0.6; transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
            .scale-\\[0\\.65\\] { --tw-scale-x: 0.65; --tw-scale-y: 0.65; transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }
            
            /* Z-index */
            .z-0 { z-index: 0; }
            .z-10 { z-index: 10; }
            .z-20 { z-index: 20; }
            .z-30 { z-index: 30; }
            .z-40 { z-index: 40; }
            .z-50 { z-index: 50; }
            
            /* Opacity */
            .opacity-0 { opacity: 0; }
            .opacity-25 { opacity: 0.25; }
            .opacity-50 { opacity: 0.5; }
            .opacity-75 { opacity: 0.75; }
            .opacity-100 { opacity: 1; }
            
            /* Cursor */
            .cursor-pointer { cursor: pointer; }
            .cursor-default { cursor: default; }
            .cursor-not-allowed { cursor: not-allowed; }
            
            /* Select */
            .select-none { user-select: none; }
            .select-text { user-select: text; }
            .select-all { user-select: all; }
            .select-auto { user-select: auto; }
            
            /* Pointer events */
            .pointer-events-none { pointer-events: none; }
            .pointer-events-auto { pointer-events: auto; }
            
            /* Resize */
            .resize-none { resize: none; }
            .resize { resize: both; }
            .resize-y { resize: vertical; }
            .resize-x { resize: horizontal; }
            
            /* Estilos específicos para carteles */
            .cartel-container {
              position: relative !important;
              background: white !important;
            }
            
            .cartel-content {
              width: 100% !important;
              height: 100% !important;
              max-width: none !important;
              max-height: none !important;
              overflow: visible !important;
              position: relative !important;
              transform: scale(1) !important;
              transform-origin: center center !important;
            }
            
            /* Forzar que los elementos internos no se limiten */
            .cartel-content * {
              max-width: none !important;
              box-sizing: border-box !important;
            }
            
            /* Estilos específicos para elementos de texto grandes */
            .cartel-content .text-8xl,
            .cartel-content .text-6xl,
            .cartel-content .text-5xl {
              font-size: clamp(2rem, 8vw, 4rem) !important;
              line-height: 1.1 !important;
              word-break: break-word !important;
            }
            
            /* Asegurar que los precios no se desborden */
            .cartel-content [class*="text-"] {
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              hyphens: auto !important;
            }
            
            @media print {
              .cartel-container {
                position: relative !important;
                background: white !important;
                overflow: visible !important;
                page-break-inside: avoid !important;
              }
              
              .cartel-content {
                width: 100% !important;
                height: 100% !important;
                max-width: none !important;
                max-height: none !important;
                overflow: visible !important;
                transform: scale(1) !important;
              }
            }
          </style>
        </head>
        <body>
          ${cartelesHTML}
        </body>
        </html>
      `;

      // Precargar imágenes antes de devolver el HTML
      await this.preloadImages(fullHTML);

      console.log('📄 PrintService: HTML completo generado exitosamente');
      return fullHTML;

    } catch (error) {
      console.error('❌ PrintService: Error generando HTML:', error);
      throw error;
    }
  }

  /**
   * Convertir URLs relativas a absolutas para imágenes
   */
  private static convertRelativeUrlsToAbsolute(html: string): string {
    try {
      const baseUrl = window.location.origin;
      console.log(`🔗 PrintService: Base URL: ${baseUrl}`);
      
      // Convertir URLs en background-image con mejor detección
      html = html.replace(
        /background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/g,
        (match, url) => {
          console.log(`🔍 PrintService: Procesando background-image URL original: ${url}`);
          
          if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
            console.log(`✅ PrintService: URL ya es absoluta: ${url}`);
            return match; // Ya es absoluta
          }
          
          // Decodificar entidades HTML y limpiar comillas
          let cleanUrl = url
            .replace(/&#x27;/g, "'")  // Decodificar &#x27; a '
            .replace(/&quot;/g, '"')  // Decodificar &quot; a "
            .replace(/&amp;/g, '&')   // Decodificar &amp; a &
            .replace(/^['"]|['"]$/g, '') // Remover comillas al inicio y final
            .replace(/\?v=[^&\s'"]+/g, '') // Limpiar parámetros de cache
            .replace(/&v=[^&\s'"]+/g, ''); // Limpiar parámetros de cache adicionales
          
          // Asegurar que empiece con /
          if (!cleanUrl.startsWith('/')) {
            cleanUrl = '/' + cleanUrl;
          }
          
          const absoluteUrl = `${baseUrl}${cleanUrl}`;
          
          console.log(`🔗 PrintService: URL convertida: ${url} -> ${absoluteUrl}`);
          return `background-image: url('${absoluteUrl}')`;
        }
      );
      
      // Convertir URLs en src de imágenes
      html = html.replace(
        /src=['"]([^'"]+)['"]/g,
        (match, url) => {
          if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
            return match; // Ya es absoluta o es data URL
          }
          
          let cleanUrl = url
            .replace(/&#x27;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/^['"]|['"]$/g, '')
            .replace(/\?v=[^&\s'"]+/g, '')
            .replace(/&v=[^&\s'"]+/g, '');
          
          if (!cleanUrl.startsWith('/')) {
            cleanUrl = '/' + cleanUrl;
          }
          
          const absoluteUrl = `${baseUrl}${cleanUrl}`;
          
          console.log(`🖼️ PrintService: Imagen convertida: ${url} -> ${absoluteUrl}`);
          return `src="${absoluteUrl}"`;
        }
      );
      
      return html;
    } catch (error) {
      console.error('❌ PrintService: Error convirtiendo URLs:', error);
      return html; // Devolver HTML original si hay error
    }
  }

  /**
   * Precargar imágenes críticas para impresión
   */
  private static async preloadImages(html: string): Promise<void> {
    try {
      console.log('🖼️ PrintService: Precargando imágenes...');
      
      const imageUrls: string[] = [];
      
      // Extraer URLs de background-image
      const backgroundMatches = html.matchAll(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/g);
      for (const match of backgroundMatches) {
        imageUrls.push(match[1]);
      }
      
      // Extraer URLs de src
      const srcMatches = html.matchAll(/src=['"]([^'"]+)['"]/g);
      for (const match of srcMatches) {
        if (!match[1].startsWith('data:')) {
          imageUrls.push(match[1]);
        }
      }
      
      // Agregar manualmente la imagen del header de Ladrillazos si no está (URL limpia)
      const headerUrl = `${window.location.origin}/images/templates/ladrillazo-header.jpg`;
      if (!imageUrls.some(url => url.includes('ladrillazo-header'))) {
        imageUrls.push(headerUrl);
        console.log(`📌 PrintService: Agregando manualmente header de Ladrillazos: ${headerUrl}`);
      }
      
      console.log(`🖼️ PrintService: Encontradas ${imageUrls.length} imágenes para precargar:`, imageUrls);
      
      // Precargar todas las imágenes con mejor manejo de errores
      const preloadPromises = imageUrls.map((url, index) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous'; // Para evitar problemas de CORS
          
          const timeout = setTimeout(() => {
            console.warn(`⏰ PrintService: Timeout precargando imagen ${index + 1}/${imageUrls.length}: ${url}`);
            resolve();
          }, 8000); // Aumentado a 8 segundos
          
          img.onload = () => {
            clearTimeout(timeout);
            console.log(`✅ PrintService: Imagen ${index + 1}/${imageUrls.length} precargada exitosamente: ${url}`);
            resolve();
          };
          
          img.onerror = (error) => {
            clearTimeout(timeout);
            console.warn(`⚠️ PrintService: Error precargando imagen ${index + 1}/${imageUrls.length}: ${url}`, error);
            resolve(); // No fallar por una imagen
          };
          
          img.src = url;
        });
      });
      
      await Promise.all(preloadPromises);
      console.log('✅ PrintService: Todas las imágenes precargadas exitosamente');
      
      // Esperar un poco más para asegurar que las imágenes estén en cache
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('❌ PrintService: Error precargando imágenes:', error);
      // No fallar la impresión por esto
    }
  }

  /**
   * Convertir background-images a elementos img para mejor compatibilidad
   */
  private static convertBackgroundImagesToImg(html: string): string {
    try {
      console.log('🔄 PrintService: Convirtiendo background-images a elementos img...');
      
      // Buscar específicamente el header de Ladrillazos y convertirlo
      html = html.replace(
        /<div([^>]*?)style="([^"]*?)background-image:\s*url\(['"]?([^'")\s]*ladrillazo-header[^'")\s]*)['"]?\)([^"]*?)"([^>]*?)>/g,
        (match, beforeStyle, styleStart, imageUrl, styleEnd, afterStyle) => {
          console.log(`🎯 PrintService: Detectado header de Ladrillazos con URL: ${imageUrl}`);
          
          // Limpiar la URL de parámetros de cache y entidades HTML
          const cleanImageUrl = imageUrl
            .replace(/&#x27;/g, "'")      // Decodificar &#x27; a '
            .replace(/&quot;/g, '"')      // Decodificar &quot; a "
            .replace(/&amp;/g, '&')       // Decodificar &amp; a &
            .replace(/^['"]|['"]$/g, '')  // Remover comillas al inicio y final
            .replace(/\?v=[^&\s'"]+/g, '') // Limpiar parámetros de cache
            .replace(/&v=[^&\s'"]+/g, ''); // Limpiar parámetros de cache adicionales
            
          const absoluteImageUrl = cleanImageUrl.startsWith('http') ? cleanImageUrl : `${window.location.origin}${cleanImageUrl}`;
          
          console.log(`🧹 PrintService: URL limpia del header: ${absoluteImageUrl}`);
          
          // Extraer dimensiones y otros estilos
          const heightMatch = (styleStart + styleEnd).match(/height:\s*([^;]+)/);
          const minHeightMatch = (styleStart + styleEnd).match(/min-height:\s*([^;]+)/);
          const height = heightMatch ? heightMatch[1] : (minHeightMatch ? minHeightMatch[1] : '200px');
          
          // Crear estilos para el contenedor con fondo de fallback
          const containerStyle = `position: relative; width: 100%; height: ${height}; overflow: hidden; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);`;
          
          // Crear tanto la imagen como el fallback de texto
          const headerContent = `
            <img src="${absoluteImageUrl}" 
                 style="
                   width: 100%; 
                   height: 100%; 
                   object-fit: cover; 
                   object-position: center;
                   display: block !important;
                   print-color-adjust: exact !important;
                   -webkit-print-color-adjust: exact !important;
                   color-adjust: exact !important;
                   position: absolute !important;
                   top: 0 !important;
                   left: 0 !important;
                   z-index: 999 !important;
                   opacity: 1 !important;
                   visibility: visible !important;
                   border: none !important;
                   outline: none !important;
                   box-shadow: none !important;
                   filter: none !important;
                   transform: none !important;
                 " 
                 alt="Header Ladrillazos"
                 onload="console.log('✅ Header Ladrillazos cargado exitosamente'); this.style.display='block';"
                 onerror="console.warn('⚠️ Error cargando header Ladrillazos, usando fallback'); this.style.display='none';" />
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-family: Arial, sans-serif;
              font-weight: bold;
              font-size: 32px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
              letter-spacing: 2px;
              z-index: 998;
              background: rgba(220, 38, 38, 0.1);
              pointer-events: none;
            ">
              LADRILLAZOS
            </div>
          `;
          
          console.log(`✅ PrintService: Header convertido exitosamente con imagen y fallback`);
          
          return `<div${beforeStyle}style="${containerStyle}"${afterStyle}>${headerContent}</div>`;
        }
      );
      
      // Convertir otros background-images normalmente
      html = html.replace(
        /<div([^>]*?)style="([^"]*?)background-image:\s*url\(['"]?([^'")\s]+)['"]?\)([^"]*?)"([^>]*?)>/g,
        (match, beforeStyle, styleStart, imageUrl, styleEnd, afterStyle) => {
          // Saltar si ya fue procesado como header de Ladrillazos
          if (imageUrl.includes('ladrillazo-header')) {
            return match;
          }
          
          // Extraer otras propiedades de estilo
          const otherStyles = (styleStart + styleEnd).replace(/background-[^;]*;?/g, '').trim();
          
          // Crear el div contenedor con posición relativa
          const containerStyle = otherStyles ? `${otherStyles} position: relative; overflow: hidden;` : 'position: relative; overflow: hidden;';
          
          // Crear el elemento img de fondo
          const imgElement = `<img src="${imageUrl}" style="
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            z-index: 0;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          " alt="Background image" />`;
          
          // Crear el div de contenido
          const contentDiv = '<div style="position: relative; z-index: 1; width: 100%; height: 100%;">';
          
          console.log(`🔄 PrintService: Convertido background-image: ${imageUrl}`);
          
          return `<div${beforeStyle}style="${containerStyle}"${afterStyle}>${imgElement}${contentDiv}`;
        }
      );
      
      return html;
    } catch (error) {
      console.error('❌ PrintService: Error convirtiendo background-images:', error);
      return html;
    }
  }

  /**
   * Ejecutar la impresión del HTML generado
   */
  private static async executePrint(htmlContent: string): Promise<void> {
    try {
      console.log('🖨️ PrintService: Ejecutando impresión...');

      // Crear ventana de impresión
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión. Verifica que los popups estén habilitados.');
      }

      // Escribir contenido en la ventana
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Esperar a que se cargue el contenido y las imágenes
      await new Promise<void>((resolve) => {
        let imagesLoaded = 0;
        let totalImages = 0;
        
        const checkImagesLoaded = () => {
          const images = printWindow.document.querySelectorAll('img');
          totalImages = images.length;
          
          console.log(`📸 PrintService: Verificando carga de ${totalImages} imágenes en ventana de impresión`);
          
          if (totalImages === 0) {
            console.log('📄 PrintService: No hay imágenes que cargar, procediendo con impresión');
            resolve();
            return;
          }
          
          images.forEach((img, index) => {
            if (img.complete && img.naturalWidth > 0) {
              imagesLoaded++;
              console.log(`✅ PrintService: Imagen ${index + 1}/${totalImages} ya cargada: ${img.src}`);
              // Forzar estilos para asegurar visibilidad
              img.style.display = 'block';
              img.style.opacity = '1';
              img.style.visibility = 'visible';
            } else {
              img.onload = () => {
                imagesLoaded++;
                console.log(`✅ PrintService: Imagen ${index + 1}/${totalImages} cargada: ${img.src}`);
                // Forzar que la imagen sea visible
                img.style.display = 'block';
                img.style.opacity = '1';
                img.style.visibility = 'visible';
                if (imagesLoaded === totalImages) {
                  console.log('🎉 PrintService: Todas las imágenes cargadas en ventana de impresión');
                  resolve();
                }
              };
              
              img.onerror = () => {
                imagesLoaded++;
                console.warn(`⚠️ PrintService: Error cargando imagen ${index + 1}/${totalImages}: ${img.src}`);
                if (imagesLoaded === totalImages) {
                  console.log('📄 PrintService: Verificación de imágenes completada (con algunos errores)');
                  resolve();
                }
              };
              
              // Forzar recarga si la imagen no está cargada
              if (!img.complete || img.naturalWidth === 0) {
                console.log(`🔄 PrintService: Forzando recarga de imagen ${index + 1}: ${img.src}`);
                const originalSrc = img.src;
                img.src = '';
                setTimeout(() => {
                  img.src = originalSrc;
                }, 100);
              }
            }
          });
          
          // Verificar si todas las imágenes ya estaban cargadas
          if (imagesLoaded === totalImages) {
            console.log('🎉 PrintService: Todas las imágenes ya estaban cargadas');
            resolve();
          }
        };
        
        // Verificar cuando la ventana esté lista
        printWindow.onload = () => {
          console.log('📄 PrintService: Ventana de impresión cargada, verificando imágenes...');
          
          // Aplicar estilos adicionales para forzar visualización de imágenes
          const additionalStyles = printWindow.document.createElement('style');
          additionalStyles.textContent = `
            img[alt="Header Ladrillazos"] {
              display: block !important;
              opacity: 1 !important;
              visibility: visible !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
              z-index: 999 !important;
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
              filter: none !important;
              transform: none !important;
              background: none !important;
            }
            
            @media print {
              img[alt="Header Ladrillazos"] {
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          `;
          printWindow.document.head.appendChild(additionalStyles);
          
          setTimeout(checkImagesLoaded, 500); // Pequeño delay para asegurar que el DOM esté listo
        };
        
        // Fallback si onload no se dispara
        setTimeout(() => {
          console.log('📄 PrintService: Timeout alcanzado, verificando imágenes...');
          checkImagesLoaded();
        }, 2000);
        
        // Timeout final para no bloquear indefinidamente
        setTimeout(() => {
          console.log('⏰ PrintService: Timeout final alcanzado, procediendo con impresión');
          resolve();
        }, 15000); // 15 segundos máximo
      });

      // Enfocar la ventana y ejecutar impresión
      printWindow.focus();
      
      // Delay adicional para asegurar que todo esté listo
      setTimeout(() => {
        console.log('🖨️ PrintService: Ejecutando comando de impresión...');
        printWindow.print();
        
        // Cerrar la ventana después de imprimir
        setTimeout(() => {
          printWindow.close();
          console.log('🖨️ PrintService: Ventana de impresión cerrada');
        }, 2000); // Aumentado a 2 segundos
      }, 1500); // Aumentado a 1.5 segundos

      console.log('✅ PrintService: Impresión ejecutada exitosamente');

    } catch (error) {
      console.error('❌ PrintService: Error ejecutando impresión:', error);
      throw error;
    }
  }

  /**
   * Función simplificada para impresión directa (fallback)
   */
  static async printDirect(): Promise<void> {
    try {
      console.log('🖨️ PrintService: Ejecutando impresión directa (fallback)');
      
      // Buscar elementos con clase print-content
      const printElements = document.querySelectorAll('.print-content, [data-preview-content]');
      
      if (printElements.length === 0) {
        console.warn('⚠️ PrintService: No se encontraron elementos para imprimir');
        // Fallback a window.print()
        window.print();
        return;
      }

      console.log(`📋 PrintService: Encontrados ${printElements.length} elementos para imprimir`);

      // Crear HTML simple para impresión directa
      const headerHTML = this.generatePrintHeader();
      const printHTML = Array.from(printElements).map((element, index) => `
        <div style="
          page-break-after: ${index < printElements.length - 1 ? 'always' : 'auto'};
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          margin: 0;
          padding: 40px;
          box-sizing: border-box;
          background: white;
        ">
          ${index === 0 ? headerHTML : ''}
          <div style="
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: ${index === 0 ? '0' : '60px'};
          ">
            ${element.innerHTML}
          </div>
        </div>
      `).join('');

      const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>SPID Plus - Impresión Directa</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: white;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            @media print {
              .print\\:hidden { display: none !important; }
              @page { margin: 0.5in; }
            }
          </style>
        </head>
        <body>${printHTML}</body>
        </html>
      `;

      await this.executePrint(fullHTML);

    } catch (error) {
      console.error('❌ PrintService: Error en impresión directa:', error);
      // Último fallback
      window.print();
    }
  }

  /**
   * Función de test para verificar la carga del header de Ladrillazos
   * Se puede llamar desde la consola: PrintService.testHeaderImage()
   */
  static async testHeaderImage(): Promise<void> {
    console.log('🧪 PrintService: Iniciando test del header de Ladrillazos...');
    
    const urls = [
      `${window.location.origin}/images/templates/ladrillazo-header.jpg`,
      `${window.location.origin}/images/templates/ladrillazo-header.jpg?v=3`,
      `/images/templates/ladrillazo-header.jpg`,
      `/images/templates/ladrillazo-header.jpg?v=${Date.now()}`
    ];
    
    for (const [index, url] of urls.entries()) {
      console.log(`🔍 Test ${index + 1}/4: Probando URL: ${url}`);
      
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          const timeout = setTimeout(() => {
            reject(new Error('Timeout'));
          }, 5000);
          
          img.onload = () => {
            clearTimeout(timeout);
            console.log(`✅ Test ${index + 1}/4: ÉXITO - Dimensiones: ${img.width}x${img.height}`);
            resolve();
          };
          
          img.onerror = (error) => {
            clearTimeout(timeout);
            reject(error);
          };
          
          img.src = url;
        });
      } catch (error) {
        console.error(`❌ Test ${index + 1}/4: FALLO -`, error);
      }
    }
    
    console.log('🧪 PrintService: Test del header completado');
  }

  /**
   * Función para crear una vista previa de prueba del header
   * Se puede llamar desde la consola: PrintService.testPrintPreview()
   */
  static testPrintPreview(): void {
    console.log('🖨️ PrintService: Creando vista previa de prueba...');
    
    const headerUrl = `${window.location.origin}/images/templates/ladrillazo-header.jpg`;
    
    const testHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Header Ladrillazos</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          .header-test {
            position: relative;
            width: 100%;
            height: 200px;
            border: 2px solid #000;
            margin: 20px 0;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
          }
          .header-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 2;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .header-text {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 32px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 1;
          }
          @media print {
            * {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <h1>Test de Header Ladrillazos</h1>
        <p>URL de la imagen: ${headerUrl}</p>
        
        <h2>Versión 1: Imagen directa</h2>
        <div class="header-test">
          <img src="${headerUrl}" class="header-img" alt="Header directo" />
          <div class="header-text">LADRILLAZOS</div>
        </div>
        
        <h2>Versión 2: Background-image</h2>
        <div class="header-test" style="background-image: url('${headerUrl}'); background-size: cover; background-position: center;">
          <div class="header-text">LADRILLAZOS</div>
        </div>
        
        <h2>Versión 3: Solo texto (fallback)</h2>
        <div class="header-test">
          <div class="header-text">LADRILLAZOS</div>
        </div>
        
        <script>
          console.log('🧪 Test de header cargado');
          const img = document.querySelector('.header-img');
          img.onload = () => console.log('✅ Imagen del header cargada en test');
          img.onerror = () => console.error('❌ Error cargando imagen del header en test');
        </script>
      </body>
      </html>
    `;
    
    const testWindow = window.open('', '_blank', 'width=800,height=600');
    if (testWindow) {
      testWindow.document.write(testHTML);
      testWindow.document.close();
      console.log('✅ PrintService: Vista previa de prueba creada');
    } else {
      console.error('❌ PrintService: No se pudo abrir ventana de prueba');
    }
  }

  /**
   * Función de prueba específica para el problema del header en impresión
   * Simula exactamente lo que hace la función principal pero con más debugging
   */
  static async testHeaderPrintIssue(): Promise<void> {
    console.log('🧪 PrintService: Iniciando test específico del problema del header...');
    
    const headerUrl = `${window.location.origin}/images/templates/ladrillazo-header.jpg`;
    console.log(`📍 URL del header: ${headerUrl}`);
    
    // Verificar que la imagen se puede cargar
    try {
      await new Promise<void>((resolve, reject) => {
        const testImg = new Image();
        testImg.onload = () => {
          console.log(`✅ Imagen del header verificada - Dimensiones: ${testImg.width}x${testImg.height}`);
          resolve();
        };
        testImg.onerror = (error) => {
          console.error('❌ Error verificando imagen del header:', error);
          reject(error);
        };
        testImg.src = headerUrl;
      });
    } catch (error) {
      console.error('❌ No se pudo cargar la imagen del header:', error);
      return;
    }
    
    // Crear HTML de prueba con el mismo formato que usa la función principal
    const testHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Header Ladrillazos - Impresión</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          @media print {
            * {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            img[alt="Header Ladrillazos"] {
              display: block !important;
              opacity: 1 !important;
              visibility: visible !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
              z-index: 999 !important;
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div style="
          position: relative; 
          width: 100%; 
          height: 200px; 
          overflow: hidden; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
        ">
          <img src="${headerUrl}" 
               style="
                 width: 100%; 
                 height: 100%; 
                 object-fit: cover; 
                 object-position: center;
                 display: block !important;
                 print-color-adjust: exact !important;
                 -webkit-print-color-adjust: exact !important;
                 color-adjust: exact !important;
                 position: absolute !important;
                 top: 0 !important;
                 left: 0 !important;
                 z-index: 999 !important;
                 opacity: 1 !important;
                 visibility: visible !important;
               " 
               alt="Header Ladrillazos"
               onload="console.log('✅ Header cargado en test'); this.style.display='block';"
               onerror="console.warn('⚠️ Error en header test'); this.style.display='none';" />
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
            font-weight: bold;
            font-size: 32px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 998;
            pointer-events: none;
          ">
            LADRILLAZOS
          </div>
        </div>
        
        <div style="padding: 20px;">
          <h1>Test del Header de Ladrillazos</h1>
          <p><strong>URL:</strong> ${headerUrl}</p>
          <p><strong>Instrucciones:</strong> Presiona Ctrl+P para ver la vista previa de impresión</p>
          <p><strong>Esperado:</strong> Deberías ver la imagen de textura de ladrillos en el header</p>
        </div>
        
        <script>
          console.log('🧪 Test específico del header iniciado');
          
          // Verificar que la imagen se carga
          const headerImg = document.querySelector('img[alt="Header Ladrillazos"]');
          if (headerImg) {
            console.log('📍 Imagen del header encontrada en DOM');
            console.log('📊 Estado inicial:', {
              complete: headerImg.complete,
              naturalWidth: headerImg.naturalWidth,
              naturalHeight: headerImg.naturalHeight,
              src: headerImg.src
            });
            
            if (headerImg.complete && headerImg.naturalWidth > 0) {
              console.log('✅ Imagen ya cargada completamente');
            } else {
              console.log('⏳ Esperando carga de imagen...');
            }
          }
          
          // Función para verificar estado de la imagen
          window.checkImageStatus = function() {
            const img = document.querySelector('img[alt="Header Ladrillazos"]');
            if (img) {
              console.log('📊 Estado actual de la imagen:', {
                complete: img.complete,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                display: img.style.display,
                opacity: img.style.opacity,
                visibility: img.style.visibility
              });
            }
          };
          
          console.log('💡 Tip: Ejecuta checkImageStatus() en la consola para verificar el estado');
        </script>
      </body>
      </html>
    `;
    
    // Abrir ventana de prueba
    const testWindow = window.open('', '_blank', 'width=1000,height=700');
    if (testWindow) {
      testWindow.document.write(testHTML);
      testWindow.document.close();
      console.log('✅ Test específico del header creado');
      console.log('💡 Presiona Ctrl+P en la nueva ventana para ver la vista previa de impresión');
    } else {
      console.error('❌ No se pudo abrir ventana de prueba');
    }
  }

  /**
   * Ajustar el cartel para que se renderice a tamaño completo en impresión
   */
  private static adjustCartelScale(cartelHTML: string, product: Product): string {
    try {
      console.log(`📏 PrintService: Forzando tamaño completo del cartel para ${product.name}`);
      
      // FORZAR TAMAÑO COMPLETO - Eliminar cualquier scale pequeño
      cartelHTML = cartelHTML.replace(
        /scale-\[0\.6\]/g,
        'scale-100'
      );
      
      cartelHTML = cartelHTML.replace(
        /scale-\[0\.65\]/g,
        'scale-100'
      );
      
      // Aumentar los tamaños mínimos para que el cartel sea más grande
      cartelHTML = cartelHTML.replace(
        /min-w-\[500px\]/g,
        'min-w-[800px]'
      );
      
      cartelHTML = cartelHTML.replace(
        /min-w-\[450px\]/g,
        'min-w-[700px]'
      );
      
      cartelHTML = cartelHTML.replace(
        /min-w-\[400px\]/g,
        'min-w-[600px]'
      );
      
      // Aumentar alturas mínimas
      cartelHTML = cartelHTML.replace(
        /min-h-\[750px\]/g,
        'min-h-[900px]'
      );
      
      cartelHTML = cartelHTML.replace(
        /min-h-\[500px\]/g,
        'min-h-[700px]'
      );
      
      // Forzar que el contenedor principal use tamaño completo
      cartelHTML = cartelHTML.replace(
        /class="w-full h-full flex items-center justify-center bg-white"/g,
        'class="w-full h-full flex items-center justify-center bg-white" style="min-width: 800px; min-height: 1000px; transform: scale(1.3); transform-origin: center center;"'
      );
      
      // Si no se aplicó el estilo anterior, buscar otros patrones comunes
      if (!cartelHTML.includes('transform: scale(1.3)')) {
        cartelHTML = cartelHTML.replace(
          /class="([^"]*w-full[^"]*h-full[^"]*)"/g,
          'class="$1" style="min-width: 800px; min-height: 1000px; transform: scale(1.3); transform-origin: center center;"'
        );
      }
      
      console.log(`✅ PrintService: Cartel ajustado para tamaño completo (escala 1.3x)`);
      return cartelHTML;
    } catch (error) {
      console.error('❌ PrintService: Error ajustando cartel:', error);
      return cartelHTML;
    }
  }
}

// Hacer PrintService disponible globalmente para debugging
if (typeof window !== 'undefined') {
  (window as any).PrintService = PrintService;
} 