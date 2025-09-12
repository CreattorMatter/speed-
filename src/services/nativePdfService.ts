import jsPDF from 'jspdf';
import { TemplateV3, DraggableComponentV3 } from '../features/builderV3/types/index';
import { ProductoReal } from '../types/product';
import { getDynamicFieldValue } from '../utils/productFieldsMap';
import { formatValidityPeriod } from '../utils/validityPeriodValidator';

export interface NativePdfGenerationOptions {
  dpi?: number;
  quality?: 'draft' | 'standard' | 'high' | 'print';
  colorProfile?: 'sRGB' | 'CMYK';
}

export interface PdfGenerationResult {
  blob: Blob;
  pages: number;
  size: number;
  quality: string;
}

/**
 * 🚀 NATIVE PDF SERVICE - Generación de PDFs vectoriales de alta calidad
 * 
 * Esta clase genera PDFs directamente desde los datos del template,
 * eliminando la pixelación y dependencia de capturas de pantalla.
 */
export class NativePdfService {
  private static readonly DEFAULT_DPI = 300;
  private static readonly PX_TO_MM = 0.264583333; // Conversión precisa px a mm
  
  private static readonly FONT_FAMILIES = {
    'Arial': 'helvetica',
    'Helvetica': 'helvetica', 
    'Times': 'times',
    'Courier': 'courier',
    'Georgia': 'times',
    'Verdana': 'helvetica',
    'Tahoma': 'helvetica'
  };

