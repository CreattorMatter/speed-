/**
 * 📧 EMAIL SERVICE
 * 
 * Servicio para envío de emails del sistema de gestión de usuarios
 * Incluye templates para diferentes tipos de emails
 */

import type { EmailTemplate, User } from '@/types';

// Email templates configuration
const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome_external: {
    id: 'welcome_external',
    name: 'Bienvenida Usuario Externo',
    type: 'welcome_external',
    subject: '🔑 Bienvenido a SPID Plus - Tu contraseña temporal',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a SPID Plus</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .password-box { background: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .password { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #007bff; letter-spacing: 2px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #6c757d; font-size: 14px; }
            .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Bienvenido a SPID Plus!</h1>
              <p>Tu cuenta ha sido creada exitosamente</p>
            </div>
            
            <div class="content">
              <p>Hola <strong>{{USER_NAME}}</strong>,</p>
              
              <p>Nos complace informarte que tu cuenta en SPID Plus ha sido creada con éxito. Ahora puedes acceder a nuestra plataforma de gestión de carteles y promociones.</p>
              
              <div class="password-box">
                <h3>🔐 Tu contraseña temporal:</h3>
                <div class="password">{{TEMPORARY_PASSWORD}}</div>
                <p><small>Esta contraseña es temporal y deberás cambiarla en tu primer acceso.</small></p>
              </div>
              
              <div class="warning">
                <h4>⚠️ Importante - Primer acceso:</h4>
                <ol>
                  <li>Accede a <a href="{{APP_URL}}">SPID Plus</a></li>
                  <li>Usa tu email: <strong>{{USER_EMAIL}}</strong></li>
                  <li>Ingresa la contraseña temporal mostrada arriba</li>
                  <li>El sistema te pedirá crear una nueva contraseña</li>
                  <li>Una vez confirmada, tendrás acceso completo</li>
                </ol>
              </div>
              
              <h3>📋 Información de tu cuenta:</h3>
              <ul>
                <li><strong>Email:</strong> {{USER_EMAIL}}</li>
                <li><strong>Rol:</strong> {{USER_ROLE}}</li>
                <li><strong>Grupos:</strong> {{USER_GROUPS}}</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="{{APP_URL}}" class="btn">🚀 Acceder a SPID Plus</a>
              </p>
              
              <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar a nuestro equipo de soporte.</p>
              
              <p>¡Esperamos que disfrutes usando SPID Plus!</p>
              
              <p>Saludos,<br>
              <strong>El equipo de SPID Plus</strong></p>
            </div>
            
            <div class="footer">
              <p>Este es un email automático, por favor no respondas directamente.</p>
              <p>Para soporte técnico: <a href="mailto:soporte@spidplus.com">soporte@spidplus.com</a></p>
              <p>&copy; 2024 SPID Plus. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
Bienvenido a SPID Plus!

Hola {{USER_NAME}},

Tu cuenta ha sido creada exitosamente en SPID Plus.

INFORMACIÓN DE ACCESO:
- Email: {{USER_EMAIL}}
- Contraseña temporal: {{TEMPORARY_PASSWORD}}
- Rol: {{USER_ROLE}}
- Grupos: {{USER_GROUPS}}

PRIMER ACCESO:
1. Accede a {{APP_URL}}
2. Usa tu email y la contraseña temporal
3. El sistema te pedirá crear una nueva contraseña
4. Una vez confirmada, tendrás acceso completo

Esta contraseña es temporal y deberás cambiarla en tu primer acceso.

Si necesitas ayuda, contacta a: soporte@spidplus.com

Saludos,
El equipo de SPID Plus
    `
  },

  welcome_internal: {
    id: 'welcome_internal',
    name: 'Bienvenida Usuario Interno',
    type: 'welcome_internal',
    subject: '🏢 Has sido dado de alta en SPID Plus',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Alta en SPID Plus</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .info-box { background: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #6c757d; font-size: 14px; }
            .btn { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏢 Alta en SPID Plus</h1>
              <p>Acceso autorizado a la plataforma</p>
            </div>
            
            <div class="content">
              <p>Hola <strong>{{USER_NAME}}</strong>,</p>
              
              <p>Te informamos que tu cuenta corporativa ha sido habilitada para acceder a SPID Plus, nuestra plataforma de gestión de carteles y promociones.</p>
              
              <div class="info-box">
                <h3>🔐 Acceso mediante EntraID:</h3>
                <p>Como usuario {{DOMAIN_TYPE}}, tu acceso está integrado con el sistema de autenticación corporativo. No necesitas una contraseña específica para SPID Plus.</p>
              </div>
              
              <h3>📋 Información de tu cuenta:</h3>
              <ul>
                <li><strong>Email corporativo:</strong> {{USER_EMAIL}}</li>
                <li><strong>Rol asignado:</strong> {{USER_ROLE}}</li>
                <li><strong>Grupos:</strong> {{USER_GROUPS}}</li>
                <li><strong>Tipo de acceso:</strong> Autenticación corporativa</li>
              </ul>
              
              <h3>🚀 Para acceder a SPID Plus:</h3>
              <ol>
                <li>Ve a <a href="{{APP_URL}}">SPID Plus</a></li>
                <li>Usa tu email corporativo: <strong>{{USER_EMAIL}}</strong></li>
                <li>Ingresa tu contraseña corporativa habitual</li>
                <li>El sistema te dará acceso automáticamente</li>
              </ol>
              
              <p style="text-align: center;">
                <a href="{{APP_URL}}" class="btn">🏢 Acceder con cuenta corporativa</a>
              </p>
              
              <p>Si experimentas problemas de acceso, contacta al administrador del sistema o al soporte técnico.</p>
              
              <p>Saludos,<br>
              <strong>El equipo de SPID Plus</strong></p>
            </div>
            
            <div class="footer">
              <p>Este es un email automático, por favor no respondas directamente.</p>
              <p>Para soporte técnico: <a href="mailto:soporte@spidplus.com">soporte@spidplus.com</a></p>
              <p>&copy; 2024 SPID Plus. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
Alta en SPID Plus

Hola {{USER_NAME}},

Tu cuenta corporativa ha sido habilitada para acceder a SPID Plus.

INFORMACIÓN DE ACCESO:
- Email: {{USER_EMAIL}}
- Rol: {{USER_ROLE}}
- Grupos: {{USER_GROUPS}}
- Tipo: Autenticación corporativa (EntraID)

PARA ACCEDER:
1. Ve a {{APP_URL}}
2. Usa tu email corporativo y contraseña habitual
3. El sistema te dará acceso automáticamente

No necesitas una contraseña específica para SPID Plus.

Para soporte: soporte@spidplus.com

Saludos,
El equipo de SPID Plus
    `
  },

  password_changed: {
    id: 'password_changed',
    name: 'Confirmación Cambio de Contraseña',
    type: 'password_changed',
    subject: '✅ Contraseña actualizada en SPID Plus',
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contraseña Actualizada</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .security-tips { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px; border: 1px solid #dee2e6; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Contraseña Actualizada</h1>
              <p>Tu cuenta está ahora completamente configurada</p>
            </div>
            
            <div class="content">
              <p>Hola <strong>{{USER_NAME}}</strong>,</p>
              
              <div class="success-box">
                <h3>🎉 ¡Configuración completada!</h3>
                <p>Tu contraseña ha sido actualizada exitosamente y tu cuenta está lista para usar.</p>
                <p><strong>Fecha:</strong> {{CHANGE_DATE}}<br>
                <strong>Hora:</strong> {{CHANGE_TIME}}</p>
              </div>
              
              <p>Ya puedes acceder a SPID Plus con normalidad usando tu nueva contraseña.</p>
              
              <div class="security-tips">
                <h4>🔒 Consejos de seguridad:</h4>
                <ul>
                  <li>Nunca compartas tu contraseña con otras personas</li>
                  <li>Usa una contraseña única para SPID Plus</li>
                  <li>Si sospechas que tu cuenta fue comprometida, cambia tu contraseña inmediatamente</li>
                  <li>Cierra sesión cuando uses computadoras compartidas</li>
                </ul>
              </div>
              
              <p>Si no realizaste este cambio, contacta inmediatamente al administrador del sistema.</p>
              
              <p>Saludos,<br>
              <strong>El equipo de SPID Plus</strong></p>
            </div>
            
            <div class="footer">
              <p>Este es un email automático, por favor no respondas directamente.</p>
              <p>Para soporte técnico: <a href="mailto:soporte@spidplus.com">soporte@spidplus.com</a></p>
              <p>&copy; 2024 SPID Plus. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
Contraseña Actualizada - SPID Plus

Hola {{USER_NAME}},

Tu contraseña ha sido actualizada exitosamente.

DETALLES:
- Fecha: {{CHANGE_DATE}}
- Hora: {{CHANGE_TIME}}
- Usuario: {{USER_EMAIL}}

Tu cuenta está ahora completamente configurada y lista para usar.

CONSEJOS DE SEGURIDAD:
- Nunca compartas tu contraseña
- Usa una contraseña única para SPID Plus
- Contacta al soporte si sospechas actividad sospechosa
- Cierra sesión en computadoras compartidas

Si no realizaste este cambio, contacta inmediatamente al administrador.

Para soporte: soporte@spidplus.com

Saludos,
El equipo de SPID Plus
    `
  }
};

interface EmailVariables {
  USER_NAME: string;
  USER_EMAIL: string;
  USER_ROLE: string;
  USER_GROUPS: string;
  TEMPORARY_PASSWORD?: string;
  DOMAIN_TYPE?: string;
  APP_URL: string;
  CHANGE_DATE?: string;
  CHANGE_TIME?: string;
  [key: string]: string | undefined;
}

/**
 * Replace template variables with actual values
 */
const replaceTemplateVariables = (
  template: string, 
  variables: EmailVariables
): string => {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  });
  
  return result;
};

/**
 * Get email template by type
 */
export const getEmailTemplate = (type: EmailTemplate['type']): EmailTemplate | null => {
  return EMAIL_TEMPLATES[type] || null;
};

/**
 * Generate email content for a specific user and template
 */
export const generateEmailContent = (
  templateType: EmailTemplate['type'],
  user: User,
  additionalVariables: Partial<EmailVariables> = {}
): { subject: string; htmlContent: string; textContent: string } | null => {
  const template = getEmailTemplate(templateType);
  if (!template) return null;

  // Default variables
  const variables: EmailVariables = {
    USER_NAME: user.name,
    USER_EMAIL: user.email,
    USER_ROLE: user.role,
    USER_GROUPS: user.groups?.join(', ') || 'Sin grupos',
    APP_URL: import.meta.env.VITE_APP_URL || 'https://spidplus.com',
    DOMAIN_TYPE: user.domain_type === 'cencosud' ? 'Cencosud' : 
                 user.domain_type === 'easy' ? 'Easy' : 'Externo',
    CHANGE_DATE: new Date().toLocaleDateString('es-ES'),
    CHANGE_TIME: new Date().toLocaleTimeString('es-ES'),
    ...additionalVariables
  };

  return {
    subject: replaceTemplateVariables(template.subject, variables),
    htmlContent: replaceTemplateVariables(template.htmlContent, variables),
    textContent: replaceTemplateVariables(template.textContent || '', variables)
  };
};

/**
 * Send welcome email for external users
 */
export const sendWelcomeExternalEmail = async (
  user: User, 
  temporaryPassword: string
): Promise<boolean> => {
  try {
    const emailContent = generateEmailContent('welcome_external', user, {
      TEMPORARY_PASSWORD: temporaryPassword
    });

    if (!emailContent) {
      throw new Error('No se pudo generar el contenido del email');
    }

    // In production, this would integrate with your email service (SendGrid, AWS SES, etc.)
    console.log('📧 [EMAIL SERVICE] Enviando email de bienvenida externo:', {
      to: user.email,
      subject: emailContent.subject,
      template: 'welcome_external'
    });

    // Simulate email sending
    await simulateEmailSending(user.email, emailContent);

    return true;
  } catch (error) {
    console.error('Error enviando email de bienvenida externo:', error);
    return false;
  }
};

/**
 * Send welcome email for internal users (Cencosud/Easy)
 */
export const sendWelcomeInternalEmail = async (user: User): Promise<boolean> => {
  try {
    const emailContent = generateEmailContent('welcome_internal', user);

    if (!emailContent) {
      throw new Error('No se pudo generar el contenido del email');
    }

    console.log('📧 [EMAIL SERVICE] Enviando email de bienvenida interno:', {
      to: user.email,
      subject: emailContent.subject,
      template: 'welcome_internal'
    });

    await simulateEmailSending(user.email, emailContent);

    return true;
  } catch (error) {
    console.error('Error enviando email de bienvenida interno:', error);
    return false;
  }
};

/**
 * Send password changed confirmation email
 */
export const sendPasswordChangedEmail = async (user: User): Promise<boolean> => {
  try {
    const emailContent = generateEmailContent('password_changed', user);

    if (!emailContent) {
      throw new Error('No se pudo generar el contenido del email');
    }

    console.log('📧 [EMAIL SERVICE] Enviando confirmación de cambio de contraseña:', {
      to: user.email,
      subject: emailContent.subject,
      template: 'password_changed'
    });

    await simulateEmailSending(user.email, emailContent);

    return true;
  } catch (error) {
    console.error('Error enviando email de confirmación:', error);
    return false;
  }
};

/**
 * Simulate email sending (replace with real email service)
 */
const simulateEmailSending = async (
  to: string, 
  content: { subject: string; htmlContent: string; textContent: string }
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`📬 [EMAIL SIMULADO] 
To: ${to}
Subject: ${content.subject}
Content: Email enviado exitosamente (simulación)
      `);
      resolve();
    }, 1000);
  });
};

/**
 * Get all available email templates
 */
export const getAllEmailTemplates = (): EmailTemplate[] => {
  return Object.values(EMAIL_TEMPLATES);
};

/**
 * Preview email template with sample data
 */
export const previewEmailTemplate = (
  templateType: EmailTemplate['type'],
  sampleVariables?: Partial<EmailVariables>
) => {
  const sampleUser: User = {
    id: 'sample',
    name: 'Juan Ejemplo',
    email: 'juan.ejemplo@empresa.com',
    role: 'editor',
    status: 'active',
    groups: ['sucursal-almagro', 'editorial'],
    domain_type: 'external',
    first_login: true
  };

  const defaultSampleVariables: Partial<EmailVariables> = {
    TEMPORARY_PASSWORD: 'TempPass123!',
    ...sampleVariables
  };

  return generateEmailContent(templateType, sampleUser, defaultSampleVariables);
};

/**
 * Send change report email
 */
export const sendChangeReport = async (params: {
  plantillaFamily: string;
  plantillaType: string;
  editedProducts: any[];
  reason: string;
  userEmail: string;
  userName: string;
  timestamp: Date;
}): Promise<boolean> => {
  try {
    const {
      plantillaFamily,
      plantillaType,
      editedProducts,
      reason,
      userEmail,
      userName,
      timestamp
    } = params;

    const productsList = editedProducts.map((product, index) => `
      <div style="border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px; margin: 10px 0;">
        <h4 style="margin: 0 0 10px 0; color: #333;">${index + 1}. ${product.title}</h4>
        <p><strong>Código:</strong> ${product.code}</p>
        <p><strong>Precio:</strong> $${product.price}</p>
        <p><strong>Marca:</strong> ${product.brand}</p>
        <p><strong>Origen:</strong> ${product.origin}</p>
      </div>
    `).join('');

    const emailContent = {
      subject: `📝 Reporte de Cambios - ${plantillaFamily}`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Cambios</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
              .info-box { background: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px; }
              .products-section { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px; }
              .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #6c757d; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📝 Reporte de Cambios</h1>
                <p>Sistema SPID Plus - Gestión de Plantillas</p>
              </div>
              
              <div class="content">
                <div class="info-box">
                  <h3>ℹ️ Información del Cambio</h3>
                  <p><strong>Usuario:</strong> ${userName} (${userEmail})</p>
                  <p><strong>Fecha y Hora:</strong> ${timestamp.toLocaleString('es-AR')}</p>
                  <p><strong>Familia de Plantilla:</strong> ${plantillaFamily}</p>
                  <p><strong>Tipo de Plantilla:</strong> ${plantillaType}</p>
                </div>

                <div class="reason-box">
                  <h3>📋 Justificación</h3>
                  <p>${reason}</p>
                </div>

                <div class="products-section">
                  <h3>🛒 Productos Editados (${editedProducts.length})</h3>
                  ${productsList}
                </div>
              </div>

              <div class="footer">
                <p>Este email fue generado automáticamente por el sistema SPID Plus</p>
                <p>© 2024 Sistema de Gestión de Carteles</p>
              </div>
            </div>
          </body>
        </html>
      `,
      textContent: `
Reporte de Cambios - ${plantillaFamily}

Usuario: ${userName} (${userEmail})
Fecha: ${timestamp.toLocaleString('es-AR')}
Familia: ${plantillaFamily}
Plantilla: ${plantillaType}

Justificación: ${reason}

Productos editados (${editedProducts.length}):
${editedProducts.map((product, index) => `
${index + 1}. ${product.title}
   Código: ${product.code}
   Precio: $${product.price}
   Marca: ${product.brand}
   Origen: ${product.origin}
`).join('\n')}

---
Este email fue generado automáticamente por el sistema SPID Plus
      `
    };

    // Send to admin or supervision email (could be configurable)
    const adminEmail = 'admin@spidplus.com'; // TODO: Make this configurable
    await simulateEmailSending(adminEmail, emailContent);

    console.log('✅ Reporte de cambios enviado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al enviar reporte de cambios:', error);
    return false;
  }
};

export default {
  getEmailTemplate,
  generateEmailContent,
  sendWelcomeExternalEmail,
  sendWelcomeInternalEmail,
  sendPasswordChangedEmail,
  sendChangeReport,
  getAllEmailTemplates,
  previewEmailTemplate
};