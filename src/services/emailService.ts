import { EditedProduct, ProductChange } from '../hooks/useProductChanges';
import { getFieldDisplayName } from '../utils/validationUtils';

interface EmailReportData {
  plantillaFamily: string;
  plantillaType: string;
  editedProducts: EditedProduct[];
  reason: string;
  userEmail?: string;
  userName?: string;
  timestamp: Date;
}

export class EmailService {
  private static readonly API_ENDPOINT = '/api/send-report'; // Placeholder para endpoint real
  private static readonly RESPONSIBLE_EMAIL = 'responsable@empresa.com'; // Configurar email del responsable

  static async sendChangeReport(data: EmailReportData): Promise<boolean> {
    try {
      const emailContent = this.generateEmailContent(data);
      
      // Simular envío de email (reemplazar con implementación real)
      console.log('📧 Enviando reporte por email:', {
        to: this.RESPONSIBLE_EMAIL,
        subject: `Reporte de Cambios - ${data.plantillaFamily} / ${data.plantillaType}`,
        content: emailContent,
        attachments: this.generateReportAttachment(data)
      });

      // En producción, aquí iría la llamada real a la API de email
      // const response = await fetch(this.API_ENDPOINT, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     to: this.RESPONSIBLE_EMAIL,
      //     subject: `Reporte de Cambios - ${data.plantillaFamily} / ${data.plantillaType}`,
      //     html: emailContent,
      //     attachments: this.generateReportAttachment(data)
      //   })
      // });
      // return response.ok;

      // Simular éxito después de 1 segundo
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;

    } catch (error) {
      console.error('Error enviando reporte por email:', error);
      return false;
    }
  }

  private static generateEmailContent(data: EmailReportData): string {
    const { plantillaFamily, plantillaType, editedProducts, reason, userEmail, userName, timestamp } = data;
    
    const totalChanges = editedProducts.reduce((sum, product) => sum + product.changes.length, 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reporte de Cambios en Productos</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .product { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .change { background: white; padding: 10px; margin: 5px 0; border-left: 3px solid #007bff; }
          .before { background: #ffeaa7; padding: 3px 8px; border-radius: 3px; }
          .after { background: #d1edff; padding: 3px 8px; border-radius: 3px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🚨 Reporte de Cambios en Productos - Plantillas</h2>
          <p><strong>Fecha:</strong> ${timestamp.toLocaleString('es-AR')}</p>
          <p><strong>Usuario:</strong> ${userName || userEmail || 'No especificado'}</p>
        </div>

        <div class="alert">
          <h3>⚠️ Se detectaron modificaciones en productos para impresión</h3>
          <p>Un usuario ha realizado cambios en los datos de productos antes de imprimir las plantillas. Los cambios son solo para la impresión y no afectan la base de datos.</p>
        </div>

        <h3>📋 Información de la Plantilla</h3>
        <table>
          <tr><th>Familia</th><td>${plantillaFamily}</td></tr>
          <tr><th>Plantilla</th><td>${plantillaType}</td></tr>
          <tr><th>Productos editados</th><td>${editedProducts.length}</td></tr>
          <tr><th>Total de cambios</th><td>${totalChanges}</td></tr>
        </table>

        <h3>💬 Motivo de los cambios</h3>
        <div class="alert">
          <p><strong>El usuario explicó:</strong></p>
          <p><em>"${reason}"</em></p>
        </div>

        <h3>📝 Detalle de cambios realizados</h3>
        ${editedProducts.map((product, index) => `
          <div class="product">
            <h4>🛍️ Producto ${index + 1}: ${product.name}</h4>
            <p><strong>SKU:</strong> ${product.sku || 'N/A'} | <strong>Precio original:</strong> $${product.price}</p>
            
            <div style="margin-left: 20px;">
              ${product.changes.map(change => `
                <div class="change">
                  <strong>${getFieldDisplayName(change.field)}:</strong><br>
                  <span class="before">Antes: ${change.originalValue}</span> → 
                  <span class="after">Ahora: ${change.newValue}</span>
                  <br><small>Modificado: ${change.timestamp.toLocaleString('es-AR')}</small>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}

        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          Este email fue generado automáticamente por el sistema de gestión de plantillas.<br>
          Los cambios reportados son temporales y solo afectan la impresión actual.
        </p>
      </body>
      </html>
    `;
  }

  private static generateReportAttachment(data: EmailReportData) {
    const { plantillaFamily, plantillaType, editedProducts, reason, timestamp } = data;
    
    // Generar CSV con los cambios para adjuntar
    const csvContent = [
      ['Timestamp', 'Familia', 'Plantilla', 'Producto', 'SKU', 'Campo', 'Valor Original', 'Valor Nuevo', 'Motivo'],
      ...editedProducts.flatMap(product => 
        product.changes.map(change => [
          change.timestamp.toISOString(),
          plantillaFamily,
          plantillaType,
          product.name,
          product.sku || '',
          getFieldDisplayName(change.field),
          change.originalValue.toString(),
          change.newValue.toString(),
          reason
        ])
      )
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    return [{
      filename: `reporte-cambios-${timestamp.getTime()}.csv`,
      content: csvContent,
      contentType: 'text/csv'
    }];
  }

  static generateChangesSummary(editedProducts: EditedProduct[]): string {
    const totalProducts = editedProducts.length;
    const totalChanges = editedProducts.reduce((sum, product) => sum + product.changes.length, 0);
    
    const changedFields = new Set(
      editedProducts.flatMap(product => 
        product.changes.map(change => change.field)
      )
    );

    return `Se modificaron ${totalProducts} producto${totalProducts !== 1 ? 's' : ''} con ${totalChanges} cambio${totalChanges !== 1 ? 's' : ''} en total. ` +
           `Campos editados: ${Array.from(changedFields).map(field => getFieldDisplayName(field)).join(', ')}.`;
  }
} 