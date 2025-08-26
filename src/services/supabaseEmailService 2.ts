/**
 * 📧 SUPABASE EMAIL SERVICE
 * 
 * Servicio para envío de emails usando Supabase Edge Functions
 * Reemplaza el emailService.ts anterior para usar arquitectura serverless
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
  error?: string
  details?: string
}

/**
 * Función principal para enviar emails via Supabase Edge Function
 */
export const sendEmailViaSupabase = async (params: EmailParams): Promise<boolean> => {
  try {
    console.log('📧 [SUPABASE EMAIL] Enviando email:', params.type, 'a:', params.to)

    // Llamar a la Edge Function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params
    })

    if (error) {
      console.error('❌ Error llamando Edge Function:', error)
      return false
    }

    const response = data as EmailResponse

    if (!response.success) {
      console.error('❌ Error en Edge Function:', response.error)
      if (response.details) {
        console.error('📋 Detalles:', response.details)
      }
      return false
    }

    console.log('✅ Email enviado exitosamente via Supabase Edge Function')
    console.log('📊 Respuesta:', response.message)
    return true

  } catch (error) {
    console.error('❌ Error enviando email via Supabase:', error)
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
  return sendEmailViaSupabase({
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
  return sendEmailViaSupabase({
    type: 'welcome_internal',
    to: user.email,
    userName: user.name
  })
}

/**
 * Enviar confirmación de cambio de contraseña
 */
export const sendPasswordChangedEmail = async (user: User): Promise<boolean> => {
  return sendEmailViaSupabase({
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
  return sendEmailViaSupabase({
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
 * Función de testing para verificar que el sistema funciona
 */
export const testEmailService = async (): Promise<boolean> => {
  console.log('🧪 [TEST] Probando servicio de email...')
  
  const testUser: User = {
    id: 'test_user',
    name: 'Usuario de Prueba',
    email: 'test@example.com',
    role: 'editor',
    status: 'active',
    domain_type: 'external',
    first_login: true,
    groups: ['test']
  }

  return sendWelcomeExternalEmail(testUser, 'TempPass123!')
}

// Export por defecto para mantener compatibilidad
export default {
  sendWelcomeExternalEmail,
  sendWelcomeInternalEmail,
  sendPasswordChangedEmail,
  sendChangeReport,
  testEmailService
}