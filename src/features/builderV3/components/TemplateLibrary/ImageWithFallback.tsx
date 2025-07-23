// =====================================
// IMAGE WITH FALLBACK - TemplateLibrary SIMPLIFICADO
// =====================================

import React, { useState, useRef, useEffect } from 'react';
import { TemplateV3 } from '../../types';
import { Image as ImageIcon, FileText } from 'lucide-react';

interface ImageWithFallbackProps {
  template: TemplateV3;
  className?: string;
  aspectRatio?: 'card' | 'square' | 'wide';
  size?: 'small' | 'medium' | 'large';
  showRenderer?: boolean;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  template,
  className = '',
  aspectRatio = 'card',
  size = 'medium',
  showRenderer = true,
  lazy = true,
  onLoad,
  onError
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  // Manejar carga de imagen
  const handleImageLoad = () => {
    setLoadingState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    setLoadingState('error');
    onError?.();
  };

  // Empezar carga cuando thumbnail esté disponible e isInView
  useEffect(() => {
    if (template.thumbnail && isInView && loadingState === 'idle') {
      setLoadingState('loading');
    }
  }, [template.thumbnail, isInView, loadingState]);

  // 🔍 DEBUG: Ver por qué no muestra la imagen
  console.log(`🖼️ ImageWithFallback DEBUG for ${template.name}:`, {
    hasThumbnail: !!template.thumbnail,
    thumbnailUrl: template.thumbnail,
    isInView,
    loadingState
  });

  // Estilos de aspecto
  const aspectClasses = {
    card: 'aspect-[4/3]',
    square: 'aspect-square',
    wide: 'aspect-[16/9]'
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 ${aspectClasses[aspectRatio]} ${className}`}
    >
      {/* ============================================
          CASO 1: HAY THUMBNAIL - MOSTRAR IMAGEN REAL
          ============================================ */}
      {template.thumbnail && isInView && (
        <>
          {/* Skeleton mientras carga */}
          {loadingState === 'loading' && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]">
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          )}
          
          {/* Imagen real - COMPLETA SIN RECORTAR */}
          <img
            ref={imgRef}
            src={template.thumbnail}
            alt={template.name}
            className={`absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] object-contain transition-opacity duration-300 ${
              loadingState === 'loaded' ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={lazy ? 'lazy' : 'eager'}
          />
        </>
      )}

      {/* ============================================
          CASO 2: NO HAY THUMBNAIL - FALLBACK SIMPLE
          ============================================ */}
      {!template.thumbnail && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center p-4">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <div className="text-sm text-gray-500 font-medium">
              {template.name}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Sin vista previa
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          CASO 3: ERROR AL CARGAR - FALLBACK DE ERROR
          ============================================ */}
      {template.thumbnail && loadingState === 'error' && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ImageIcon className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-sm text-red-600 font-medium">
              Error al cargar
            </div>
            <div className="text-xs text-red-400 mt-1">
              {template.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export para mantener compatibilidad
export const shimmerKeyframes = `@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`; 