  /**
   * Genera un PDF de alta calidad desde múltiples templates
   */
  static async generatePdfFromTemplates(
    templates: TemplateV3[],
    products: ProductoReal[],
    productChanges: Record<string, any> = {},
    financingCuotas: number = 0,
    discountPercent: number = 0,
    options: NativePdfGenerationOptions = {}
  ): Promise<PdfGenerationResult> {
    console.log('🎯 Iniciando generación PDF nativo de alta calidad');
    
    const startTime = performance.now();
    const opts = this.getDefaultOptions(options);
    
    try {
      // Crear documento PDF con configuración de alta calidad
      const pdf = new jsPDF({
        orientation: 'landscape', // A4 horizontal
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 16, // Máxima precisión para vectores
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });

      let pageCount = 0;

      // Procesar cada template
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        const product = products[i];
        
        console.log(`📄 Procesando página ${i + 1}/${templates.length}`);
        
        if (i > 0) {
          // Asegurar que las páginas siguientes mantengan A4 horizontal
          pdf.addPage('a4', 'landscape');

        }

        pageCount++;

        // Renderizar template como PDF nativo
        await this.renderTemplateToNativePdf(
          pdf, 
          template, 
          product, 
          productChanges, 
          financingCuotas, 
          discountPercent,
          opts
        );
      }

      // Generar blob final
      const pdfBlob = pdf.output('blob');
      const endTime = performance.now();
      
      console.log(`✅ PDF nativo generado: ${pageCount} páginas en ${Math.round(endTime - startTime)}ms`);
      
      return {
        blob: pdfBlob,
        pages: pageCount,
        size: pdfBlob.size,
        quality: opts.quality
      };

    } catch (error) {
      console.error('❌ Error generando PDF nativo:', error);
      throw new Error(`Error en generación PDF nativa: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Renderiza un template individual como PDF nativo
   */
  private static async renderTemplateToNativePdf(
    pdf: jsPDF,
    template: TemplateV3,
    product: ProductoReal,
    productChanges: Record<string, any>,
    financingCuotas: number,
    discountPercent: number,
    options: Required<NativePdfGenerationOptions>
  ): Promise<void> {
    
    // 🎯 CONFIGURACIÓN PRECISA DE ESCALADO Y POSICIONAMIENTO
    
    // Tomar tamaño REAL de la página según la orientación actual
    const pageWidth = (pdf as any).internal.pageSize.getWidth();
    const pageHeight = (pdf as any).internal.pageSize.getHeight();

    // Configurar fondo si existe
    if (template.canvas.backgroundColor && template.canvas.backgroundColor !== 'transparent') {
      const bgColor = this.hexToRgb(template.canvas.backgroundColor);
      pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    // Calcular escalado para ocupar TODA la hoja A4 sin márgenes
    const templateWidthMM = template.canvas.width * this.PX_TO_MM;
    const templateHeightMM = template.canvas.height * this.PX_TO_MM;
    
    const scaleX = pageWidth / templateWidthMM;
    const scaleY = pageHeight / templateHeightMM;
    
    // Ajuste para que SE VEA TODO el contenido (sin recortes)
    const scale = Math.min(scaleX, scaleY);
    
    // Calcular offset para centrar perfectamente
    const scaledWidth = templateWidthMM * scale;
    const scaledHeight = templateHeightMM * scale;
    const offsetX = (pageWidth - scaledWidth) / 2;
    const offsetY = (pageHeight - scaledHeight) / 2;
    
    console.log(`📐 Escalado preciso: ${scale.toFixed(4)}x, Offset: (${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})mm`);

    // Renderizar cada componente ORDENADO por z-index (fondo → frente)
    const componentsOrdered = [...template.defaultComponents].sort(
      (a, b) => (a.position?.z || 0) - (b.position?.z || 0)
    );
    for (const component of componentsOrdered) {
      // Respetar visibilidad del componente
      if (component.isVisible === false) continue;
      await this.renderComponentToNativePdf(
        pdf,
        component,
        product,
        productChanges,
        financingCuotas,
        discountPercent,
        scale,
        offsetX,
        offsetY,
        options
      );
    }
  }

  /**
   * Renderiza un componente individual como elemento PDF nativo
   */
  private static async renderComponentToNativePdf(
    pdf: jsPDF,
    component: DraggableComponentV3,
    product: ProductoReal,
    productChanges: Record<string, any>,
    financingCuotas: number,
    discountPercent: number,
    scale: number,
    offsetX: number,
    offsetY: number,
    options: Required<NativePdfGenerationOptions>
  ): Promise<void> {
    
    // 📏 CÁLCULO PRECISO DE POSICIÓN Y TAMAÑO
    const componentX = (component.position?.x || 0) * this.PX_TO_MM;
    const componentY = (component.position?.y || 0) * this.PX_TO_MM;
    const componentWidth = (component.size?.width || 100) * this.PX_TO_MM;
    const componentHeight = (component.size?.height || 100) * this.PX_TO_MM;
    
    // Aplicar escalado y offset para posicionamiento perfecto
    const x = offsetX + (componentX * scale);
    const y = offsetY + (componentY * scale);
    const width = componentWidth * scale;
    const height = componentHeight * scale;

    try {
      switch (component.type) {
        case 'field-dynamic-text':
          await this.renderTextComponent(pdf, component, product, productChanges, financingCuotas, discountPercent, x, y, width, height, scale, options);
          break;
          
        case 'image-header':
        case 'image-footer':
        case 'image-background':
        case 'image-product':
        case 'image-brand-logo':
        case 'image-decorative':
        case 'image-financing':
        case 'image-dynamic':
          await this.renderImageComponent(pdf, component, x, y, width, height, options);
          break;
          
        case 'shape-geometric':
          await this.renderShapeComponent(pdf, component, x, y, width, height, options);
          break;
          
        case 'decorative-line':
          await this.renderLineComponent(pdf, component, x, y, width, height, options);
          break;

        case 'decorative-icon':
          await this.renderIconComponent(pdf, component, x, y, width, height, options);
          break;

        case 'container-flexible':
        case 'container-grid':
          await this.renderContainerComponent(pdf, component, x, y, width, height, options);
          break;
          
        case 'qr-dynamic':
          await this.renderQRComponent(pdf, component, x, y, width, height, options);
          break;
          
        default:
          console.warn(`⚠️ Tipo de componente no soportado para PDF nativo: ${component.type}`);
      }
    } catch (error) {
      console.error(`❌ Error renderizando componente ${component.type}:`, error);
      // Continuar con otros componentes en caso de error
    }
  }

  /**
   * Renderiza componente de texto con tipografía nativa
   */
  private static async renderTextComponent(
    pdf: jsPDF,
    component: DraggableComponentV3,
    product: ProductoReal,
    productChanges: Record<string, any>,
    financingCuotas: number,
    discountPercent: number,
    x: number,
    y: number,
    width: number,
    height: number,
    scale: number,
    _options: Required<NativePdfGenerationOptions>
  ): Promise<void> {
    
    const style = component.style;
    const content = component.content;
    // Aplicar padding del contenedor al área disponible de texto
    const pad = style?.spacing?.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const padLeftMm = (pad.left || 0) * this.PX_TO_MM * scale;
    const padRightMm = (pad.right || 0) * this.PX_TO_MM * scale;
    const padTopMm = (pad.top || 0) * this.PX_TO_MM * scale;
    const padBottomMm = (pad.bottom || 0) * this.PX_TO_MM * scale;
    const contentX = x + padLeftMm;
    const contentY = y + padTopMm;
    const contentWidth = Math.max(0, width - padLeftMm - padRightMm);
    const contentHeight = Math.max(0, height - padTopMm - padBottomMm);
    
    // Obtener texto dinámico
    let text = '';
    if (content?.fieldType === 'dynamic' && content?.dynamicTemplate) {
      text = this.processDynamicText(content.dynamicTemplate, product, productChanges, financingCuotas, discountPercent, content);
    } else if (content?.staticValue) {
      text = content.staticValue;
    } else if (content?.text) {
      text = content.text;
    }

    // textConfig (precio, sku, marca, etc.)
    if (!text && (content as any)?.textConfig?.contentType) {
      text = this.resolveTextFromTextConfig(content, product, financingCuotas, discountPercent);
    }

    // sap-product (lectura directa por campo)
    if (!text && (content as any)?.fieldType === 'sap-product' && (content as any)?.sapConnection?.fieldName) {
      const field = (content as any).sapConnection.fieldName;
      const direct = (product as any)?.[field];
      text = direct !== undefined && direct !== null ? String(direct) : String(getDynamicFieldValue(field, product, {}, financingCuotas, discountPercent) ?? '');
    }

    // promotion-data (si hubiera un campo mapeado)
    if (!text && (content as any)?.fieldType === 'promotion-data' && (content as any)?.promotionConnection?.fieldName) {
      const field = (content as any).promotionConnection.fieldName;
      // Reutilizar getDynamicFieldValue como fallback genérico
      const v = getDynamicFieldValue(field, product, {}, financingCuotas, discountPercent);
      text = v !== undefined && v !== null ? String(v) : '';
    }

    // calculatedField
    if (!text && (content as any)?.fieldType === 'calculated' && (content as any)?.calculatedField?.expression) {
      const calc = this.evaluateCalculatedExpression((content as any).calculatedField.expression, product, financingCuotas, discountPercent);
      text = typeof calc === 'number' ? calc.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : String(calc);
    }

    // dateConfig validity-period directo
    if (!text && (content as any)?.dateConfig?.type === 'validity-period') {
      try {
        const dc = (content as any).dateConfig;
        if (dc?.startDate && dc?.endDate) {
          text = formatValidityPeriod({ startDate: dc.startDate, endDate: dc.endDate }, true);
        }
      } catch {}
    }

    // Si el texto aún contiene placeholders, procesarlos
    if (text && text.includes('[') && text.includes(']')) {
      text = this.processDynamicText(text, product, productChanges, financingCuotas, discountPercent, content);
    }

    if (!text) return;

    // Fondo y borde del contenedor del texto (si corresponde)
    const bg = style?.color?.backgroundColor;
    const hasBg = bg && bg !== 'transparent';
    const borderW = style?.border?.width || 0;
    const radiusPx = style?.border?.radius?.topLeft || 0;
    const radiusMm = Math.max(0, radiusPx * this.PX_TO_MM * scale);
    if (hasBg) {
      const bgRGB = this.hexToRgb(bg as string);
      pdf.setFillColor(bgRGB.r, bgRGB.g, bgRGB.b);
      if (radiusMm > 0 && (pdf as any).roundedRect) {
        (pdf as any).roundedRect(x, y, width, height, radiusMm, radiusMm, 'F');
      } else {
        pdf.rect(x, y, width, height, 'F');
      }
    }
    if (borderW > 0) {
      const bc = this.hexToRgb(style?.border?.color || '#000000');
      pdf.setDrawColor(bc.r, bc.g, bc.b);
      pdf.setLineWidth(borderW * this.PX_TO_MM);
      if (radiusMm > 0 && (pdf as any).roundedRect) {
        (pdf as any).roundedRect(x, y, width, height, radiusMm, radiusMm, hasBg ? 'D' : 'D');
      } else {
        pdf.rect(x, y, width, height, 'D');
      }
    }

    // 🎨 CONFIGURACIÓN PRECISA DE TIPOGRAFÍA
    const requestedFamily = style?.typography?.fontFamily || 'Arial';
    const fontFamily = this.mapFontFamily(requestedFamily);
    // Calcular tamaño de fuente respetando exactamente el diseño original
    const originalFontSize = style?.typography?.fontSize || 16;
    // Conversión más precisa: px -> pt (1px = 0.75pt aproximadamente)
    let fontSizePt = Math.max(6, originalFontSize * scale * 0.75);
    // Mapear peso y estilo de fuente (normal/bold + normal/italic)
    const fw = (style?.typography?.fontWeight ?? 'normal') as string | number;
    const fs = style?.typography?.fontStyle ?? 'normal';
    const asNumber = typeof fw === 'string' && /\d+/.test(fw) ? parseInt(fw, 10) : fw;
    const weightName = (typeof asNumber === 'number')
      ? (asNumber >= 700 ? 'bold' : 'normal')
      : ((fw === 'bold') ? 'bold' : 'normal');
    let fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal';
    if (weightName === 'bold' && (fs === 'italic' || fs === 'oblique')) fontStyle = 'bolditalic';
    else if (weightName === 'bold') fontStyle = 'bold';
    else if (fs === 'italic' || fs === 'oblique') fontStyle = 'italic';
    const lineFactor = style?.typography?.lineHeight || 1.2;
    const ptToMm = 0.352777778; // 1pt = 0.3528mm
    // letter-spacing del Builder (px) → pt (y con escala)
    const letterSpacingPx = style?.typography?.letterSpacing ?? 0;
    const charSpacePt = (letterSpacingPx || 0) * scale * 0.75;
    // Rotación por componente (grados)
    const rotation = (component.position?.rotation || 0);
    // Simular peso extra (black) solo para >= 900 (más sutil)
    const isHeavy = (typeof asNumber === 'number') ? (asNumber >= 900) : (fw === '900');
    
    // Auto-fit por altura del contenedor (para precios grandes)
    const maxLineHeightPt = (height / ptToMm); // altura disponible en pt
    if (fontSizePt * lineFactor > maxLineHeightPt) {
      fontSizePt = Math.max(6, maxLineHeightPt / lineFactor);
    }
    
    pdf.setFont(fontFamily, fontStyle);
    pdf.setFontSize(fontSizePt);

    // Configurar color
    if (style?.color?.color) {
      const color = this.hexToRgb(style.color.color);
      pdf.setTextColor(color.r, color.g, color.b);
    }

    // Configurar alineación
    const align = this.mapTextAlign(style?.typography?.textAlign || 'left');
    
    // Transformaciones de texto
    const transform = style?.typography?.textTransform || 'none';
    if (transform === 'uppercase') text = text.toUpperCase();
    else if (transform === 'lowercase') text = text.toLowerCase();
    else if (transform === 'capitalize') text = text.replace(/\b\w/g, l => l.toUpperCase());

    // Detectar si es un texto numérico grande (precio) → ajustar por ancho
    // Incluir dígitos superíndice: ⁰¹²³⁴⁵⁶⁷⁸⁹ y exigir al menos un dígito
    const isNumberLike = /^\s*[\$]?\s*(?=.*[\d⁰¹²³⁴⁵⁶⁷⁸⁹])[\s\d.,⁰¹²³⁴⁵⁶⁷⁸⁹]+\s*$/.test(text);
    
    // Alturas en mm
    const lineHeightMm = (fontSizePt * lineFactor) * ptToMm;
    
    // Helper de pintado con simulación de grosor pesado
    const draw = (t: string, tx: number, ty: number) => {
      pdf.text(t, tx, ty, { align, charSpace: charSpacePt, angle: rotation as any });
      if (isHeavy) {
        const delta = Math.max(0.03, (fontSizePt * ptToMm) * 0.01); // ~1% del alto de fuente
        // Overprint horizontal sutil para aumentar grosor visual
        pdf.text(t, tx + delta, ty, { align, charSpace: charSpacePt, angle: rotation as any });
        pdf.text(t, tx - delta, ty, { align, charSpace: charSpacePt, angle: rotation as any });
      }
    };

    if (isNumberLike) {
      // Ajuste a ancho: medir y escalar si excede
      const measureWidthMm = () => {
        // jsPDF devuelve en la unidad del documento (mm)
        const base = pdf.getTextWidth(text);
        const extra = Math.max(0, (text.length - 1)) * (charSpacePt * ptToMm);
        return base + extra;
      };
      let wmm = measureWidthMm();
      if (wmm > width && wmm > 0) {
        const scaleFactor = width / wmm;
        fontSizePt = Math.max(6, fontSizePt * scaleFactor);
        pdf.setFontSize(fontSizePt);
      }
      // Compensación sutil de tamaño para equiparar al render del navegador
      // (las métricas de fuentes core PDF vs. navegador suelen diferir levemente)
      if (wmm <= width) {
        const cssComp = 0.96; // ~4% más chico para igualar "Imprimir" del Editor
        fontSizePt = Math.max(6, fontSizePt * cssComp);
        pdf.setFontSize(fontSizePt);
      }
      // Recalcular métricas en mm con baseline similar a CSS
      const extraLeadingPt2 = Math.max(0, (fontSizePt * lineFactor) - fontSizePt);
      const baselineOffsetMm2 = ((fontSizePt * 0.8) + (extraLeadingPt2 / 2)) * ptToMm;
      let textY = contentY + Math.min(baselineOffsetMm2, Math.max(0, contentHeight - 0.1));
      let textX = contentX;
      if (align === 'center') textX = contentX + contentWidth / 2;
      else if (align === 'right') textX = contentX + contentWidth;
      draw(text, textX, textY);
    } else {
      // Renderizado multi-línea normal
      const lines = pdf.splitTextToSize(text, contentWidth);
      // Baseline estilo CSS: ascent (~0.8*fontSize) + half leading
      const extraLeadingPt = Math.max(0, (fontSizePt * lineFactor) - fontSizePt);
      const baselineOffsetMm = ((fontSizePt * 0.8) + (extraLeadingPt / 2)) * ptToMm;
      let textY = contentY + Math.min(baselineOffsetMm, Math.max(0, contentHeight - 0.1));
      for (let i = 0; i < lines.length && textY <= y + height; i++) {
        let textX = contentX;
        if (align === 'center') textX = contentX + contentWidth / 2;
        else if (align === 'right') textX = contentX + contentWidth;
        draw(lines[i], textX, textY);
        textY += lineHeightMm;
      }
    }
  }

  /**
   * Renderiza componente de imagen con calidad optimizada
   */
  private static async renderImageComponent(
    pdf: jsPDF,
    component: DraggableComponentV3,
    x: number,
    y: number,
    width: number,
    height: number,
    _options: Required<NativePdfGenerationOptions>
  ): Promise<void> {
    
    const imageUrl = component.content?.imageUrl;
    
    if (!imageUrl) {
      // Renderizar placeholder
      pdf.setFillColor(240, 240, 240);
      pdf.rect(x, y, width, height, 'F');
      pdf.setTextColor(128, 128, 128);
      pdf.setFontSize(10);
      pdf.text('Imagen', x + width/2, y + height/2, { align: 'center' });
      return;
    }

    try {
      // 🖼️ CARGA Y RENDERIZADO DE IMAGEN RESPETANDO PROPORCIÓN
      const { dataUrl, width: iw, height: ih } = await this.loadImageWithMeta(imageUrl);
      const format = this.getImageFormat(imageUrl);

      // Determinar object-fit según tipo
      const objectFit = component.type === 'image-background' ? 'cover' : 'contain';
      const containerW = width;
      const containerH = height;

      const imageRatio = iw / ih;
      const containerRatio = containerW / containerH;

      let drawW = containerW;
      let drawH = containerH;
      if (objectFit === 'contain') {
        if (imageRatio > containerRatio) {
          // image wider
          drawW = containerW;
          drawH = containerW / imageRatio;
        } else {
          drawH = containerH;
          drawW = containerH * imageRatio;
        }
      } else { // cover
        if (imageRatio > containerRatio) {
          // image wider: height fits, width overflows
          drawH = containerH;
          drawW = containerH * imageRatio;
        } else {
          // image taller: width fits, height overflows
          drawW = containerW;
          drawH = containerW / imageRatio;
        }
      }

      const dx = x + (containerW - drawW) / 2;
      const dy = y + (containerH - drawH) / 2;

      pdf.addImage(dataUrl, format, dx, dy, drawW, drawH, undefined, 'FAST');

    } catch (error) {
      console.warn('⚠️ Error cargando imagen:', imageUrl, error);
      // Renderizar placeholder profesional
      pdf.setFillColor(245, 245, 245);
      pdf.rect(x, y, width, height, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(x, y, width, height, 'D');
      
      // Texto de placeholder
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text('Imagen', x + width/2, y + height/2, { align: 'center' });
    }
  }

  /**
   * Renderiza componente de forma geométrica con precisión vectorial
   */
  private static async renderShapeComponent(
    pdf: jsPDF,
    component: DraggableComponentV3,
    x: number,
    y: number,
    width: number,
    height: number,
    _options: Required<NativePdfGenerationOptions>
  ): Promise<void> {
    
    const style = component.style;
    
    // 🎨 CONFIGURACIÓN PRECISA DE COLORES Y BORDES
    if (style?.color?.backgroundColor) {
      const color = this.hexToRgb(style.color.backgroundColor);
      pdf.setFillColor(color.r, color.g, color.b);
    }
    
    if (style?.border?.color && style?.border?.width > 0) {
      const borderColor = this.hexToRgb(style.border.color);
      pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
      // Convertir ancho de borde de px a mm con precisión
      const borderWidthMM = style.border.width * this.PX_TO_MM;
      pdf.setLineWidth(borderWidthMM);
    }

    // 🔷 RENDERIZADO DE FORMAS GEOMÉTRICAS VECTORIALES
    const shapeType = component.content?.shapeConfig?.type || 'rectangle';
    
    // Determinar estilo de relleno
    const hasFill = style?.color?.backgroundColor;
    const hasBorder = style?.border?.width > 0;
    const fillStyle = hasFill ? (hasBorder ? 'FD' : 'F') : (hasBorder ? 'D' : 'n');
    
    switch (shapeType) {
      case 'rectangle':
        pdf.rect(x, y, width, height, fillStyle);
        break;
        
      case 'circle':
        const radius = Math.min(width, height) / 2;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        pdf.circle(centerX, centerY, radius, fillStyle);
        break;
        
      case 'triangle':
        // Dibujar triángulo usando path para mayor precisión
        pdf.lines([
          [width/2, 0],
          [-width/2, height],
          [-width/2, -height],
          [width/2, 0]
        ], x, y, [1, 1], fillStyle, true);
        break;
        
      default:
        // Fallback a rectángulo
        pdf.rect(x, y, width, height, fillStyle);
    }
  }

  /**
   * Renderiza componente de línea decorativa
   */
  private static async renderLineComponent(
    pdf: jsPDF,
    component: DraggableComponentV3,
    x: number,
    y: number,
    width: number,
    height: number,
    _options: Required<NativePdfGenerationOptions>
  ): Promise<void> {
    
    const style = component.style;
    
    if (style?.border?.color) {
      const color = this.hexToRgb(style.border.color);
      pdf.setDrawColor(color.r, color.g, color.b);
    }
    
    // Configurar grosor de línea con precisión
    const lineWidthMM = (style?.border?.width || 1) * this.PX_TO_MM;
    pdf.setLineWidth(lineWidthMM);
    
    // Configurar estilo de línea (jsPDF no soporta setLineDash nativamente)
    const lineType = component.content?.lineConfig?.type || 'solid';

    const centerY = y + height / 2;
    if (lineType === 'dashed') {
      // Simular línea trazos
      const dashLength = 3;
      const gapLength = 3;
      let currentX = x;
      while (currentX < x + width) {
        const endX = Math.min(currentX + dashLength, x + width);
        pdf.line(currentX, centerY, endX, centerY);
        currentX = endX + gapLength;
      }
    } else if (lineType === 'dotted') {
      // Simular puntos
      const dotSpacing = 3;
      const dotRadius = Math.max(0.2, (style?.border?.width || 1) * this.PX_TO_MM * 0.5);
      for (let cx = x; cx <= x + width; cx += dotSpacing) {
        pdf.circle(cx, centerY, dotRadius, 'F');
      }
    } else if (lineType === 'double') {
      const gap = Math.max(0.8, (style?.border?.width || 1) * this.PX_TO_MM);
      pdf.line(x, centerY - gap, x + width, centerY - gap);
      pdf.line(x, centerY + gap, x + width, centerY + gap);
    } else {
      // Línea sólida normal
      pdf.line(x, centerY, x + width, centerY);
    }
  }

  /**
   * Renderiza ícono decorativo sencillo o desde SVG
   */
  private static async renderIconComponent(
    pdf: jsPDF,
    component: DraggableComponentV3,
    x: number,
    y: number,
    width: number,
    height: number,
    _options: Required<NativePdfGenerationOptions>
  ): Promise<void> {
    const icon = component.content?.iconConfig;
    const style = component.style;

    // Colores
    if (style?.color?.backgroundColor) {
      const c = this.hexToRgb(style.color.backgroundColor);
      pdf.setFillColor(c.r, c.g, c.b);
    }
    if (style?.border?.color) {
      const c = this.hexToRgb(style.border.color);
      pdf.setDrawColor(c.r, c.g, c.b);
    }

    // SVG personalizado
    if (icon?.type === 'custom' && icon?.customSvg) {
      try {
        const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(icon.customSvg)}`;
        const imageData = await this.loadImageAsBase64(svgDataUrl);
        pdf.addImage(imageData, 'PNG', x, y, width, height, undefined, 'FAST');
        return;
      } catch (e) {
        console.warn('Error renderizando SVG personalizado como imagen', e);
      }
    }

