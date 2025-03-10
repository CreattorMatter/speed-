import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../shared/Header';
import { CompanySelect } from '../Posters/CompanySelect';
import { LocationSelect } from '../Posters/LocationSelect';
import { ArrowLeft, Monitor, Tv, Layout, MonitorPlay, Image as ImageIcon, Send, X, Check, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
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

type DeviceType = 'pantalla-caja' | 'punta-gondola' | 'lcd-publicitario' | 'wall-publicidad';

interface Device {
  value: DeviceType;
  label: string;
  icon: React.ReactNode;
}

const devices: Device[] = [
  { value: 'pantalla-caja', label: 'Pantalla de Caja', icon: <Monitor className="w-5 h-5" /> },
  { value: 'punta-gondola', label: 'Punta de Góndola', icon: <Layout className="w-5 h-5" /> },
  { value: 'lcd-publicitario', label: 'LCD Publicitario', icon: <Tv className="w-5 h-5" /> },
  { value: 'wall-publicidad', label: 'Wall Publicidad', icon: <MonitorPlay className="w-5 h-5" /> }
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

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length <= 1) return;
    
    const timer = setInterval(nextSlide, intervalTime * 1000);
    return () => clearInterval(timer);
  }, [nextSlide, images.length, intervalTime]);

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

  if (images.length === 0) return null;

  return (
    <div 
      ref={carouselRef}
      className={`relative bg-black overflow-hidden group
        ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full aspect-video rounded-lg'}`}
    >
      {/* Imágenes del carrusel */}
      <div className="relative w-full h-full flex items-center justify-center">
        {images.map((image, index) => (
          <div
            key={image.name}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out flex items-center justify-center
              ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={image.url}
              alt={image.name}
              className={`${isFullscreen ? 'max-h-screen max-w-screen' : 'w-full h-full'} object-contain`}
            />
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
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/50 hover:bg-white/75'}`}
              />
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
            url: `${supabaseAdmin.storage.from('posters').getPublicUrl(file.name).data.publicUrl}`
          }));

        setAvailableImages(images);
      } catch (error) {
        console.error('Error al cargar imágenes:', error);
        toast.error('Error al cargar las imágenes disponibles');
      }
    };

    loadImages();
  }, []);

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

    // Simular envío (aquí irá la lógica real de envío)
    setTimeout(() => {
      setSendingStatus('success');
      setTimeout(() => {
        setShowSendModal(false);
        setSendingStatus('idle');
        toast.success('Carrusel enviado exitosamente');
      }, 2000);
    }, 3000);
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

  const SendModal = () => (
    <AnimatePresence>
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-8 max-w-md w-full flex flex-col items-center"
          >
            {sendingStatus === 'sending' && (
              <>
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h3 className="text-lg font-medium mb-2">Enviando Carrusel</h3>
                <p className="text-gray-500 text-center">
                  Configurando el carrusel en las sucursales seleccionadas...
                </p>
              </>
            )}
            {sendingStatus === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-medium mb-2">¡Enviado con Éxito!</h3>
                <p className="text-gray-500 text-center">
                  El carrusel ha sido configurado correctamente
                </p>
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
                      Agregar Imágenes ({selectedImages.length})
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
        <SendModal />
      </div>
    </div>
  );
}; 