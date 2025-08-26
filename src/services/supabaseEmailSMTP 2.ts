/**
 * 📧 SUPABASE EMAIL SERVICE - RESEND API
 * 
 * Servicio para envío de emails usando Supabase Edge Functions + Resend API
 * Sistema profesional y confiable para emails transaccionales
 */

import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/types'

interface EmailParams {
  type: 'welcome_external' | 'welcome_internal' | 'password_changed' | 'change_report'
  to: string
  userName: string
  templateData?: {
    temporaryPassword?: string
    oldEmail?: string
    newEmail?: string
    // Para reportes de cambios
    plantillaFamily?: string
    plantillaType?: string
    editedProducts?: any[]
    reason?: string
    userEmail?: string
    timestamp?: string
  }
}

interface EmailResponse {
  success: boolean
  message?: string
  method?: string
  real_email?: boolean
  message_id?: string
  error?: string
  details?: string
  troubleshooting?: {
    resend_api_key: string
    from_email: string
    from_name: string
    help: string
  }
}

/**
 * Función principal para enviar emails via Supabase Edge Function + Resend API
 */
export const sendEmailViaSMTP = async (params: EmailParams): Promise<boolean> => {
  try {
    console.log('📧 [RESEND API] Enviando email:', params.type, 'a:', params.to)

    // Llamar a la Edge Function SMTP
    const { data, error } = await supabase.functions.invoke('send-email-smtp', {
      body: params
    })

    if (error) {
      console.error('❌ Error llamando Edge Function SMTP:', error)
      return false
    }

    const response = data as EmailResponse

    if (!response.success) {
      console.error('❌ Error en Edge Function Resend:', response.error)
      if (response.details) {
        console.error('📋 Detalles:', response.details)
      }
      if (response.troubleshooting) {
        console.error('🔧 Diagnóstico Resend:', response.troubleshooting)
      }
      return false
    }

    console.log('✅ Email procesado exitosamente via Resend API')
    console.log('📋 Método:', response.method)
    console.log('📧 Email real:', response.real_email ? 'SÍ' : 'Simulado')
    console.log('📬 Message ID:', response.message_id)
    console.log('📊 Respuesta:', response.message)
    return true

  } catch (error) {
    console.error('❌ Error enviando email via Resend API:', error)
    return false
  }
}

/**
 * Enviar email de bienvenida para usuarios externos
 */
export const sendWelcomeExternalEmail = async (
  user: User, 
  temporaryPassword: string
): Promise<boolean> => {
  return sendEmailViaSMTP({
    type: 'welcome_external',
    to: user.email,
    userName: user.name,
    templateData: { temporaryPassword }
  })
}

/**
 * Enviar email de bienvenida para usuarios internos (Cencosud/Easy)
 */
export const sendWelcomeInternalEmail = async (user: User): Promise<boolean> => {
  return sendEmailViaSMTP({
    type: 'welcome_internal',
    to: user.email,
    userName: user.name
  })
}

/**
 * Enviar confirmación de cambio de contraseña
 */
export const sendPasswordChangedEmail = async (user: User): Promise<boolean> => {
  return sendEmailViaSMTP({
    type: 'password_changed',
    to: user.email,
    userName: user.name
  })
}

/**
 * Enviar reporte de cambios en plantillas
 */
export const sendChangeReport = async (params: {
  plantillaFamily: string
  plantillaType: string
  editedProducts: any[]
  reason: string
  userEmail: string
  userName: string
  timestamp: Date
}): Promise<boolean> => {
  return sendEmailViaSMTP({
    type: 'change_report',
    to: 'admin@spidplus.com', // Email del admin - hacer configurable
    userName: params.userName,
    templateData: {
      plantillaFamily: params.plantillaFamily,
      plantillaType: params.plantillaType,
      editedProducts: params.editedProducts,
      reason: params.reason,
      userEmail: params.userEmail,
      timestamp: params.timestamp.toLocaleString('es-AR')
    }
  })
}

/**
 * Función de testing para verificar que el sistema SMTP funciona
 */
export const testEmailSMTPService = async (): Promise<boolean> => {
  console.log('🧪 [TEST SMTP] Probando servicio de email via SMTP directo...')
  
  const testUser: User = {
    id: 'test_user_smtp',
    name: 'Usuario de Prueba SMTP',
    email: 'test@example.com',
    role: 'editor',
    status: 'active',
    domain_type: 'external',
    first_login: true,
    groups: ['test']
  }

  return sendWelcomeExternalEmail(testUser, 'TempPass123!')
}

/**
 * Verificar configuración SMTP (util para debugging)
 */
export const checkSMTPConfig = async (): Promise<void> => {
  try {
    console.log('🔍 [DEBUG SMTP] Verificando configuración...')
    
    const { data, error } = await supabase.functions.invoke('send-email-smtp', {
      body: {
        type: 'test_config',
        to: 'test@test.com',
        userName: 'Test'
      }
    })

    if (error) {
      console.error('❌ Error verificando config SMTP:', error)
    } else {
      const response = data as EmailResponse
      if (response.troubleshooting) {
        console.log('🔧 Configuración SMTP:')
        console.log('  - Usuario SMTP:', response.troubleshooting.smtp_user)
        console.log('  - Password:', response.troubleshooting.smtp_pass)
        console.log('  - Host:', response.troubleshooting.smtp_host)
        console.log('  - Puerto:', response.troubleshooting.smtp_port)
      }
    }
  } catch (error) {
    console.error('❌ Error en verificación:', error)
  }
}

// Export por defecto para mantener compatibilidad
export default {
  sendWelcomeExternalEmail,
  sendWelcomeInternalEmail,
  sendPasswordChangedEmail,
  sendChangeReport,
  testEmailSMTPService,
  checkSMTPConfig
}