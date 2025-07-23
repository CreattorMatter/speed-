// =====================================
// IMAGE CACHE HOOK - TemplateLibrary
// =====================================

import { useEffect, useRef, useCallback } from 'react';

interface ImageCacheEntry {
  url: string;
  blob?: Blob;
  objectUrl?: string;
  isLoading: boolean;
  error?: boolean;
  lastAccessed: number;
}

class ImageCacheManager {
  private cache = new Map<string, ImageCacheEntry>();
  private maxCacheSize = 50; // Máximo 50 imágenes en cache
  private maxAge = 10 * 60 * 1000; // 10 minutos

  async preloadImage(url: string): Promise<string> {
    if (this.cache.has(url)) {
      const entry = this.cache.get(url)!;
      entry.lastAccessed = Date.now();
      if (entry.objectUrl && !entry.error) {
        return entry.objectUrl;
      }
    }

    // Crear entrada de cache
    const entry: ImageCacheEntry = {
      url,
      isLoading: true,
      lastAccessed: Date.now()
    };
    
    this.cache.set(url, entry);

    try {
      // Fetch optimizado con AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'force-cache', // Usar cache del navegador
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Actualizar entrada
      entry.blob = blob;
      entry.objectUrl = objectUrl;
      entry.isLoading = false;
      entry.lastAccessed = Date.now();

      // Limpiar cache si es necesario
      this.cleanupCache();

      return objectUrl;
    } catch (error) {
      entry.isLoading = false;
      entry.error = true;
      console.warn(`Failed to preload image: ${url}`, error);
      throw error;
    }
  }

  getFromCache(url: string): string | null {
    const entry = this.cache.get(url);
    if (entry && entry.objectUrl && !entry.error) {
      entry.lastAccessed = Date.now();
      return entry.objectUrl;
    }
    return null;
  }

  cleanupCache() {
    // Si excedemos el tamaño máximo, eliminar las más viejas
    if (this.cache.size > this.maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
      
      const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize);
      toRemove.forEach(([url, entry]) => {
        if (entry.objectUrl) {
          URL.revokeObjectURL(entry.objectUrl);
        }
        this.cache.delete(url);
      });
    }

    // Eliminar entradas expiradas
    const now = Date.now();
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.lastAccessed > this.maxAge) {
        if (entry.objectUrl) {
          URL.revokeObjectURL(entry.objectUrl);
        }
        this.cache.delete(url);
      }
    }
  }

  prefetchUrls(urls: string[], priority: 'high' | 'low' = 'low') {
    // Precargar imágenes en background
    const delay = priority === 'high' ? 0 : 100;
    
    urls.forEach((url, index) => {
      if (!this.cache.has(url)) {
        setTimeout(() => {
          this.preloadImage(url).catch(() => {
            // Falló silenciosamente
          });
        }, delay * index);
      }
    });
  }

  clear() {
    for (const [, entry] of this.cache.entries()) {
      if (entry.objectUrl) {
        URL.revokeObjectURL(entry.objectUrl);
      }
    }
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([url, entry]) => ({
        url,
        isLoading: entry.isLoading,
        error: entry.error,
        hasBlob: !!entry.blob,
        lastAccessed: entry.lastAccessed
      }))
    };
  }
}

// Singleton global
const imageCache = new ImageCacheManager();

export const useImageCache = () => {
  const abortControllerRef = useRef<AbortController>();

  const preloadImage = useCallback(async (url: string): Promise<string> => {
    // Cancelar cualquier operación anterior
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      return await imageCache.preloadImage(url);
    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Preload cancelled');
      }
      throw error;
    }
  }, []);

  const getCachedImage = useCallback((url: string): string | null => {
    return imageCache.getFromCache(url);
  }, []);

  const prefetchImages = useCallback((urls: string[], priority: 'high' | 'low' = 'low') => {
    imageCache.prefetchUrls(urls, priority);
  }, []);

  const getCacheStats = useCallback(() => {
    return imageCache.getStats();
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Cleanup periódico
  useEffect(() => {
    const interval = setInterval(() => {
      imageCache.cleanupCache();
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, []);

  return {
    preloadImage,
    getCachedImage,
    prefetchImages,
    getCacheStats,
    clearCache: imageCache.clear.bind(imageCache)
  };
};

// Hook específico para templates
export const useTemplateImageCache = (templates: any[]) => {
  const { prefetchImages } = useImageCache();

  useEffect(() => {
    // Extraer URLs de thumbnails
    const thumbnailUrls = templates
      .map(template => template.thumbnail)
      .filter(Boolean);

    if (thumbnailUrls.length > 0) {
      // Precargar con prioridad baja
      prefetchImages(thumbnailUrls, 'low');
    }
  }, [templates, prefetchImages]);
};

export { imageCache }; 