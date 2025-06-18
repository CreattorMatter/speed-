import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PosterPreview } from '../../posters/components/Posters/PosterPreview';
import { ChevronLeft, ChevronRight, Settings, Maximize2, Minimize2 } from 'lucide-react';

interface DigitalSignageViewProps {
  // Props si necesitas
}

export const DigitalSignageView: React.FC<DigitalSignageViewProps> = () => {
  const [currentPosterData, setCurrentPosterData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalTime, setIntervalTime] = useState(5000); // 5 segundos por defecto
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1.2);

  useEffect(() => {
    // Recuperar datos del poster del sessionStorage
    const savedPosterData = sessionStorage.getItem('currentPosterData');
    if (savedPosterData) {
      setCurrentPosterData(JSON.parse(savedPosterData));
    }
  }, []);

  useEffect(() => {
    let timer: number | undefined;

    if (isPlaying && currentPosterData?.products?.length > 0) {
      timer = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % currentPosterData.products.length);
      }, intervalTime);
    }

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [isPlaying, intervalTime, currentPosterData]);

  const handlePrevious = () => {
    if (!currentPosterData?.products?.length) return;
    setCurrentIndex((prev) => 
      prev === 0 ? currentPosterData.products.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!currentPosterData?.products?.length) return;
    setCurrentIndex((prev) => (prev + 1) % currentPosterData.products.length);
  };

  // Función para manejar la pantalla completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setScale(1.8); // Aumentamos la escala en pantalla completa
      }).catch(err => {
        console.error('Error al intentar pantalla completa:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        setScale(1.2); // Volvemos a la escala normal
      }).catch(err => {
        console.error('Error al salir de pantalla completa:', err);
      });
    }
  };

  // Escuchar cambios en el estado de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!currentPosterData) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Área principal del carrusel */}
      <div className="relative h-screen flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full h-full flex items-center justify-center"
            style={{
              maxWidth: '100vw',
              maxHeight: '100vh',
              overflow: 'hidden'
            }}
          >
            <motion.div 
              className="relative"
              animate={{ 
                scale,
                transition: { duration: 0.3, ease: "easeInOut" }
              }}
            >
              <PosterPreview
                product={currentPosterData.products[currentIndex]}
                promotion={currentPosterData.promotion}
                company={currentPosterData.company}
                showTopLogo={currentPosterData.showLogo}
                selectedFormat={{ 
                  id: 'digital', 
                  width: isFullscreen ? '1920px' : '1280px',
                  height: isFullscreen ? '1080px' : '720px',
                  name: 'Digital' 
                }}
                zoom={1}
                cardSize={1}
                financing={currentPosterData.financing}
                hideGrid={true}
                fullscreen={isFullscreen}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Controles */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <select
                value={intervalTime}
                onChange={(e) => setIntervalTime(Number(e.target.value))}
                className="bg-white/10 text-white border-none rounded p-2"
              >
                <option value={1000}>1 segundo</option>
                <option value={3000}>3 segundos</option>
                <option value={5000}>5 segundos</option>
                <option value={10000}>10 segundos</option>
              </select>

              {/* Botón de pantalla completa */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <span className="text-white">
                {currentIndex + 1} / {currentPosterData.products.length}
              </span>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botón para mostrar/ocultar controles */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
}; 