import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../shared/Header';
import { CompanySelect } from '../Posters/CompanySelect';
import { LocationSelect } from '../Posters/LocationSelect';
import { ArrowLeft, Monitor, Layout, MonitorPlay, Image as ImageIcon, Send, X, Check, ChevronLeft, ChevronRight, Maximize2, Minimize2, Video, ShoppingCart, Tablet, MonitorSmartphone, Layers, TouchpadOff } from 'lucide-react';
import { getEmpresas, getSucursalesPorEmpresa, type Empresa, type Sucursal } from '../../lib/supabaseClient-sucursales';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { supabaseAdmin } from '../../lib/supabaseClient-carteles';
import { motion, AnimatePresence } from 'framer-motion';

interface Company {
  id: string;
  name: string;
  logo: string;
}

type DeviceType = 'videowall' | 'caja-registradora' | 'self-checkout' | 'kiosko-digital' | 'tablet-carrito' | 'pantalla-interactiva' | 'punta-gondola';

interface Device {
  value: DeviceType;
  label: string;
  icon: React.ReactNode;
}

const devices: Device[] = [
  { 
    value: 'videowall', 
    label: 'Videowall', 
    icon: <Layers className="w-5 h-5" /> 
  },
  { 
    value: 'caja-registradora', 
    label: 'Pantalla de Caja Registradora', 
    icon: <Monitor className="w-5 h-5" /> 
  },
  { 
    value: 'self-checkout', 
    label: 'Self-Checkout (Caja de Autopago)', 
    icon: <ShoppingCart className="w-5 h-5" /> 
  },
  { 
    value: 'kiosko-digital', 
    label: 'Kiosco Digital', 
    icon: <MonitorSmartphone className="w-5 h-5" /> 
  },
  { 
    value: 'tablet-carrito', 
    label: 'Tablet/Pantalla en Carrito', 
    icon: <Tablet className="w-5 h-5" /> 
  },
  { 
    value: 'pantalla-interactiva', 
    label: 'Pantalla Interactiva', 
    icon: <TouchpadOff className="w-5 h-5" /> 
  },
  { 
    value: 'punta-gondola', 
    label: 'Punta de Góndola', 
    icon: <Layout className="w-5 h-5" /> 
  }
];

interface DigitalCarouselEditorProps {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
}

interface SelectedImage {
  url: string;
  name: string;
  type: 'image' | 'video';
  videoType?: 'local' | 'youtube';
}

