import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabaseAdmin } from '../../lib/supabaseClient-carteles';

interface CarouselViewProps {
  carouselId: string;
}

interface CarouselImage {
  url: string;
  name: string;
  type: 'image' | 'video';
  videoType?: 'local' | 'youtube';
}

interface CarouselData {
  images: CarouselImage[];
  interval_time: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
}

export const CarouselView: React.FC<CarouselViewProps> = ({ carouselId }) => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intervalTime, setIntervalTime] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar datos del carrusel
  useEffect(() => {
    const loadCarouselData = async () => {
      try {
        setLoading(true);
        
        // Obtener la información del carrusel desde Supabase
        const { data: carouselData, error: carouselError } = await supabaseAdmin
          .from('carousels')
          .select('*')
          .eq('id', carouselId)
          .single();

        if (carouselError) throw carouselError;
        if (!carouselData) throw new Error('Carrusel no encontrado');

        // Verificar si el carrusel está dentro del período de visualización
        const now = new Date();
        const currentTime = now.toLocaleTimeString('es-ES', { hour12: false });
        const currentDate = now.toISOString().split('T')[0];

        if (carouselData.start_date && carouselData.end_date) {
          if (currentDate < carouselData.start_date || currentDate > carouselData.end_date) {
            setError('Este carrusel no está disponible en la fecha actual');
            setLoading(false);
            return;
          }
        }

        if (carouselData.start_time && carouselData.end_time) {
          if (currentTime < carouselData.start_time || currentTime > carouselData.end_time) {
            setError('Este carrusel no está disponible en el horario actual');
            setLoading(false);
            return;
          }
        }

        setIntervalTime(carouselData.interval_time || 3);
        setImages(carouselData.images || []);

        // Activar pantalla completa automáticamente
        if (containerRef.current) {
          try {
            const element = containerRef.current;
            if (element.requestFullscreen) {
              await element.requestFullscreen();
            } else if ((element as any).webkitRequestFullscreen) {
              await (element as any).webkitRequestFullscreen();
            } else if ((element as any).msRequestFullscreen) {
              await (element as any).msRequestFullscreen();
            }
          } catch (error) {
            console.error('Error al activar pantalla completa:', error);
          }
        }

      } catch (err) {
        setError('Error al cargar las imágenes del carrusel, debe Guardar el carrusel previo a usar la URL');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCarouselData();
  }, [carouselId]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const timer = setInterval(nextSlide, intervalTime * 1000);
    return () => clearInterval(timer);
  }, [nextSlide, images.length, intervalTime]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl text-center px-4">{error}</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-xl">No hay imágenes disponibles</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
    >
      {/* Imágenes del carrusel */}
      <div className="relative w-full h-full flex items-center justify-center">
        {images.map((item, index) => (
          <div
            key={item.name}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out flex items-center justify-center
              ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.name}
                className="max-h-screen max-w-screen object-contain"
              />
            ) : item.videoType === 'youtube' ? (
              <iframe
                src={`${item.url.replace('watch?v=', 'embed/')}?autoplay=1&mute=1`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video
                src={item.url}
                className="max-h-screen max-w-screen object-contain"
                controls
                autoPlay
                onEnded={() => {
                  if (images.length > 1) {
                    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
                  } else {
                    const video = document.querySelector('video');
                    if (video) {
                      video.currentTime = 0;
                      video.play();
                    }
                  }
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Indicadores de posición */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300
                ${index === currentIndex 
                  ? 'bg-white w-4' 
                  : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 