/**
 * Utilidad para manejar rutas de imágenes de manera robusta
 * en development y production
 */

/**
 * Obtiene la ruta correcta para una imagen
 * @param imagePath - Ruta relativa desde public/
 * @returns Ruta absoluta que funciona en dev y prod
 */
export const getImageUrl = (imagePath: string): string => {
  // Asegurar que la ruta comience con /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // En producción, Vite maneja automáticamente las rutas de public/
  // En desarrollo también, pero agregamos cache busting
  const timestamp = new Date().getTime();
  const cacheParam = import.meta.env.DEV ? `?v=${timestamp}` : '?v=3';
  
  return `${normalizedPath}${cacheParam}`;
};

/**
 * Obtiene la URL del header de Ladrillazos
 */
export const getLadrillazoHeaderUrl = (): string => {
  return getImageUrl('/images/templates/ladrillazo-header.jpg');
};

/**
 * Obtiene la URL de un logo de banco
 * @param bankName - Nombre del banco
 */
export const getBankLogoUrl = (bankName: string): string => {
  const bankLogos: Record<string, string> = {
    'cencopay': '/images/banks/cencopay.png',
    'cencosud': '/images/banks/cencosud.png',
    'visa': '/images/banks/visa-logo.png',
    'mastercard': '/images/banks/mastercard-logo.png',
    'american': '/images/banks/amex-logo.png',
    'amex': '/images/banks/amex-logo.png',
    'nacion': '/images/banks/banco-nacion-logo.png',
  };

  const normalizedBankName = bankName.toLowerCase();
  
  for (const [key, logoPath] of Object.entries(bankLogos)) {
    if (normalizedBankName.includes(key)) {
      return getImageUrl(logoPath);
    }
  }
  
  // Default to visa if not found
  return getImageUrl('/images/banks/visa-logo.png');
};

/**
 * Preload crítico de imágenes para mejorar rendimiento
 */
export const preloadCriticalImages = (): void => {
  const criticalImages = [
    '/images/templates/ladrillazo-header.jpg',
    '/images/banks/visa-logo.png',
    '/images/banks/mastercard-logo.png',
    '/images/banks/cencopay.png'
  ];

  criticalImages.forEach(imagePath => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = getImageUrl(imagePath);
    document.head.appendChild(link);
  });
}; 