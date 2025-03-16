import React, { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import {
  X, Edit3, Save, Download, Search, Wand2, Layout,
  Image, Type, Palette, ChevronRight, ArrowLeft,
  MousePointer2, Layers, Grid3X3, PenTool, ImagePlus,
  TextSelect, Palette as ColorPalette, Move, ZoomIn,
  MonitorPlay, ShoppingCart, Tag, BarChart, Settings,
  Volume2, VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DetailedGuide {
  title: string;
  description: string;
  steps: {
    title: string;
    description: string;
    image?: string;
    tip?: string;
  }[];
  examples?: {
    title: string;
    image: string;
    description: string;
  }[];
  shortcuts?: {
    key: string;
    action: string;
  }[];
}

interface GuideItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  detailedGuide?: DetailedGuide;
}

interface GuideSection {
  title: string;
  items: GuideItem[];
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showingDetails, setShowingDetails] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleVideoEnd = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const sections = [
    {
      title: 'Bienvenido a SPID Plus',
      items: [
        {
          icon: <Layout className="w-5 h-5" />,
          title: 'Descripción General',
          description: 'Conoce la plataforma y sus módulos principales.',
          detailedGuide: {
            title: 'SPID Plus - Plataforma de Gestión de Carteles Físicos y Digitales',
            description: 'SPID Plus es una plataforma integral para la gestión de carteles físicos y digitales para retail, que consta de tres módulos principales y módulos complementarios que se integran con sistemas externos para extender las capacidades de la plataforma.',
            steps: [
              {
                title: 'Módulos Principales',
                description: 'La plataforma se compone de tres módulos core:',
                tip: 'Cada módulo está diseñado para una función específica pero trabajan en conjunto, Módulo de Contrucción de Carteles, Módulo de Carteles Digitales y Módulo de Builder.'
              },
              {
                title: '1. Editor de Carteles (PosterEditor)',
                description: 'Crea y gestiona carteles promocionales, ofertas y comunicaciones visuales para tu negocio.',
                tip: 'Ideal para promociones bancarias, descuentos y ofertas especiales.'
              },
              {
                title: '2. Cartelería Digital (DigitalCarouselEditor)',
                description: 'Gestiona contenido digital para pantallas y dispositivos en tienda, creando playlists dinámicas.',
                tip: 'Perfecto para videowalls, pantallas de caja y kioscos digitales.'
              },
              {
                title: '3. Constructor de Diseños (Builder)',
                description: 'Editor visual avanzado para crear diseños personalizados con múltiples elementos.',
                tip: 'Usa bloques predefinidos o crea tus propios diseños desde cero.'
              },
              {
                title: 'Módulos Complementarios',
                description: 'Sistemas integrados que potencian la funcionalidad:',
                tip: 'Estos módulos se conectan con sistemas externos para enriquecer las capacidades de la plataforma, por ejemplo nos conectamos a SAP para la analitica de los datos.'
              }
            ]
          }
        }
      ]
    },
    {
      title: 'Módulos Principales',
      items: [
        {
          icon: <Layout className="w-5 h-5" />,
          title: 'Editor de Carteles',
          description: 'Crea y gestiona carteles promocionales.',
          detailedGuide: {
            title: 'Editor de Carteles (PosterEditor)',
            description: 'Herramienta completa para la creación y gestión de carteles promocionales.',
            steps: [
              {
                title: 'Selección de Empresa y Promoción',
                description: 'Comienza seleccionando la empresa y el tipo de promoción. Filtra por categoría y banco.',
                tip: 'Usa los filtros para encontrar rápidamente lo que necesitas.'
              },
              {
                title: 'Gestión de Productos',
                description: 'Agrega y organiza productos en tu cartel. Filtra por categoría y selecciona múltiples productos.',
                tip: 'La vista en lista te permite ver más detalles de cada producto.'
              },
              {
                title: 'Personalización',
                description: 'Ajusta tamaño, orientación, zoom y escala. Controla la visibilidad de elementos.',
                tip: 'Usa los controles de zoom para una edición precisa.'
              },
              {
                title: 'Opciones de Financiación',
                description: 'Configura opciones de pago y promociones bancarias.',
                tip: 'Puedes combinar múltiples medios de pago.'
              },
              {
                title: 'Exportación y Distribución',
                description: 'Descarga, guarda y envía tus carteles a las sucursales.',
                tip: 'Los carteles se guardan en alta resolución para impresión.'
              }
            ],
            shortcuts: [
              { key: '⌘/Ctrl + S', action: 'Guardar cartel' },
              { key: '⌘/Ctrl + E', action: 'Exportar cartel' },
              { key: '⌘/Ctrl + Z', action: 'Deshacer último cambio' }
            ]
          }
        },
        {
          icon: <MonitorPlay className="w-5 h-5" />,
          title: 'Cartelería Digital',
          description: 'Gestiona contenido digital para pantallas.',
          detailedGuide: {
            title: 'Cartelería Digital (DigitalCarouselEditor)',
            description: 'Sistema de gestión de contenido digital para pantallas y dispositivos en tienda.',
            steps: [
              {
                title: 'Creación de Playlist',
                description: 'Crea listas de reproducción combinando imágenes y videos.',
                tip: 'Previsualiza tu playlist antes de publicar.'
              },
              {
                title: 'Gestión de Dispositivos',
                description: 'Administra diferentes tipos de pantallas: videowalls, cajas, kioscos, etc.',
                tip: 'Cada dispositivo puede tener contenido específico.'
              },
              {
                title: 'Programación',
                description: 'Define fechas y horarios de reproducción para cada contenido.',
                tip: 'Programa contenido específico para diferentes momentos del día.'
              },
              {
                title: 'Monitoreo',
                description: 'Supervisa el estado de tus dispositivos y contenido en tiempo real.',
                tip: 'Recibe notificaciones sobre el estado de la reproducción.'
              }
            ]
          }
        },
        {
          icon: <PenTool className="w-5 h-5" />,
          title: 'Constructor de Diseños',
          description: 'Crea diseños personalizados.',
          detailedGuide: {
            title: 'Constructor de Diseños (Builder)',
            description: 'Editor visual avanzado para crear diseños personalizados.',
            steps: [
              {
                title: 'Bloques de Construcción',
                description: 'Usa diferentes tipos de bloques para construir tu diseño.',
                tip: 'Los contenedores pueden anidar otros elementos.'
              },
              {
                title: 'Formato y Tamaño',
                description: 'Configura el formato de papel y orientación.',
                tip: 'Usa las guías para alinear elementos.'
              },
              {
                title: 'Generación con IA',
                description: 'Crea diseños automáticamente con inteligencia artificial.',
                tip: 'La IA aprende de tus preferencias de diseño.'
              }
            ],
            shortcuts: [
              { key: '⌘/Ctrl + D', action: 'Duplicar elemento' },
              { key: 'Delete', action: 'Eliminar elemento' },
              { key: 'Space + Drag', action: 'Mover vista' }
            ]
          }
        }
      ]
    },
    {
      title: 'Módulos Complementarios',
      items: [
        {
          icon: <ShoppingCart className="w-5 h-5" />,
          title: 'Productos',
          description: 'Gestión de productos y catálogo.',
          detailedGuide: {
            title: 'Sistema de Productos',
            description: 'Integración con sistemas de gestión de productos y catálogos.',
            steps: [
              {
                title: 'Catálogo de Productos',
                description: 'Accede a la base de datos de productos actualizada en tiempo real.',
                tip: 'Usa filtros avanzados para encontrar productos específicos.'
              },
              {
                title: 'Información de Productos',
                description: 'Visualiza precios, stock, descripciones y más.',
                tip: 'La información se sincroniza automáticamente.'
              }
            ]
          }
        },
        {
          icon: <Tag className="w-5 h-5" />,
          title: 'Promociones',
          description: 'Sistema de gestión de promociones.',
          detailedGuide: {
            title: 'Gestión de Promociones',
            description: 'Administra y configura promociones y ofertas.',
            steps: [
              {
                title: 'Tipos de Promociones',
                description: 'Configura descuentos, ofertas bancarias y promociones especiales.',
                tip: 'Programa promociones con fechas específicas.'
              },
              {
                title: 'Condiciones',
                description: 'Define reglas y condiciones para cada promoción.',
                tip: 'Establece límites y restricciones según necesites.'
              }
            ]
          }
        },
        {
          icon: <BarChart className="w-5 h-5" />,
          title: 'Analítica',
          description: 'Estadísticas y análisis de datos.',
          detailedGuide: {
            title: 'Sistema de Analítica',
            description: 'Monitorea y analiza el rendimiento de tus carteles y promociones.',
            steps: [
              {
                title: 'Métricas Clave',
                description: 'Visualiza estadísticas de uso y efectividad.',
                tip: 'Exporta reportes personalizados.'
              },
              {
                title: 'Seguimiento',
                description: 'Monitorea el impacto de tus campañas y promociones.',
                tip: 'Usa los datos para optimizar futuras campañas.'
              }
            ]
          }
        },
        {
          icon: <Settings className="w-5 h-5" />,
          title: 'Configuración',
          description: 'Ajustes y personalización del sistema.',
          detailedGuide: {
            title: 'Configuración del Sistema',
            description: 'Personaliza y configura todos los aspectos de SPID Plus.',
            steps: [
              {
                title: 'Ajustes Generales',
                description: 'Configura preferencias globales del sistema.',
                tip: 'Personaliza según las necesidades de tu empresa.'
              },
              {
                title: 'Gestión de Usuarios',
                description: 'Administra permisos y roles de usuario.',
                tip: 'Asigna permisos específicos por módulo.'
              },
              {
                title: 'Integraciones',
                description: 'Configura conexiones con sistemas externos.',
                tip: 'Mantén tus datos sincronizados automáticamente.'
              }
            ]
          }
        }
      ]
    }
  ];

  const renderDetailedView = (guide: DetailedGuide) => (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{guide.title}</h2>
        <p className="mt-2 text-gray-600">{guide.description}</p>
      </div>

      <div className="space-y-6">
        {guide.steps.map((step, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
                {step.tip && (
                  <div className="mt-3 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
                    💡 Tip: {step.tip}
                  </div>
                )}
                {step.image && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                    <img src={step.image} alt={step.title} className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {guide.examples && (
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ejemplos</h3>
          <div className="grid grid-cols-2 gap-6">
            {guide.examples.map((example, index) => (
              <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                <img src={example.image} alt={example.title} className="w-full" />
                <div className="p-4">
                  <h4 className="font-medium text-gray-900">{example.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">{example.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {guide.shortcuts && (
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atajos de Teclado</h3>
          <div className="grid grid-cols-2 gap-4">
            {guide.shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <code className="px-2 py-1 bg-white border border-gray-200 rounded text-sm font-mono">
                  {shortcut.key}
                </code>
                <span className="text-sm text-gray-600">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center pt-8 pb-4 flex-shrink-0 bg-white">
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer" onClick={handleVideoClick}>
              <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
                src="/public/video/hombre.mp4"
                autoPlay
                muted={isMuted}
                playsInline
                onEnded={handleVideoEnd}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-gray-600" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {showingDetails && (
                  <button
                    onClick={() => setShowingDetails(false)}
                    className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  {showingDetails ? selectedItem : '📖 Guía de Uso'}
                </Dialog.Title>
              </div>
            </div>

            <div className="px-6 py-4">
              <AnimatePresence mode="wait">
                {!showingDetails ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8 pb-6"
                  >
                    {sections.map((section, index) => (
                      <div key={index} className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {section.title}
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {section.items.map((item, itemIndex) => (
                            <motion.button
                              key={itemIndex}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedItem(item.title);
                                setShowingDetails(true);
                              }}
                              className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-all text-left w-full group"
                            >
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                {item.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900">
                                    {item.title}
                                  </h4>
                                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  {item.description}
                                </p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="pb-6"
                  >
                    {sections.map(section =>
                      section.items.find(item => item.title === selectedItem)?.detailedGuide &&
                      renderDetailedView(section.items.find(item => item.title === selectedItem)!.detailedGuide!)
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 