    // Íconos predefinidos simples
    const cx = x + width / 2;
    const cy = y + height / 2;
    const size = Math.min(width, height);
    switch (icon?.type) {
      case 'star': {
        const spikes = 5;
        const outerR = size / 2;
        const innerR = outerR * 0.5;
        const points: Array<[number, number]> = [];
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const ang = (Math.PI / spikes) * i - Math.PI / 2;
          points.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)]);
        }
        // Cerrar la estrella
        points.push(points[0]);
        const rel: Array<[number, number]> = points.slice(1).map((p, i) => [p[0] - points[i][0], p[1] - points[i][1]]);
        pdf.lines(rel as any, points[0][0], points[0][1], [1, 1], style?.border?.width ? 'FD' : 'F', true);
        break;
      }
      case 'heart': {
        // Aproximación usando texto Unicode
        const fontSize = size * 0.9;
        pdf.setFont(this.mapFontFamily('Helvetica'), 'normal');
        pdf.setFontSize(fontSize);
        pdf.text('❤', cx, cy + fontSize * 0.35 - size * 0.1, { align: 'center' });
        break;
      }
      case 'arrow': {
        const arrowLen = size * 0.7;
        const startX = cx - arrowLen / 2;
        const endX = cx + arrowLen / 2;
        pdf.line(startX, cy, endX, cy);
        // Punta
        pdf.lines([[ -size*0.15, -size*0.1 ], [ 0, 0.1*size ]], endX, cy, [1,1], 'D', true);
        break;
      }
      case 'check': {
        pdf.line(cx - size * 0.3, cy, cx - size * 0.1, cy + size * 0.2);
        pdf.line(cx - size * 0.1, cy + size * 0.2, cx + size * 0.3, cy - size * 0.2);
        break;
      }
      default: {
        // Fallback: círculo sólido
        pdf.circle(cx, cy, size / 2, style?.border?.width ? 'FD' : 'F');
      }
    }
  }

  /**
   * Renderiza contenedores (solo fondo y borde, sin layout)
   */
  private static async renderContainerComponent(
    pdf: jsPDF,
    component: DraggableComponentV3,
    x: number,
    y: number,
    width: number,
    height: number,
    _options: Required<NativePdfGenerationOptions>
  ): Promise<void> {
    const style = component.style;
    // Fondo
    if (style?.color?.backgroundColor && style.color.backgroundColor !== 'transparent') {
      const c = this.hexToRgb(style.color.backgroundColor);
      pdf.setFillColor(c.r, c.g, c.b);
      pdf.rect(x, y, width, height, 'F');
    }
    // Borde
    if (style?.border?.width && style.border.width > 0) {
      const c = this.hexToRgb(style.border.color || '#000000');
      pdf.setDrawColor(c.r, c.g, c.b);
      pdf.setLineWidth(style.border.width * this.PX_TO_MM);
      pdf.rect(x, y, width, height, 'D');
    }
  }

  /**
   * Renderiza componente QR (placeholder por ahora)
   */
  private static async renderQRComponent(
    pdf: jsPDF,
    _component: DraggableComponentV3,
    x: number,
    y: number,
    width: number,
    height: number,
    _options: Required<NativePdfGenerationOptions>
  ): Promise<void> {
    
    // Por ahora renderizar placeholder para QR
    pdf.setFillColor(240, 240, 240);
    pdf.rect(x, y, width, height, 'F');
    pdf.setTextColor(128, 128, 128);
    pdf.setFontSize(8);
    pdf.text('QR Code', x + width/2, y + height/2, { align: 'center' });
  }

  /**
   * Procesa texto dinámico con datos del producto
   */
  private static processDynamicText(
    template: string,
    product: ProductoReal,
    _productChanges: Record<string, any>,
    financingCuotas: number,
    discountPercent: number,
    content?: any
  ): string {
    
    let processed = template;
    const fieldRegex = /\[([^\]]+)\]/g;
    let match;

    // Intentar tomar el mismo esquema de formato que usa el Builder
    const outputFormat = (content as any)?.outputFormat ?? (content as any)?.textConfig?.outputFormat;

    while ((match = fieldRegex.exec(template)) !== null) {
      const fieldId = match[1];
      let value: any = '';

      // Mapeo de campos dinámicos
      switch (fieldId) {
        case 'product_name':
          value = product?.descripcion || 'Producto';
          break;
        case 'product_price':
          value = getDynamicFieldValue('product_price', product, outputFormat, financingCuotas, discountPercent);
          break;
        case 'product_sku':
          value = product?.sku || 'N/A';
          break;
        case 'cuota':
          value = getDynamicFieldValue('cuota', product, outputFormat, financingCuotas, discountPercent);
          break;
        case 'precio_cuota':
          value = getDynamicFieldValue('precio_cuota', product, outputFormat, financingCuotas, discountPercent);
          break;
        case 'descuento':
          value = getDynamicFieldValue('descuento', product, outputFormat, financingCuotas, discountPercent);
          break;
        case 'precio_descuento':
          value = getDynamicFieldValue('precio_descuento', product, outputFormat, financingCuotas, discountPercent);
          break;
        case 'discount_percentage':
          value = getDynamicFieldValue('discount_percentage', product, outputFormat, financingCuotas, discountPercent);
          break;
        case 'validity_period':
          try {
            if (content?.dateConfig?.type === 'validity-period' && content?.dateConfig?.startDate && content?.dateConfig?.endDate) {
              value = formatValidityPeriod({
                startDate: content.dateConfig.startDate,
                endDate: content.dateConfig.endDate
              }, true);
            } else {
              value = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
          } catch {
            value = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          }
          break;
        default:
          value = getDynamicFieldValue(fieldId, product, outputFormat, financingCuotas, discountPercent) || fieldId;
      }
      
      processed = processed.replace(match[0], String(value));
    }
    
    return processed;
  }

  // ==============================
  // Helpers de contenido de texto
  // ==============================
  private static resolveTextFromTextConfig(
    content: any,
    product: ProductoReal,
    financingCuotas: number,
    discountPercent: number
  ): string {
    const type = content?.textConfig?.contentType;
    const outputFormat = content?.textConfig?.outputFormat;
    switch (type) {
      case 'product-name':
        return product?.descripcion || '';
      case 'product-description':
        return product?.descripcion || '';
      case 'product-sku':
        return String(product?.sku ?? 'N/A');
      case 'product-brand':
        return product?.marcaTexto || '';
      case 'price-original':
      case 'price-final':
        return getDynamicFieldValue('product_price', product, outputFormat, financingCuotas, discountPercent);
      case 'price-discount': {
        return getDynamicFieldValue('precio_descuento', product, outputFormat, financingCuotas, discountPercent);
      }
      case 'discount-percentage':
        return getDynamicFieldValue('discount_percentage', product, outputFormat, financingCuotas, discountPercent);
      case 'price-without-taxes':
        return getDynamicFieldValue('price_without_tax', product, outputFormat, financingCuotas, discountPercent);
      case 'financing-text': {
        const cuota = financingCuotas || 0;
        if (cuota > 0) {
          // Mantener formato coherente con outputFormat
          const per = getDynamicFieldValue('precio_cuota', product, outputFormat, cuota, discountPercent);
          return `${cuota} cuotas de ${per}`;
        }
        return '';
      }
      default:
        return content?.textConfig?.fallbackText || '';
    }
  }

  private static evaluateCalculatedExpression(
    expression: string,
    product: ProductoReal,
    financingCuotas: number,
    discountPercent: number
  ): number | string {
    try {
      let expr = String(expression);
      const precio = product?.precio || 0;
      const precioAnt = (product as any)?.precioAnt || 0;
      const basePrice = (product as any)?.basePrice || 0;
      const stock = (product as any)?.stockDisponible || 0;
      const dto = discountPercent || 0;
      const cuota = financingCuotas || 0;
      const precioDto = dto > 0 ? Number((precio * (1 - dto / 100)).toFixed(2)) : precio;

      expr = expr.replace(/\[product_price\]/g, String(precio));
      expr = expr.replace(/\[price_previous\]/g, String(precioAnt));
      expr = expr.replace(/\[price_base\]/g, String(basePrice));
      expr = expr.replace(/\[stock_available\]/g, String(stock));
      expr = expr.replace(/\[discount_percentage\]/g, String(dto));
      expr = expr.replace(/\[cuota\]/g, String(cuota));
      expr = expr.replace(/\[precio_descuento\]/g, String(precioDto));

      // Validar caracteres permitidos
      if (!/^[0-9+\-*/().\s]+$/.test(expr)) return '0';
      // Evaluar de forma acotada
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expr})`)();
      if (typeof result === 'number' && isFinite(result)) return result;
      return '0';
    } catch {
      return '0';
    }
  }

  /**
   * Utilidades de conversión
   */

  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private static mapFontFamily(fontFamily: string): string {
    return this.FONT_FAMILIES[fontFamily as keyof typeof this.FONT_FAMILIES] || 'helvetica';
  }

  private static mapTextAlign(align: string): 'left' | 'center' | 'right' {
    switch (align) {
      case 'center': return 'center';
      case 'right': return 'right';
      default: return 'left';
    }
  }

  private static async loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear contexto 2D'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataURL);
      };
      
      img.onerror = () => reject(new Error('Error cargando imagen'));
      img.src = url;
    });
  }

  private static getImageFormat(url: string): 'JPEG' | 'PNG' | 'GIF' {
    const ext = url.toLowerCase().split('.').pop();
    switch (ext) {
      case 'png': return 'PNG';
      case 'gif': return 'GIF';
      default: return 'JPEG';
    }
  }

  // Cargar imagen y devolver dataUrl + dimensiones intrínsecas
  private static async loadImageWithMeta(url: string): Promise<{ dataUrl: string; width: number; height: number; }>{
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('No se pudo crear contexto 2D'));
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve({ dataUrl, width: canvas.width, height: canvas.height });
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Error cargando imagen con meta'));
      img.src = url;
    });
  }

  private static getDefaultOptions(options: NativePdfGenerationOptions): Required<NativePdfGenerationOptions> {
    return {
      dpi: options.dpi || this.DEFAULT_DPI,
      quality: options.quality || 'high',
      colorProfile: options.colorProfile || 'sRGB'
    };
  }
}
