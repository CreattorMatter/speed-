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
   * Generar HTML para impresión con formato mejorado tipo cartel
   */
  private static async generatePrintHTML(carteles: PrintableCartel[], config: PrintConfiguration): Promise<string> {
    try {
      console.log(`📄 PrintService: Generando HTML de impresión para ${carteles.length} carteles`);

      // Obtener el formato de papel
      const paperFormat = config.formatoSeleccionado || { 
        label: 'A4', 
        width: '210mm', 
        height: '297mm' 
      };

      // Generar header una sola vez
      const headerHTML = this.generatePrintHeader();

      let cartelesHTML = '';

      // Generar HTML para cada cartel con formato mejorado
      for (let index = 0; index < carteles.length; index++) {
        const cartel = carteles[index];
        
        try {
          console.log(`🎨 PrintService: Renderizando cartel ${index + 1}/${carteles.length} - ${cartel.product.name}`);
          
          // Renderizar el componente React a HTML string
          const componentHTML = renderToString(
            React.createElement(cartel.templateComponent, {
              ...cartel.templateProps,
              key: `print-${cartel.id}-${index}`
            })
          );

          // Envolver cada cartel en un contenedor profesional con estilo de cartel
          const cartelHTML = `
            <div class="cartel-page" style="
              page-break-after: ${index < carteles.length - 1 ? 'always' : 'auto'};
              width: 100%;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              padding: 20mm;
              box-sizing: border-box;
              position: relative;
            ">
              <!-- Marco decorativo del cartel -->
              <div style="
                position: absolute;
                top: 15mm;
                left: 15mm;
                right: 15mm;
                bottom: 15mm;
                border: 3px solid #e2e8f0;
                border-radius: 12px;
                background: white;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
              "></div>
              
              <!-- Header del cartel individual -->
              <div style="
                position: absolute;
                top: 20mm;
                left: 20mm;
                right: 20mm;
                background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
                color: white;
                padding: 8mm;
                border-radius: 8px;
                text-align: center;
                font-family: 'Arial', sans-serif;
                font-weight: bold;
                font-size: 14pt;
                z-index: 10;
                box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
              ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>CARTEL #${index + 1}</span>
                  <span style="font-size: 10pt; opacity: 0.9;">${cartel.product.sku || 'SKU'}</span>
                </div>
              </div>
              
              <!-- Contenedor principal del cartel -->
              <div style="
                position: relative;
                z-index: 5;
                background: white;
                border-radius: 8px;
                padding: 15mm;
                margin: 25mm 20mm 20mm 20mm;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                border: 2px solid #f1f5f9;
                width: calc(100% - 40mm);
                max-width: 160mm;
                min-height: 180mm;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
              ">
                ${this.adjustCartelScale(componentHTML, cartel.product)}
              </div>
              
              <!-- Footer con información del producto -->
              <div style="
                position: absolute;
                bottom: 20mm;
                left: 20mm;
                right: 20mm;
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                padding: 6mm;
                text-align: center;
                font-family: 'Arial', sans-serif;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              ">
                <div style="font-size: 12pt; font-weight: bold; color: #1e293b; margin-bottom: 2mm;">
                  ${cartel.product.name}
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 10pt; color: #64748b;">
                  <span><strong>Categoría:</strong> ${cartel.product.category}</span>
                  <span><strong>Precio:</strong> $${cartel.product.price?.toLocaleString()}</span>
                </div>
              </div>
              
              <!-- Marcas de corte (solo visible en impresión) -->
              <div style="
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                pointer-events: none;
              ">
                <!-- Esquinas de corte -->
                <div style="position: absolute; top: 5mm; left: 5mm; width: 5mm; height: 5mm; border-top: 1px solid #94a3b8; border-left: 1px solid #94a3b8;"></div>
                <div style="position: absolute; top: 5mm; right: 5mm; width: 5mm; height: 5mm; border-top: 1px solid #94a3b8; border-right: 1px solid #94a3b8;"></div>
                <div style="position: absolute; bottom: 5mm; left: 5mm; width: 5mm; height: 5mm; border-bottom: 1px solid #94a3b8; border-left: 1px solid #94a3b8;"></div>
                <div style="position: absolute; bottom: 5mm; right: 5mm; width: 5mm; height: 5mm; border-bottom: 1px solid #94a3b8; border-right: 1px solid #94a3b8;"></div>
              </div>
            </div>
          `;

          cartelesHTML += cartelHTML;
          
        } catch (cartelError) {
          console.error(`❌ PrintService: Error renderizando cartel ${index + 1}:`, cartelError);
          
          // Cartel de error con diseño profesional
          const errorCartelHTML = `
            <div class="cartel-page" style="
              page-break-after: ${index < carteles.length - 1 ? 'always' : 'auto'};
              width: 100%;
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
              padding: 20mm;
              box-sizing: border-box;
            ">
              <div style="
                background: white;
                border: 3px solid #fca5a5;
                border-radius: 12px;
                padding: 20mm;
                text-align: center;
                font-family: 'Arial', sans-serif;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                max-width: 160mm;
              ">
                <div style="color: #dc2626; font-size: 24pt; font-weight: bold; margin-bottom: 5mm;">
                  ⚠️ Error en Cartel
                </div>
                <div style="color: #7f1d1d; font-size: 14pt; margin-bottom: 3mm;">
                  ${cartel.product.name}
                </div>
                <div style="color: #991b1b; font-size: 12pt;">
                  No se pudo generar el cartel correctamente
                </div>
                <div style="color: #b91c1c; font-size: 10pt; margin-top: 5mm;">
                  SKU: ${cartel.product.sku || 'N/A'} • Precio: $${cartel.product.price?.toLocaleString()}
                </div>
              </div>
            </div>
          `;
          
          cartelesHTML += errorCartelHTML;
        }
      }

      // HTML completo con estilos mejorados para impresión
      const fullHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Carteles para Impresión - ${carteles.length} carteles</title>
          <style>
            /* Reset y estilos base */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', 'Arial', sans-serif;
              line-height: 1.4;
              background: white;
              color: #1e293b;
            }
            
            /* Estilos específicos para impresión */
            @media print {
              @page {
                size: ${paperFormat.width} ${paperFormat.height};
                margin: 0;
              }
              
              body {
                margin: 0;
                padding: 0;
                background: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .cartel-page {
                page-break-after: always;
                height: ${paperFormat.height} !important;
                width: ${paperFormat.width} !important;
              }
              
              .cartel-page:last-child {
                page-break-after: auto;
              }
              
              /* Asegurar que todo el contenido sea visible */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            
            /* Estilos para vista previa en pantalla */
            @media screen {
              body {
                background: #f1f5f9;
                padding: 20px;
              }
              
              .cartel-page {
                margin: 0 auto 30px auto;
                border: 1px solid #e2e8f0;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              }
            }
            
            /* Estilos específicos para elementos del cartel */
            .cartel-content {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
            }
            
            /* Asegurar que las imágenes se muestren correctamente */
            img {
              max-width: 100%;
              height: auto;
              display: block;
            }
            
            /* Estilos para texto */
            .cartel-text {
              text-align: center;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
          </style>
        </head>
        <body>
          ${cartelesHTML}
        </body>
        </html>
      `;

      console.log('✅ PrintService: HTML de impresión generado exitosamente');
      return fullHTML;

    } catch (error) {
      console.error('❌ PrintService: Error generando HTML de impresión:', error);
      throw new Error(`Error generando HTML para impresión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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