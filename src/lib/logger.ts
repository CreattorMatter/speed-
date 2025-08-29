/**
 * 🔍 SPID Plus - Simple Logger
 * 
 * Sistema de logging limpio y profesional
 * Solo para errores y warnings en producción
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogCategory = 
  | 'format' 
  | 'builder' 
  | 'template' 
  | 'product' 
  | 'auth' 
  | 'api' 
  | 'ui' 
  | 'performance'
  | 'general';

class SimpleLogger {
  private static instance: SimpleLogger;
  private isProduction = import.meta.env.PROD;

  private constructor() {}

  static getInstance(): SimpleLogger {
    if (!SimpleLogger.instance) {
      SimpleLogger.instance = new SimpleLogger();
    }
    return SimpleLogger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    // En producción, solo errores y warnings
    if (this.isProduction) {
      return level === 'error' || level === 'warn';
    }
    
    // En desarrollo, solo errores, warnings e info
    return level !== 'debug';
  }

  private log(level: LogLevel, category: LogCategory, message: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const emoji = this.getCategoryEmoji(category);
    const formattedMessage = `${emoji} ${message}`;

    switch (level) {
      case 'error':
        console.error(formattedMessage, data);
        break;
      case 'warn':
        console.warn(formattedMessage, data);
        break;
      case 'info':
        console.info(formattedMessage, data);
        break;
    }
  }

  private getCategoryEmoji(category: LogCategory): string {
    const emojis: Record<LogCategory, string> = {
      format: '🎭',
      builder: '🏗️',
      template: '📋',
      product: '📦',
      auth: '🔐',
      api: '🌐',
      ui: '🎨',
      performance: '⚡',
      general: '📝'
    };
    return emojis[category] || '📝';
  }

  // Métodos públicos simplificados
  info(category: LogCategory, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: LogCategory, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: LogCategory, message: string, data?: any) {
    this.log('error', category, message, data);
  }
}

// Export singleton instance
export const logger = SimpleLogger.getInstance();

// Export convenience functions (solo para casos importantes)
export const logError = (category: LogCategory, message: string, data?: any) => 
  logger.error(category, message, data);

export const logWarn = (category: LogCategory, message: string, data?: any) => 
  logger.warn(category, message, data);

export const logInfo = (category: LogCategory, message: string, data?: any) => 
  logger.info(category, message, data);