const CarouselPreview: React.FC<{ 
  images: SelectedImage[];
  intervalTime: number;
  isFullscreen?: boolean;
  onFullscreenChange: (isFullscreen: boolean) => void;
}> = ({ 
  images, 
  intervalTime,
  isFullscreen = false,
  onFullscreenChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length <= 1) return;
    if (images[currentIndex].type === 'video') return; // No avanzar automáticamente en videos
    
    const timer = setInterval(nextSlide, intervalTime * 1000);
    return () => clearInterval(timer);
  }, [nextSlide, images.length, intervalTime, currentIndex, images]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      onFullscreenChange(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onFullscreenChange]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && carouselRef.current) {
        await carouselRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error al cambiar el modo pantalla completa:', error);
    }
  };

  // Manejar el final del video
  const handleVideoEnd = () => {
    if (images.length > 1) {
      nextSlide();
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  if (images.length === 0) return null;

  const currentItem = images[currentIndex];

  return (
    <div 
      ref={carouselRef}
      className={`relative bg-black overflow-hidden group
        ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full aspect-video rounded-lg'}`}
    >
      {/* Contenido del carrusel */}
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
                className={`${isFullscreen ? 'max-h-screen max-w-screen' : 'w-full h-full'} object-contain`}
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
                className={`${isFullscreen ? 'max-h-screen max-w-screen' : 'w-full h-full'} object-contain`}
                controls
                autoPlay
                onEnded={handleVideoEnd}
              />
            )}
          </div>
        ))}
      </div>

      {/* Controles de navegación */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicadores de posición */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex items-center justify-center transition-all duration-300
                  ${index === currentIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 w-2'} h-2 rounded-full hover:bg-white/75`}
              >
                {index === currentIndex && item.type === 'video' && (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Video className="w-3 h-3 text-blue-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Botón de pantalla completa */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>
    </div>
  );
};

interface SendingProgress {
  sucursal: string;
  devices: {
    type: DeviceType;
    status: 'pending' | 'sending' | 'success';
  }[];
}

export const DigitalCarouselEditor: React.FC<DigitalCarouselEditorProps> = ({
  onBack,
  onLogout,
  userEmail,
  userName
}) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedSucursales, setSelectedSucursales] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<DeviceType[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('20:00');
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [availableImages, setAvailableImages] = useState<SelectedImage[]>([]);
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [intervalTime, setIntervalTime] = useState<number>(3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<SendingProgress[]>([]);
  const [carouselUrl, setCarouselUrl] = useState<string>('');
  const [carouselId, setCarouselId] = useState<string>('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'local' | 'youtube'>('youtube');

  // Cargar empresas al montar el componente
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        setLoading(true);
        const data = await getEmpresas();
        setEmpresas(data);
      } catch (error) {
        console.error('Error al cargar empresas:', error);
        toast.error('Error al cargar las empresas');
      } finally {
        setLoading(false);
      }
    };

    loadEmpresas();
  }, []);

  // Cargar sucursales cuando se selecciona una empresa
  useEffect(() => {
    const loadSucursales = async () => {
      if (!selectedEmpresa) {
        setSucursales([]);
        return;
      }

      try {
        setLoading(true);
        const data = await getSucursalesPorEmpresa(parseInt(selectedEmpresa));
        setSucursales(data);
      } catch (error) {
        console.error('Error al cargar sucursales:', error);
        toast.error('Error al cargar las sucursales');
      } finally {
        setLoading(false);
      }
    };

    loadSucursales();
  }, [selectedEmpresa]);

  // Cargar imágenes disponibles del bucket de Supabase
  useEffect(() => {
    const loadImages = async () => {
      try {
        const { data: files, error } = await supabaseAdmin.storage
          .from('posters')
          .list();

        if (error) throw error;

        const images = files
          .filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i))
          .map(file => ({
            name: file.name,
            url: `${supabaseAdmin.storage.from('posters').getPublicUrl(file.name).data.publicUrl}`,
            type: 'image' as const
          }));

        setAvailableImages(images);
      } catch (error) {
        console.error('Error al cargar imágenes:', error);
        toast.error('Error al cargar las imágenes disponibles');
      }
    };

    loadImages();
  }, []);

  // Generar URL única cuando se seleccionan imágenes
  useEffect(() => {
    if (selectedImages.length > 0) {
      if (!carouselId) {
        // Generar un ID único para el carrusel solo si no existe
        const newCarouselId = Math.random().toString(36).substring(2, 15);
        setCarouselId(newCarouselId);
        setCarouselUrl(`${window.location.origin}/carousel/${newCarouselId}`);
      }
    } else {
      setCarouselId('');
      setCarouselUrl('');
    }
  }, [selectedImages, carouselId]);

  const handleCompanyChange = (newCompany: string) => {
    setSelectedEmpresa(newCompany);
    setSelectedSucursales([]);
  };

  const formatDeviceOption = ({ label, icon }: Device) => (
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
  );

  const handleSendCarousel = async () => {
    if (!selectedDevices.length || !selectedImages.length || !selectedSucursales.length) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    setShowSendModal(true);
    setSendingStatus('sending');

    try {
      // Guardar la información del carrusel en Supabase
      const { error } = await supabaseAdmin
        .from('carousels')
        .upsert({
          id: carouselId,
          images: selectedImages,
          interval_time: intervalTime,
          start_date: startDate || null,
          end_date: endDate || null,
          start_time: startTime || null,
          end_time: endTime || null,
          devices: selectedDevices,
          sucursales: selectedSucursales,
          empresa_id: selectedEmpresa,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Simular un tiempo de envío más largo (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 3500));

      setSendingStatus('success');
      setTimeout(() => {
        setShowSendModal(false);
        setSendingStatus('idle');
        toast.success('Carrusel guardado y enviado exitosamente');
      }, 2000);

    } catch (error) {
      console.error('Error al guardar el carrusel:', error);
      setSendingStatus('error');
      toast.error('Error al guardar el carrusel');
      setTimeout(() => {
        setShowSendModal(false);
        setSendingStatus('idle');
      }, 2000);
    }
  };

  const ImageModal = () => (
    <AnimatePresence>
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Seleccionar Imágenes</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto grid grid-cols-3 gap-4">
              {availableImages.map((image) => (
                <div
                  key={image.name}
                  className={`relative rounded-lg overflow-hidden cursor-pointer border-2 
                    ${selectedImages.some(i => i.name === image.name) 
                      ? 'border-blue-500' 
                      : 'border-transparent'}`}
                  onClick={() => {
                    if (selectedImages.some(i => i.name === image.name)) {
                      setSelectedImages(selectedImages.filter(i => i.name !== image.name));
                    } else {
                      setSelectedImages([...selectedImages, image]);
                    }
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-48 object-cover"
                  />
                  {selectedImages.some(i => i.name === image.name) && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Confirmar ({selectedImages.length})
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const VideoModal = () => (
    <AnimatePresence>
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-2xl w-full overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Agregar Video</h3>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setVideoUrl('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Video
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setVideoType('youtube')}
                    className={`px-4 py-2 rounded-md ${
                      videoType === 'youtube' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    URL de YouTube
                  </button>
                  <button
                    onClick={() => setVideoType('local')}
                    className={`px-4 py-2 rounded-md ${
                      videoType === 'local' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Video Local
                  </button>
                </div>
              </div>

              {videoType === 'youtube' ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    URL del Video
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Seleccionar Video
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setVideoUrl(url);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {videoUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vista Previa
                  </label>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    {videoType === 'youtube' ? (
                      <iframe
                        src={videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-full"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setVideoUrl('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (videoUrl) {
                    const videoName = videoType === 'youtube' 
                      ? `youtube-${new Date().getTime()}`
                      : `local-${new Date().getTime()}`;
                    
                    setSelectedImages([...selectedImages, {
                      url: videoUrl,
                      name: videoName,
                      type: 'video',
                      videoType
                    }]);
                    setShowVideoModal(false);
                    setVideoUrl('');
                  }
                }}
                disabled={!videoUrl}
                className={`px-4 py-2 rounded-md text-white ${
                  videoUrl 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Agregar Video
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const SendModal = () => (
    <AnimatePresence>
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-8 max-w-2xl w-full flex flex-col items-center"
          >
            {sendingStatus === 'sending' && (
              <div className="flex flex-col items-center space-y-6 w-full">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h3 className="text-xl font-medium mb-2">Enviando Carrusel</h3>
                <div className="w-full space-y-4">
                  {selectedSucursales.map((sucId, index) => {
                    const sucursal = sucursales.find(s => s.id.toString() === sucId);
                    return (
                      <motion.div
                        key={sucId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="font-medium">{sucursal?.direccion}</span>
                        </div>
                        <motion.div 
                          className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.2 + 0.2 }}
                        >
                          <motion.div
                            className="h-full bg-green-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ 
                              duration: 2,
                              delay: index * 0.2 + 0.4,
                              ease: "easeInOut"
                            }}
                          />
                        </motion.div>
                        <div className="grid grid-cols-2 gap-2 pl-4">
                          {selectedDevices.map((deviceType) => {
                            const device = devices.find(d => d.value === deviceType);
                            return (
                              <div key={deviceType} className="flex items-center gap-2 text-gray-600">
                                {device?.icon}
                                <span className="text-sm">{device?.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
            {sendingStatus === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-2">¡Enviado con Éxito!</h3>
                <p className="text-gray-500">
                  El carrusel ha sido configurado correctamente en todas las sucursales y dispositivos seleccionados.
                </p>
                <button
                  onClick={() => {
                    setShowSendModal(false);
                    setSendingStatus('idle');
                  }}
                  className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Cerrar
                </button>
              </motion.div>
            )}
            {sendingStatus === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                  <X className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-2">Error al Enviar</h3>
                <p className="text-gray-500">
                  Ha ocurrido un error al intentar guardar y enviar el carrusel. Por favor, inténtelo de nuevo.
                </p>
                <button
                  onClick={() => {
                    setShowSendModal(false);
                    setSendingStatus('idle');
                  }}
                  className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Cerrar
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const handleFullscreenChange = (fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
      <Header onBack={onBack} onLogout={onLogout} />
      <div className="min-h-screen flex flex-col bg-white">
        <main className="pt-10 px-6 pb-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-medium text-gray-900">Editor de Carrusel Digital</h2>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <CompanySelect
                  value={selectedEmpresa}
                  onChange={handleCompanyChange}
                  companies={empresas.map(empresa => ({
                    id: empresa.id.toString(),
                    name: empresa.nombre,
                    logo: empresa.logo
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sucursales
                </label>
                <LocationSelect
                  value={selectedSucursales}
                  onChange={setSelectedSucursales}
                  locations={sucursales.map(sucursal => ({
                    id: sucursal.id.toString(),
                    name: sucursal.direccion,
                    region: sucursal.nombre,
                    coordinates: [sucursal.latitud, sucursal.longitud],
                    address: sucursal.direccion
                  }))}
                  disabled={!selectedEmpresa}
                  isMulti={true}
                />
              </div>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}

            <div className="mt-8">
              {selectedEmpresa && selectedSucursales.length > 0 ? (
                <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Configuración del Carrusel
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Selector de Dispositivo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Dispositivo
                      </label>
                      <Select
                        isMulti
                        value={devices.filter(d => selectedDevices.includes(d.value))}
                        onChange={(options) => setSelectedDevices(options ? options.map(opt => opt.value) : [])}
                        options={devices}
                        formatOptionLabel={formatDeviceOption}
                        classNames={{
                          control: (state) => `${state.isFocused ? 'border-indigo-500' : ''}`,
                          option: () => "px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        }}
                        placeholder="Seleccionar dispositivos..."
                      />
                    </div>

                    {/* Fechas de Programación */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha Inicio
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha Fin
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          min={startDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {/* Horarios de Reproducción */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora Inicio
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora Fin
                        </label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Selector de tiempo por imagen */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiempo por imagen (segundos)
                      </label>
                      <Select
                        value={{ value: intervalTime, label: `${intervalTime} segundos` }}
                        onChange={(option) => setIntervalTime(option?.value || 3)}
                        options={[
                          { value: 2, label: '2 segundos' },
                          { value: 3, label: '3 segundos' },
                          { value: 5, label: '5 segundos' },
                          { value: 8, label: '8 segundos' },
                          { value: 10, label: '10 segundos' },
                        ]}
                        classNames={{
                          control: (state) => `${state.isFocused ? 'border-indigo-500' : ''}`,
                          option: () => "px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        }}
                      />
                    </div>
                  </div>

                  {/* Preview del Carrusel */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Previsualización del Carrusel
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <CarouselPreview 
                        images={selectedImages} 
                        intervalTime={intervalTime}
                        isFullscreen={isFullscreen}
                        onFullscreenChange={handleFullscreenChange}
                      />
                    </div>
                  </div>

                  {/* Sección de botones */}
                  <div className="col-span-full flex justify-end gap-4 mt-6">
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <ImageIcon className="w-5 h-5" />
                      Agregar Imágenes ({selectedImages.filter(item => item.type === 'image').length})
                    </button>
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Video className="w-5 h-5" />
                      Agregar Videos ({selectedImages.filter(item => item.type === 'video').length})
                    </button>
                    <button
                      onClick={handleSendCarousel}
                      disabled={!selectedDevices.length || !selectedImages.length || !selectedSucursales.length}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-white
                        ${(!selectedDevices.length || !selectedImages.length || !selectedSucursales.length)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      <Send className="w-5 h-5" />
                      Enviar
                    </button>
                  </div>

                  {/* Resumen actualizado */}
                  <div className="col-span-full mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Resumen de Configuración</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Sucursales seleccionadas: {selectedSucursales.length}</li>
                      <li>• Dispositivos: {selectedDevices.map(d => devices.find(dev => dev.value === d)?.label).join(', ') || 'No seleccionado'}</li>
                      <li>• Imágenes seleccionadas: {selectedImages.length}</li>
                      <li>• Período: {startDate ? `${startDate} al ${endDate}` : 'No configurado'}</li>
                      <li>• Horario: {`${startTime} a ${endTime}`}</li>
                      <li>• Tiempo por imagen: {intervalTime} segundos</li>
                      {carouselUrl && (
                        <li className="pt-2">
                          <span className="font-medium text-gray-900">• URL del Carrusel:</span>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={carouselUrl}
                              readOnly
                              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded bg-white"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(carouselUrl);
                                toast.success('URL copiada al portapapeles');
                              }}
                              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Copiar
                            </button>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-500">
                    {!selectedEmpresa 
                      ? 'Seleccione una empresa para comenzar'
                      : 'Seleccione al menos una sucursal para configurar el carrusel'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modales */}
        <ImageModal />
        <VideoModal />
        <SendModal />
      </div>
    </div>
  );
}; 