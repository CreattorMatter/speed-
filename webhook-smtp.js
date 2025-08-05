#!/usr/bin/env node

/**
 * 📧 SPID Plus - Webhook SMTP Server
 * 
 * Servidor Node.js simple que recibe webhooks de Supabase Edge Functions
 * y envía emails reales via SMTP (Gmail)
 * 
 * Uso:
 *   npm install express nodemailer cors
 *   node webhook-smtp.js
 * 
 * Puerto: 3001
 * Endpoint: POST /send-email
 */

const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Configuración SMTP
const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER || 'spidplusapp@gmail.com',
    pass: process.env.SMTP_PASS || 'aubfmxudlmtxerjc'
  }
}

// Crear transporter de nodemailer
const transporter = nodemailer.createTransporter(SMTP_CONFIG)

// Verificar configuración SMTP al iniciar
transporter.verify()
  .then(() => {
    console.log('✅ Servidor SMTP configurado correctamente')
    console.log('📧 Email:', SMTP_CONFIG.auth.user)
    console.log('🔗 Host:', SMTP_CONFIG.host + ':' + SMTP_CONFIG.port)
  })
  .catch((error) => {
    console.error('❌ Error en configuración SMTP:', error.message)
    process.exit(1)
  })

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'SPID Plus SMTP Webhook',
    smtp: {
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      user: SMTP_CONFIG.auth.user
    },
    timestamp: new Date().toISOString()
  })
})

// Endpoint principal para envío de emails
app.post('/send-email', async (req, res) => {
  try {
    const { to, toName, from, fromName, subject, html, text } = req.body
    
    console.log('📧 [WEBHOOK] Nuevo email recibido:')
    console.log('👤 Para:', `${toName} <${to}>`)
    console.log('📋 Asunto:', subject)
    console.log('📤 De:', `${fromName} <${from}>`)
    
    // Validar campos requeridos
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: to, subject, y (html o text)'
      })
    }

    // Configuración del email
    const mailOptions = {
      from: `${fromName || 'SPID Plus'} <${from || SMTP_CONFIG.auth.user}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || 'Email enviado desde SPID Plus'
    }

    // Enviar email
    console.log('📤 Enviando email via SMTP...')
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email enviado exitosamente!')
    console.log('📬 Message ID:', info.messageId)
    console.log('📊 Response:', info.response)

    res.json({
      success: true,
      message: 'Email enviado exitosamente',
      messageId: info.messageId,
      response: info.response,
      to: to,
      subject: subject,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error enviando email:', error)
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Error interno del servidor SMTP',
      timestamp: new Date().toISOString()
    })
  }
})

// Endpoint de prueba
app.post('/test-email', async (req, res) => {
  try {
    const testEmail = {
      to: req.body.to || 'test@example.com',
      toName: 'Usuario de Prueba',
      from: SMTP_CONFIG.auth.user,
      fromName: 'SPID Plus Test',
      subject: '🧪 Email de Prueba - SPID Plus',
      html: `
        <h2>🧪 Email de Prueba</h2>
        <p>Este es un email de prueba enviado desde <strong>SPID Plus Webhook SMTP</strong></p>
        <p>⏰ Enviado: ${new Date().toLocaleString()}</p>
        <p>🔗 Servidor: ${SMTP_CONFIG.host}:${SMTP_CONFIG.port}</p>
        <p>✅ ¡El sistema de emails está funcionando correctamente!</p>
      `,
      text: `Email de prueba - SPID Plus - ${new Date().toLocaleString()}`
    }

    console.log('🧪 [TEST] Enviando email de prueba...')
    
    const info = await transporter.sendMail({
      from: `${testEmail.fromName} <${testEmail.from}>`,
      to: testEmail.to,
      subject: testEmail.subject,
      html: testEmail.html,
      text: testEmail.text
    })

    console.log('✅ [TEST] Email de prueba enviado!')
    
    res.json({
      success: true,
      message: 'Email de prueba enviado exitosamente',
      messageId: info.messageId,
      to: testEmail.to,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ [TEST] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Manejar errores globales
app.use((error, req, res, next) => {
  console.error('❌ Error global:', error)
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🚀 ================================')
  console.log('📧 SPID Plus SMTP Webhook Server')
  console.log('🚀 ================================')
  console.log(`🌐 Servidor: http://localhost:${PORT}`)
  console.log(`📧 Email: ${SMTP_CONFIG.auth.user}`)
  console.log(`🔗 SMTP: ${SMTP_CONFIG.host}:${SMTP_CONFIG.port}`)
  console.log('📋 Endpoints:')
  console.log('  - GET  /health      (estado del servidor)')
  console.log('  - POST /send-email  (enviar email)')
  console.log('  - POST /test-email  (email de prueba)')
  console.log('🚀 ================================\n')
})