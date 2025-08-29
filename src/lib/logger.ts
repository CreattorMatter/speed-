/**
 * 🔍 SPID Plus - Sistema de Logging Profesional
 * 
 * Reemplaza console.log dispersos con un sistema centralizado y configurable
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

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  component?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isProduction = import.meta.env.PROD;
  private enabledCategories: Set<LogCategory> = new Set([
    'error', 'warn', 'info'
  ]);

  private constructor() {
    // En desarrollo, habilitar todas las categorías
    if (!this.isProduction) {
      this.enabledCategories = new Set([
        'format', 'builder', 'template', 'product', 
        'auth', 'api', 'ui', 'performance', 'general'
      ]);
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    // En producción, solo errores y warnings
    if (this.isProduction) {
      return level === 'error' || level === 'warn';
    }
    
    // En desarrollo, verificar categorías habilitadas
    return this.enabledCategories.has(category);
  }

  private addLog(level: LogLevel, category: LogCategory, message: string, data?: any, component?: string) {
    if (!this.shouldLog(level, category)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      component
    };

    this.logs.push(entry);
    
    // Mantener solo los últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output a consola con formato
    this.outputToConsole(entry);
  }

  private outputToConsole(entry: LogEntry) {
    const emoji = this.getCategoryEmoji(entry.category);
    const levelEmoji = this.getLevelEmoji(entry.level);
    
    const prefix = `${emoji} ${levelEmoji}`;
    const component = entry.component ? `[${entry.component}]` : '';
    const message = `${prefix} ${component} ${entry.message}`;

    switch (entry.level) {
      case 'error':
        console.error(message, entry.data);
        break;
      case 'warn':
        console.warn(message, entry.data);
        break;
      case 'info':
        console.info(message, entry.data);
        break;
      case 'debug':
      default:
        console.log(message, entry.data);
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

  private getLevelEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    return emojis[level];
  }

  // Métodos públicos
  debug(category: LogCategory, message: string, data?: any, component?: string) {
    this.addLog('debug', category, message, data, component);
  }

  info(category: LogCategory, message: string, data?: any, component?: string) {
    this.addLog('info', category, message, data, component);
  }

  warn(category: LogCategory, message: string, data?: any, component?: string) {
    this.addLog('warn', category, message, data, component);
  }

  error(category: LogCategory, message: string, data?: any, component?: string) {
    this.addLog('error', category, message, data, component);
  }

  // Métodos de utilidad
  getLogs(category?: LogCategory, level?: LogLevel): LogEntry[] {
    return this.logs.filter(log => {
      const categoryMatch = !category || log.category === category;
      const levelMatch = !level || log.level === level;
      return categoryMatch && levelMatch;
    });
  }

  clearLogs() {
    this.logs = [];
  }

  enableCategory(category: LogCategory) {
    this.enabledCategories.add(category);
  }

  disableCategory(category: LogCategory) {
    this.enabledCategories.delete(category);
  }

  // Métodos especializados para casos comunes
  formatLog(message: string, data?: any, component?: string) {
    this.debug('format', message, data, component);
  }

  builderLog(message: string, data?: any, component?: string) {
    this.debug('builder', message, data, component);
  }

  templateLog(message: string, data?: any, component?: string) {
    this.debug('template', message, data, component);
  }

  productLog(message: string, data?: any, component?: string) {
    this.debug('product', message, data, component);
  }

  apiLog(message: string, data?: any, component?: string) {
    this.debug('api', message, data, component);
  }

  uiLog(message: string, data?: any, component?: string) {
    this.debug('ui', message, data, component);
  }

  performanceLog(message: string, data?: any, component?: string) {
    this.debug('performance', message, data, component);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const formatLog = (message: string, data?: any, component?: string) => 
  logger.formatLog(message, data, component);

export const builderLog = (message: string, data?: any, component?: string) => 
  logger.builderLog(message, data, component);

export const templateLog = (message: string, data?: any, component?: string) => 
  logger.templateLog(message, data, component);

export const productLog = (message: string, data?: any, component?: string) => 
  logger.productLog(message, data, component);

export const apiLog = (message: string, data?: any, component?: string) => 
  logger.apiLog(message, data, component);

export const uiLog = (message: string, data?: any, component?: string) => 
  logger.uiLog(message, data, component);

export const performanceLog = (message: string, data?: any, component?: string) => 
  logger.performanceLog(message, data, component);

// Export para casos especiales
export { logger };
