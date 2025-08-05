// Supabase Edge Function para envío de emails usando Resend API
// Deploy: supabase functions deploy send-email-smtp

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Variables de entorno - Resend API
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'spidplusapp@gmail.com'
const FROM_NAME = Deno.env.get('FROM_NAME') || 'SPID Plus'

interface EmailRequest {
  type: 'welcome_external' | 'welcome_internal' | 'password_changed' | 'change_report'
  to: string
  userName: string
  templateData?: {
    temporaryPassword?: string
    oldEmail?: string
    newEmail?: string
    plantillaFamily?: string
    plantillaType?: string
    editedProducts?: any[]
    reason?: string
    userEmail?: string
    timestamp?: string
  }
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Templates de email (iguales que antes)
const getEmailTemplate = (type: string, data: any): EmailTemplate => {
  const baseUrl = 'https://spidplus.com' // Cambiar por tu dominio

  switch (type) {
    case 'welcome_external':
      return {
        subject: '🔑 Bienvenido a SPID Plus - Tu contraseña temporal',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Bienvenido a SPID Plus</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
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
                  <p>Hola <strong>${data.userName}</strong>,</p>
                  
                  <p>Nos complace informarte que tu cuenta en SPID Plus ha sido creada con éxito. Ahora puedes acceder a nuestra plataforma de gestión de carteles y promociones.</p>
                  
                  <div class="password-box">
                    <h3>🔐 Tu contraseña temporal:</h3>
                    <div class="password">${data.templateData?.temporaryPassword}</div>
                    <p><small>Esta contraseña es temporal y deberás cambiarla en tu primer acceso.</small></p>
                  </div>
                  
                  <div class="warning">
                    <h4>⚠️ Importante - Primer acceso:</h4>
                    <ol>
                      <li>Accede a <a href="${baseUrl}">SPID Plus</a></li>
                      <li>Usa tu email: <strong>${data.to}</strong></li>
                      <li>Ingresa la contraseña temporal mostrada arriba</li>
                      <li>El sistema te pedirá crear una nueva contraseña</li>
                      <li>Una vez confirmada, tendrás acceso completo</li>
                    </ol>
                  </div>
                  
                  <h3>📋 Información de tu cuenta:</h3>
                  <ul>
                    <li><strong>Email:</strong> ${data.to}</li>
                    <li><strong>Rol:</strong> Usuario</li>
                  </ul>
                  
                  <p style="text-align: center;">
                    <a href="${baseUrl}" class="btn">🚀 Acceder a SPID Plus</a>
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
        text: `
Bienvenido a SPID Plus!

Hola ${data.userName},

Tu cuenta ha sido creada exitosamente en SPID Plus.

INFORMACIÓN DE ACCESO:
- Email: ${data.to}
- Contraseña temporal: ${data.templateData?.temporaryPassword}

PRIMER ACCESO:
1. Accede a ${baseUrl}
2. Usa tu email y la contraseña temporal
3. El sistema te pedirá crear una nueva contraseña
4. Una vez confirmada, tendrás acceso completo

Esta contraseña es temporal y deberás cambiarla en tu primer acceso.

Si necesitas ayuda, contacta a: soporte@spidplus.com

Saludos,
El equipo de SPID Plus
        `
      }

    case 'welcome_internal':
      return {
        subject: '🏢 Has sido dado de alta en SPID Plus',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
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
                  <p>Hola <strong>${data.userName}</strong>,</p>
                  
                  <p>Te informamos que tu cuenta corporativa ha sido habilitada para acceder a SPID Plus, nuestra plataforma de gestión de carteles y promociones.</p>
                  
                  <div class="info-box">
                    <h3>🔐 Acceso mediante autenticación corporativa:</h3>
                    <p>Como usuario interno, tu acceso está integrado con el sistema de autenticación corporativo. Usa tu email y contraseña habitual.</p>
                  </div>
                  
                  <p style="text-align: center;">
                    <a href="${baseUrl}" class="btn">🏢 Acceder con cuenta corporativa</a>
                  </p>
                  
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
        text: `
Alta en SPID Plus

Hola ${data.userName},

Tu cuenta corporativa ha sido habilitada para acceder a SPID Plus.

Como usuario interno, usa tu email corporativo y contraseña habitual para acceder.

Accede en: ${baseUrl}

Saludos,
El equipo de SPID Plus
        `
      }

    case 'change_report':
      const products = data.templateData?.editedProducts || []
      const productsList = products.map((product: any, index: number) => 
        `<li><strong>${product.title}</strong> - Código: ${product.code} - Precio: $${product.price}</li>`
      ).join('')

      return {
        subject: `📝 Reporte de Cambios - ${data.templateData?.plantillaFamily}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .info-box { background: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px; }
                .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .products-section { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px; }
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
                    <p><strong>Usuario:</strong> ${data.userName} (${data.to})</p>
                    <p><strong>Fecha:</strong> ${data.templateData?.timestamp}</p>
                    <p><strong>Familia:</strong> ${data.templateData?.plantillaFamily}</p>
                    <p><strong>Plantilla:</strong> ${data.templateData?.plantillaType}</p>
                  </div>

                  <div class="reason-box">
                    <h3>📋 Justificación</h3>
                    <p>${data.templateData?.reason}</p>
                  </div>

                  <div class="products-section">
                    <h3>🛒 Productos Editados (${products.length})</h3>
                    <ul>${productsList}</ul>
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
        text: `
Reporte de Cambios - ${data.templateData?.plantillaFamily}

Usuario: ${data.userName} (${data.to})
Fecha: ${data.templateData?.timestamp}
Familia: ${data.templateData?.plantillaFamily}
Plantilla: ${data.templateData?.plantillaType}

Justificación: ${data.templateData?.reason}

Productos editados (${products.length}):
${products.map((p: any, i: number) => `${i+1}. ${p.title} - $${p.price}`).join('\n')}

---
Este email fue generado automáticamente por el sistema SPID Plus
        `
      }

    default:
      throw new Error(`Template type '${type}' not found`)
  }
}

// Función principal para enviar email via Resend API
const sendEmailViaResend = async (emailData: {
  to: string
  toName: string
  subject: string
  html: string
  text: string
}): Promise<any> => {
  console.log('📧 [RESEND] Enviando email a:', emailData.to)
  console.log('📋 Asunto:', emailData.subject)
  console.log('👤 De:', `${FROM_NAME} <${FROM_EMAIL}>`)
  
  // Verificar si tenemos API Key configurada
  if (!RESEND_API_KEY) {
    console.log('🔄 [SIMULACIÓN] No hay RESEND_API_KEY configurada')
    console.log('📧 Email que se enviaría:')
    console.log('  - Para:', emailData.to)
    console.log('  - De:', `${FROM_NAME} <${FROM_EMAIL}>`)
    console.log('  - Asunto:', emailData.subject)
    console.log('  - Tamaño HTML:', emailData.html.length, 'caracteres')
    console.log('💡 Para envío real, configura: supabase secrets set RESEND_API_KEY=re_tu_key')
    
    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('✅ [SIMULACIÓN] Email procesado exitosamente')
    
    return {
      id: 'simulated_' + Date.now(),
      message: 'Email simulado - configura RESEND_API_KEY para envío real'
    }
  }

  console.log('🔑 Usando Resend API para envío real')
  
  // Preparar payload para Resend
  const payload = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [emailData.to],
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text
  }

  console.log('📤 Enviando a Resend API...')
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error de Resend API:', errorText)
      throw new Error(`Resend API error (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Email enviado exitosamente via Resend')
    console.log('📬 Message ID:', result.id)
    console.log('📊 Response:', JSON.stringify(result, null, 2))
    
    return result

  } catch (error) {
    console.error('❌ Error enviando email via Resend:', error)
    throw error
  }
}

// Función principal
serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar configuración
    if (RESEND_API_KEY) {
      console.log('✅ Resend API configurada - emails reales')
    } else {
      console.log('⚠️ Sin Resend API - modo simulación')
      console.log('💡 Para emails reales: supabase secrets set RESEND_API_KEY=re_tu_key')
    }

    // Parse request
    const emailRequest: EmailRequest = await req.json()
    console.log('📧 [DEBUG] Procesando email:', emailRequest.type, 'para:', emailRequest.to)

    // Generar template
    const template = getEmailTemplate(emailRequest.type, emailRequest)

    // Enviar email via Resend API
    const result = await sendEmailViaResend({
      to: emailRequest.to,
      toName: emailRequest.userName,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    console.log('✅ Email procesado exitosamente para:', emailRequest.to)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: RESEND_API_KEY ? 'Email enviado exitosamente via Resend' : 'Email simulado exitosamente',
        method: 'Resend API',
        real_email: !!RESEND_API_KEY,
        message_id: result.id,
        type: emailRequest.type,
        to: emailRequest.to,
        from: `${FROM_NAME} <${FROM_EMAIL}>`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error enviando email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        method: 'Resend API',
        details: 'Error enviando email - revisar logs',
        troubleshooting: {
          resend_api_key: RESEND_API_KEY ? 'Configurado' : 'NO configurado',
          from_email: FROM_EMAIL,
          from_name: FROM_NAME,
          help: 'Configura RESEND_API_KEY para envío real'
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})