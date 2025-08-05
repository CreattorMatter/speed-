/**
 * 🔐 PASSWORD GENERATOR UTILITY
 * 
 * Genera contraseñas temporales seguras para nuevos usuarios
 * Cumple con estándares de seguridad empresarial
 */

interface PasswordConfig {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean; // Excluir caracteres similares (0, O, 1, l, etc.)
  readableSeparator?: boolean; // Agregar guiones para legibilidad
}

const DEFAULT_CONFIG: Required<PasswordConfig> = {
  length: 12,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: true,
  readableSeparator: false
};

// Character sets
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';

// Similar characters to exclude for better readability
const SIMILAR_CHARS = '0O1lI|';

/**
 * Genera una contraseña temporal segura
 */
export const generateTemporaryPassword = (config: PasswordConfig = {}): string => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  let charset = '';
  let requiredChars = '';

  // Build character set
  if (finalConfig.includeUppercase) {
    const upperSet = finalConfig.excludeSimilar 
      ? UPPERCASE.replace(/[0O]/g, '') 
      : UPPERCASE;
    charset += upperSet;
    requiredChars += getRandomChar(upperSet);
  }

  if (finalConfig.includeLowercase) {
    const lowerSet = finalConfig.excludeSimilar 
      ? LOWERCASE.replace(/[1lI]/g, '') 
      : LOWERCASE;
    charset += lowerSet;
    requiredChars += getRandomChar(lowerSet);
  }

  if (finalConfig.includeNumbers) {
    const numberSet = finalConfig.excludeSimilar 
      ? NUMBERS.replace(/[01]/g, '') 
      : NUMBERS;
    charset += numberSet;
    requiredChars += getRandomChar(numberSet);
  }

  if (finalConfig.includeSymbols) {
    const symbolSet = finalConfig.excludeSimilar 
      ? SYMBOLS.replace(/[|]/g, '') 
      : SYMBOLS;
    charset += symbolSet;
    requiredChars += getRandomChar(symbolSet);
  }

  // Remove similar characters from full charset
  if (finalConfig.excludeSimilar) {
    for (const char of SIMILAR_CHARS) {
      charset = charset.replace(new RegExp(char, 'g'), '');
    }
  }

  // Generate remaining characters
  const remainingLength = finalConfig.length - requiredChars.length;
  let randomChars = '';
  
  for (let i = 0; i < remainingLength; i++) {
    randomChars += getRandomChar(charset);
  }

  // Combine and shuffle
  const password = shuffleString(requiredChars + randomChars);

  // Add readable separator if requested
  if (finalConfig.readableSeparator && password.length >= 8) {
    const mid = Math.floor(password.length / 2);
    return password.substring(0, mid) + '-' + password.substring(mid);
  }

  return password;
};

/**
 * Genera múltiples opciones de contraseñas para que el admin elija
 */
export const generatePasswordOptions = (count: number = 3): string[] => {
  const options: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const config: PasswordConfig = {
      length: 10 + (i * 2), // 10, 12, 14 characters
      readableSeparator: i === 1, // Only middle option has separator
      includeSymbols: i !== 2 // Last option without symbols for simplicity
    };
    
    options.push(generateTemporaryPassword(config));
  }
  
  return options;
};

/**
 * Valida la fortaleza de una contraseña
 */
export const validatePasswordStrength = (password: string): {
  score: number; // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  suggestions: string[];
} => {
  let score = 0;
  const suggestions: string[] = [];

  // Length check
  if (password.length >= 8) score += 20;
  else suggestions.push('Usar al menos 8 caracteres');
  
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  else suggestions.push('Incluir letras minúsculas');
  
  if (/[A-Z]/.test(password)) score += 15;
  else suggestions.push('Incluir letras mayúsculas');
  
  if (/[0-9]/.test(password)) score += 15;
  else suggestions.push('Incluir números');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else suggestions.push('Incluir símbolos especiales');

  // Patterns check
  if (!/(.)\1{2,}/.test(password)) score += 10; // No repeated chars
  else suggestions.push('Evitar caracteres repetidos');

  // Determine level
  let level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  if (score < 30) level = 'weak';
  else if (score < 50) level = 'fair';
  else if (score < 70) level = 'good';
  else if (score < 90) level = 'strong';
  else level = 'excellent';

  return { score, level, suggestions };
};

/**
 * Genera un PIN numérico para 2FA
 */
export const generate2FAPin = (length: number = 6): string => {
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += Math.floor(Math.random() * 10).toString();
  }
  return pin;
};

/**
 * Genera un token de recuperación alfanumérico
 */
export const generateRecoveryToken = (length: number = 32): string => {
  const charset = UPPERCASE + LOWERCASE + NUMBERS;
  let token = '';
  
  for (let i = 0; i < length; i++) {
    token += getRandomChar(charset);
  }
  
  return token;
};

// Helper functions
function getRandomChar(charset: string): string {
  return charset.charAt(Math.floor(Math.random() * charset.length));
}

function shuffleString(str: string): string {
  return str.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Formato para mostrar contraseñas de manera legible
 */
export const formatPasswordForDisplay = (password: string): string => {
  // Add spaces every 4 characters for better readability
  return password.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Genera información adicional de la contraseña para el admin
 */
export const getPasswordInfo = (password: string) => {
  const strength = validatePasswordStrength(password);
  const formatted = formatPasswordForDisplay(password);
  
  return {
    raw: password,
    formatted,
    length: password.length,
    strength,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    createdAt: new Date().toISOString()
  };
};

export default {
  generateTemporaryPassword,
  generatePasswordOptions,
  validatePasswordStrength,
  generate2FAPin,
  generateRecoveryToken,
  formatPasswordForDisplay,
  getPasswordInfo
};