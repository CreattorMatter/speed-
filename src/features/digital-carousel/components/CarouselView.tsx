import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabaseAdmin } from '../../../lib/supabaseClient-carteles';
import { Video } from 'lucide-react';

interface SelectedImage {
  url: string;
  name: string;
  type: 'image' | 'video';
  videoType?: 'local' | 'youtube';
  duration: number;
}

interface CarouselData {
  id: string;
  name: string;
  images: SelectedImage[];
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

export const CarouselView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cargar datos del carrusel
  useEffect(() => {
    const loadCarousel = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseAdmin
          .from('carousels')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Playlist no encontrada');

        // Verificar si la playlist está dentro del período configurado
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const startDate = data.start_date ? new Date(data.start_date) : null;
        const endDate = data.end_date ? new Date(data.end_date) : null;
        const [startHours, startMinutes] = (data.start_time || '00:00').split(':').map(Number);
        const [endHours, endMinutes] = (data.end_time || '23:59').split(':').map(Number);
        const startTimeMinutes = startHours * 60 + startMinutes;
        const endTimeMinutes = endHours * 60 + endMinutes;

        // Verificar si está dentro del rango de fechas
        if (startDate && now < startDate) {
          throw new Error('Esta playlist aún no está disponible');
        }
        if (endDate && now > endDate) {
          throw new Error('Esta playlist ya no está disponible');
        }

        // Verificar si está dentro del horario configurado
        if (currentTime < startTimeMinutes || currentTime > endTimeMinutes) {
          throw new Error(`Esta playlist solo está disponible de ${data.start_time} a ${data.end_time}`);
        }

        setCarouselData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la playlist');
      } finally {
        setLoading(false);
      }
    };

    loadCarousel();
  }, [id]);

  const nextSlide = useCallback(() => {
    if (!carouselData?.images.length) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselData.images.length);
  }, [carouselData?.images.length]);

  const handleVideoEnd = () => {
    nextSlide();
  };

  const handleVideoTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const currentItem = carouselData?.images[currentIndex];
    
    if (currentItem?.type === 'video' && video.currentTime >= currentItem.duration) {
      video.currentTime = 0;
      nextSlide();
    }
  };

  useEffect(() => {
    if (!carouselData?.images.length) return;
    if (!carouselData.images[currentIndex]) return;
    const currentItem = carouselData.images[currentIndex];
    
    // Si es video de YouTube, configuramos un temporizador basado en la duración
    if (currentItem.type === 'video' && currentItem.videoType === 'youtube') {
      const timer = setTimeout(nextSlide, currentItem.duration * 1000);
      return () => clearTimeout(timer);
    }
    
    // Si es imagen, usamos la duración configurada
    if (currentItem.type === 'image') {
      const timer = setInterval(nextSlide, currentItem.duration * 1000);
      return () => clearInterval(timer);
    }
    
    // Para videos locales, el manejo se hace a través de onTimeUpdate
  }, [nextSlide, carouselData?.images, currentIndex]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (error || !carouselData) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error || 'No se pudo cargar la playlist'}</p>
        </div>
      </div>
    );
  }

  const currentItem = carouselData.images[currentIndex];

  return (
    <div className="fixed inset-0 bg-black">
      <div className="relative w-full h-full flex items-center justify-center">
        {carouselData.images.map((item, index) => (
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
                ref={videoRef}
                src={item.url}
                className="max-h-screen max-w-screen object-contain"
                controls={false}
                autoPlay
                muted
                onEnded={handleVideoEnd}
                onTimeUpdate={handleVideoTimeUpdate}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 